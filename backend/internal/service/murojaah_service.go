package service

import (
	"context"
	"fmt"

	"github.com/fifa-team/hifzhly-backend/internal/evaluator"
	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/srs"
)

type MurojaahService interface {
	EvaluateText(ctx context.Context, surahNumber, ayahNumber int, userText string) (*model.EvaluationResponse, error)
}

type murojaahServiceImpl struct {
	quranService QuranService
}

func NewMurojaahService(quranService QuranService) MurojaahService {
	return &murojaahServiceImpl{quranService: quranService}
}

func (s *murojaahServiceImpl) EvaluateText(ctx context.Context, surahNumber, ayahNumber int, userText string) (*model.EvaluationResponse, error) {
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

	// 2. Evaluasi bacaan dengan algoritma Levenshtein kata demi kata
	evalResult := evaluator.EvaluateRecitation(referenceText, userText)

	// 3. Hitung proyeksi jadwal Spaced Repetition (SRS)
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
		AudioDurationMs: 3000,
		Substitutions:   evalResult.Substitutions,
		Deletions:       evalResult.Deletions,
		Insertions:      evalResult.Insertions,
		WordDiff:        evaluator.ConvertToModelDiff(evalResult.WordDiff),
		SrsUpdate:       srsUpdate,
	}

	return resp, nil
}

