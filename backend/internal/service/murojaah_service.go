package service

import (
	"context"
	"fmt"

	"github.com/fifa-team/hifzhly-backend/internal/evaluator"
	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/repository"
	"github.com/fifa-team/hifzhly-backend/internal/srs"
)

type MurojaahService interface {
	EvaluateText(ctx context.Context, userID string, surahNumber, ayahNumber int, userText string) (*model.EvaluationResponse, error)
	EvaluateAudio(ctx context.Context, userID string, surahNumber, ayahNumber int, audioBytes []byte, mimeType string, userTextFallback string) (*model.EvaluationResponse, error)
	GetDueToday(ctx context.Context, userID string) (*model.SrsTodayResponse, error)
}

type murojaahServiceImpl struct {
	quranService  QuranService
	geminiService GeminiService
	repo          repository.MurojaahRepository
}

func NewMurojaahService(
	quranService QuranService,
	geminiService GeminiService,
	repo repository.MurojaahRepository,
) MurojaahService {
	return &murojaahServiceImpl{
		quranService:  quranService,
		geminiService: geminiService,
		repo:          repo,
	}
}

func (s *murojaahServiceImpl) EvaluateText(ctx context.Context, userID string, surahNumber, ayahNumber int, userText string) (*model.EvaluationResponse, error) {
	return s.EvaluateAudio(ctx, userID, surahNumber, ayahNumber, nil, "", userText)
}

func (s *murojaahServiceImpl) EvaluateAudio(
	ctx context.Context,
	userID string,
	surahNumber, ayahNumber int,
	audioBytes []byte,
	mimeType string,
	userTextFallback string,
) (*model.EvaluationResponse, error) {
	// 1. Ambil teks referensi ayat resmi dari EQuran.id
	surahDetail, err := s.quranService.GetSurahDetail(surahNumber)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil referensi surah %d: %w", surahNumber, err)
	}

	var referenceText string
	for _, a := range surahDetail.Ayahs {
		if a.AyahNumber == ayahNumber {
			referenceText = a.TextArabic
			break
		}
	}

	if referenceText == "" {
		return nil, fmt.Errorf("ayat %d pada surah %d tidak ditemukan", ayahNumber, surahNumber)
	}

	// 2. Transkripsi suara via Gemini AI Voice Pipeline
	transcribedText := userTextFallback
	durationMs := 3000

	if len(audioBytes) > 0 && s.geminiService != nil {
		aiTranscript, err := s.geminiService.TranscribeQuranAudio(ctx, audioBytes, mimeType, referenceText)
		if err == nil && aiTranscript != "" {
			transcribedText = aiTranscript
		}
		// Estimasi durasi audio (approx ~16KB per detik untuk webm opus)
		if len(audioBytes) > 1000 {
			durationMs = (len(audioBytes) / 16)
			if durationMs < 1000 {
				durationMs = 1500
			}
		}
	}

	if transcribedText == "" {
		transcribedText = referenceText
	}

	// 3. Evaluasi bacaan dengan algoritma Levenshtein kata demi kata
	evalResult := evaluator.EvaluateRecitation(referenceText, transcribedText)

	// 4. Hitung interval Spaced Repetition (SuperMemo-2)
	initialState := srs.SrsState{
		RepetitionCount: 0,
		IntervalDays:    1,
		EaseFactor:      2.50,
	}
	srsUpdate := srs.CalculateNextReview(initialState, evalResult.Score)

	resp := &model.EvaluationResponse{
		EvaluationID:    fmt.Sprintf("eval-%d-%d", surahNumber, ayahNumber),
		SurahNumber:     surahNumber,
		AyahNumber:      ayahNumber,
		Score:           evalResult.Score,
		TranscribedText: evalResult.TranscribedText,
		ReferenceText:   referenceText,
		AudioDurationMs: durationMs,
		Substitutions:   evalResult.Substitutions,
		Deletions:       evalResult.Deletions,
		Insertions:      evalResult.Insertions,
		WordDiff:        evaluator.ConvertToModelDiff(evalResult.WordDiff),
		SrsUpdate:       srsUpdate,
	}

	// 5. Simpan ke database PostgreSQL (murojaah_sessions, murojaah_evaluations, ayah_memory_states)
	if s.repo != nil {
		sessionID, sessErr := s.repo.GetOrCreateSession(ctx, userID, surahNumber)
		if sessErr == nil {
			_ = s.repo.SaveEvaluation(ctx, resp, sessionID, userID)
		}
		_ = s.repo.UpsertAyahMemoryState(ctx, userID, surahNumber, ayahNumber, srsUpdate, evalResult.Score)
	}

	return resp, nil
}

func (s *murojaahServiceImpl) GetDueToday(ctx context.Context, userID string) (*model.SrsTodayResponse, error) {
	if s.repo == nil {
		return &model.SrsTodayResponse{
			TotalDue: 0,
			Items:    []model.SrsDueItem{},
		}, nil
	}

	items, err := s.repo.GetDueAyahs(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &model.SrsTodayResponse{
		TotalDue: len(items),
		Items:    items,
	}, nil
}
