package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/repository"
)

type QuizService struct {
	quizRepo   *repository.QuizRepository
	nvidiaKey  string
	httpClient *http.Client
}

func NewQuizService(quizRepo *repository.QuizRepository, nvidiaKey string) *QuizService {
	if nvidiaKey == "" {
		nvidiaKey = "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"
	}
	return &QuizService{
		quizRepo:  quizRepo,
		nvidiaKey: nvidiaKey,
		httpClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

func (s *QuizService) SubmitScore(ctx context.Context, userID string, req model.SubmitQuizScoreRequest) (*model.QuizScore, error) {
	if userID == "" {
		return nil, fmt.Errorf("user ID tidak valid")
	}

	monthKey := time.Now().Format("2006-01")

	scoreItem := &model.QuizScore{
		UserID:         userID,
		Mode:           req.Mode,
		JuzStart:       req.JuzStart,
		JuzEnd:         req.JuzEnd,
		TotalQuestions: req.TotalQuestions,
		CorrectAnswers: req.CorrectAnswers,
		Score:          req.Score,
		MonthKey:       monthKey,
	}

	if err := s.quizRepo.SaveScore(ctx, scoreItem); err != nil {
		return nil, fmt.Errorf("gagal mencatat skor kuis: %w", err)
	}

	return scoreItem, nil
}

func (s *QuizService) GetLeaderboard(ctx context.Context, monthKey string) ([]model.LeaderboardEntry, error) {
	if monthKey == "" {
		monthKey = time.Now().Format("2006-01")
	}
	return s.quizRepo.GetMonthlyLeaderboard(ctx, monthKey, 10)
}

// AskAITutor memanggil NVIDIA Nemotron LLM sebagai asisten pembimbing tajwid santri
func (s *QuizService) AskAITutor(ctx context.Context, question string, contextInfo string) (*model.AITutorResponse, error) {
	question = strings.TrimSpace(question)
	if question == "" {
		return nil, fmt.Errorf("pertanyaan tidak boleh kosong")
	}

	systemPrompt := `Anda adalah "Ustaz AI Tajwid", asisten pembimbing ilmu tajwid Al-Qur'an pada platform Hifzhly.
Karakter Anda: Sangat santun, berilmu mendalam, khusyu', berpatokan pada kaidah qira'at riwayat Hafsh 'an 'Ashim jalur Asy-Syathibiyyah (Matn Al-Jazariyyah & Tuhfatul Athfal).
Tugas:
1. Berikan penjelasan hukum tajwid, makharijul huruf, atau sifatul huruf dengan lugas, mudah dipahami santri, dan berikan contoh lafal ayat Al-Qur'an jika relevan.
2. JANGAN gunakan emoji apapun dalam respons (kebijakan anti-slop). Gunakan tanda baca dan pemformatan markdown yang bersih.
3. Jaga nada bicara tetap ilmiah, mendidik, dan memotivasi santri dalam menjaga kalamullah.`

	messages := []map[string]string{
		{"role": "system", "content": systemPrompt},
	}

	if contextInfo != "" {
		messages = append(messages, map[string]string{
			"role":    "system",
			"content": fmt.Sprintf("Konteks materi yang sedang dipelajari santri: %s", contextInfo),
		})
	}

	messages = append(messages, map[string]string{
		"role":    "user",
		"content": question,
	})

	payload := map[string]interface{}{
		"model":             "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
		"messages":          messages,
		"max_tokens":        2048,
		"temperature":       0.6,
		"top_p":             0.95,
		"stream":            false,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal request gagal: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://integrate.api.nvidia.com/v1/chat/completions", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("buat http request gagal: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.nvidiaKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("koneksi ke AI Tutor NVIDIA gagal: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("NVIDIA API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var nvidiaResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&nvidiaResp); err != nil {
		return nil, fmt.Errorf("decode respon AI gagal: %w", err)
	}

	if len(nvidiaResp.Choices) == 0 || nvidiaResp.Choices[0].Message.Content == "" {
		return nil, fmt.Errorf("tidak ada jawaban dari model AI")
	}

	answerText := nvidiaResp.Choices[0].Message.Content

	return &model.AITutorResponse{
		Answer:    answerText,
		Source:    "NVIDIA Nemotron Reasoning",
		Timestamp: time.Now().Format(time.RFC3339),
	}, nil
}
