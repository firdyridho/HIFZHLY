package model

import "time"

// QuizScore mencatat riwayat permainan kuis Al-Qur'an santri
type QuizScore struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	Username       string    `json:"username,omitempty"`
	FullName       string    `json:"fullName,omitempty"`
	Mode           string    `json:"mode"`
	JuzStart       int       `json:"juzStart"`
	JuzEnd         int       `json:"juzEnd"`
	TotalQuestions int       `json:"totalQuestions"`
	CorrectAnswers int       `json:"correctAnswers"`
	Score          int       `json:"score"`
	MonthKey       string    `json:"monthKey"`
	CreatedAt      time.Time `json:"createdAt"`
}

// SubmitQuizScoreRequest DTO pengiriman skor setelah kuis selesai
type SubmitQuizScoreRequest struct {
	Mode           string `json:"mode"`
	JuzStart       int    `json:"juzStart"`
	JuzEnd         int    `json:"juzEnd"`
	TotalQuestions int    `json:"totalQuestions"`
	CorrectAnswers int    `json:"correctAnswers"`
	Score          int    `json:"score"`
}

// LeaderboardEntry DTO entri klasemen Top 10 bulanan
type LeaderboardEntry struct {
	Rank         int    `json:"rank"`
	UserID       string `json:"userId"`
	Username     string `json:"username"`
	FullName     string `json:"fullName"`
	TotalScore   int    `json:"totalScore"`
	GamesPlayed  int    `json:"gamesPlayed"`
	HighestScore int    `json:"highestScore"`
}

// AITutorRequest DTO untuk pertanyaan ke asisten AI tajwid
type AITutorRequest struct {
	Question string `json:"question"`
	Context  string `json:"context,omitempty"`
}

// AITutorResponse DTO jawaban dari asisten AI tajwid
type AITutorResponse struct {
	Answer    string `json:"answer"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
}
