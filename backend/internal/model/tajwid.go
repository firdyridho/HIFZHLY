package model

import "time"

// TajwidModule merepresentasikan materi pembelajaran hukum tajwid
type TajwidModule struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Slug           string    `json:"slug"`
	Summary        string    `json:"summary"`
	ContentBody    string    `json:"contentBody,omitempty"`
	YoutubeVideoID string    `json:"youtubeVideoId"`
	OrderIndex     int       `json:"orderIndex"`
	IsActive       bool      `json:"isActive"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// TajwidQuiz merepresentasikan kuis evaluasi untuk suatu modul tajwid
type TajwidQuiz struct {
	ID           string         `json:"id"`
	ModuleID     string         `json:"moduleId"`
	Title        string         `json:"title"`
	Description  string         `json:"description"`
	PassingScore int            `json:"passingScore"`
	Questions    []QuizQuestion `json:"questions,omitempty"`
}

// QuizQuestion merepresentasikan butir soal kuis
type QuizQuestion struct {
	ID              string       `json:"id"`
	QuizID          string       `json:"quizId"`
	QuestionText    string       `json:"questionText"`
	AudioSampleURL  string       `json:"audioSampleUrl,omitempty"`
	Explanation     string       `json:"explanation"`
	OrderIndex      int          `json:"orderIndex"`
	Options         []QuizOption `json:"options"`
}

// QuizOption merepresentasikan pilihan ganda butir soal
type QuizOption struct {
	ID                string `json:"id"`
	QuestionID        string `json:"questionId"`
	OptionText        string `json:"optionText"`
	IsCorrect         bool   `json:"isCorrect,omitempty"` // disembunyikan saat kuis diambil santri
	OptionExplanation string `json:"optionExplanation,omitempty"`
}

// UserAnswer merepresentasikan satu jawaban santri
type UserAnswer struct {
	QuestionID       string `json:"questionId"`
	SelectedOptionID string `json:"selectedOptionId"`
}

// QuizSubmissionRequest payload permintaan submit jawaban kuis
type QuizSubmissionRequest struct {
	Answers []UserAnswer `json:"answers"`
}

// QuestionReviewItem butir pembahasan kuis setelah submit
type QuestionReviewItem struct {
	QuestionID          string `json:"questionId"`
	QuestionText        string `json:"questionText"`
	SelectedOptionID    string `json:"selectedOptionId"`
	CorrectOptionID     string `json:"correctOptionId"`
	IsCorrect           bool   `json:"isCorrect"`
	Explanation         string `json:"explanation"`
}

// QuizSubmissionResponse hasil evaluasi kuis santri
type QuizSubmissionResponse struct {
	QuizID         string               `json:"quizId"`
	Score          float64              `json:"score"`
	TotalQuestions int                  `json:"totalQuestions"`
	CorrectAnswers int                  `json:"correctAnswers"`
	Passed         bool                 `json:"passed"`
	PassingScore   int                  `json:"passingScore"`
	Reviews        []QuestionReviewItem `json:"reviews"`
}
