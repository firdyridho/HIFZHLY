package service

import (
	"context"
	"errors"
	"math"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/repository"
)

type TajwidService interface {
	GetModules(ctx context.Context) ([]model.TajwidModule, error)
	GetModuleDetail(ctx context.Context, slug string) (*model.TajwidModule, *model.TajwidQuiz, error)
	SubmitQuiz(ctx context.Context, userID, quizID string, req model.QuizSubmissionRequest) (*model.QuizSubmissionResponse, error)
	CreateModule(ctx context.Context, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error)
	UpdateModule(ctx context.Context, id string, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error)
	DeleteModule(ctx context.Context, id string) error
	SaveQuiz(ctx context.Context, moduleID string, req model.CreateOrUpdateQuizRequest) (*model.TajwidQuiz, error)
	GenerateAIQuiz(ctx context.Context, req model.GenerateAIQuizRequest) (*model.GenerateAIQuizResponse, error)
}

type tajwidService struct {
	repo   repository.TajwidRepository
	gemini GeminiService
}

func NewTajwidService(repo repository.TajwidRepository, gemini GeminiService) TajwidService {
	return &tajwidService{repo: repo, gemini: gemini}
}

func (s *tajwidService) GetModules(ctx context.Context) ([]model.TajwidModule, error) {
	return s.repo.GetAllModules(ctx)
}

func (s *tajwidService) GetModuleDetail(ctx context.Context, slug string) (*model.TajwidModule, *model.TajwidQuiz, error) {
	mod, err := s.repo.GetModuleBySlug(ctx, slug)
	if err != nil {
		return nil, nil, err
	}
	if mod == nil {
		return nil, nil, errors.New("modul tajwid tidak ditemukan")
	}

	quiz, _ := s.repo.GetQuizByModuleID(ctx, mod.ID)
	if quiz != nil {
		// Sembunyikan isCorrect dari santri saat kuis disajikan
		sanitizedQuiz := *quiz
		sanitizedQuestions := make([]model.QuizQuestion, len(quiz.Questions))
		for i, q := range quiz.Questions {
			sq := q
			sq.Explanation = "" // Sembunyikan penjelasan sampai kuis selesai
			sanitizedOptions := make([]model.QuizOption, len(q.Options))
			for j, opt := range q.Options {
				sopt := opt
				sopt.IsCorrect = false
				sopt.OptionExplanation = ""
				sanitizedOptions[j] = sopt
			}
			sq.Options = sanitizedOptions
			sanitizedQuestions[i] = sq
		}
		sanitizedQuiz.Questions = sanitizedQuestions
		return mod, &sanitizedQuiz, nil
	}

	return mod, nil, nil
}

func (s *tajwidService) SubmitQuiz(ctx context.Context, userID, quizID string, req model.QuizSubmissionRequest) (*model.QuizSubmissionResponse, error) {
	quiz, err := s.repo.GetQuizByID(ctx, quizID)
	if err != nil || quiz == nil {
		return nil, errors.New("kuis tajwid tidak ditemukan")
	}

	// Buat map jawaban yang dikirim santri
	userAnswersMap := make(map[string]string)
	for _, ans := range req.Answers {
		userAnswersMap[ans.QuestionID] = ans.SelectedOptionID
	}

	totalQuestions := len(quiz.Questions)
	if totalQuestions == 0 {
		return nil, errors.New("kuis belum memiliki butir pertanyaan")
	}

	correctCount := 0
	var reviews []model.QuestionReviewItem

	for _, q := range quiz.Questions {
		selectedOptID := userAnswersMap[q.ID]
		var correctOptID string

		// Cari opsi yang benar
		for _, opt := range q.Options {
			if opt.IsCorrect {
				correctOptID = opt.ID
				break
			}
		}

		isCorrect := (selectedOptID != "" && selectedOptID == correctOptID)
		if isCorrect {
			correctCount++
		}

		reviews = append(reviews, model.QuestionReviewItem{
			QuestionID:       q.ID,
			QuestionText:     q.QuestionText,
			SelectedOptionID: selectedOptID,
			CorrectOptionID:  correctOptID,
			IsCorrect:        isCorrect,
			Explanation:      q.Explanation,
		})
	}

	score := math.Round((float64(correctCount)/float64(totalQuestions))*10000) / 100
	passed := score >= float64(quiz.PassingScore)

	// Simpan riwayat pengerjaan kuis ke database jika userID ada
	if userID != "" {
		_ = s.repo.SaveQuizAttempt(ctx, userID, quiz.ID, score, totalQuestions, correctCount)
	}

	return &model.QuizSubmissionResponse{
		QuizID:         quiz.ID,
		Score:          score,
		TotalQuestions: totalQuestions,
		CorrectAnswers: correctCount,
		Passed:         passed,
		PassingScore:   quiz.PassingScore,
		Reviews:        reviews,
	}, nil
}

func (s *tajwidService) CreateModule(ctx context.Context, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error) {
	if req.Title == "" || req.Slug == "" {
		return nil, errors.New("judul dan slug modul wajib diisi")
	}
	return s.repo.CreateModule(ctx, req)
}

func (s *tajwidService) UpdateModule(ctx context.Context, id string, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error) {
	if req.Title == "" || req.Slug == "" {
		return nil, errors.New("judul dan slug modul wajib diisi")
	}
	return s.repo.UpdateModule(ctx, id, req)
}

func (s *tajwidService) DeleteModule(ctx context.Context, id string) error {
	return s.repo.DeleteModule(ctx, id)
}

func (s *tajwidService) SaveQuiz(ctx context.Context, moduleID string, req model.CreateOrUpdateQuizRequest) (*model.TajwidQuiz, error) {
	if req.Title == "" {
		return nil, errors.New("judul kuis wajib diisi")
	}
	return s.repo.UpsertQuizWithQuestions(ctx, moduleID, req)
}

func (s *tajwidService) GenerateAIQuiz(ctx context.Context, req model.GenerateAIQuizRequest) (*model.GenerateAIQuizResponse, error) {
	if req.Topic == "" {
		return nil, errors.New("topik materi kuis wajib diisi")
	}
	if s.gemini == nil {
		return nil, errors.New("layanan AI tidak tersedia")
	}
	return s.gemini.GenerateTajwidQuiz(ctx, req)
}

