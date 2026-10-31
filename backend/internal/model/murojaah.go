package model

import "time"

type WordDiffDetail struct {
	Index       int    `json:"index"`
	Word        string `json:"word"`
	Status      string `json:"status"` // "correct", "substituted", "deleted", "inserted"
	UserSaid    string `json:"userSaid,omitempty"`
	MistakeType string `json:"mistakeType,omitempty"`
}

type SrsUpdate struct {
	QualityRating   int     `json:"qualityRating"`
	RepetitionCount int     `json:"repetitionCount"`
	IntervalDays    int     `json:"intervalDays"`
	EaseFactor      float64 `json:"easeFactor"`
	NextReviewAt    string  `json:"nextReviewAt"`
}

type EvaluationResponse struct {
	EvaluationID    string           `json:"evaluationId"`
	SurahNumber     int              `json:"surahNumber"`
	AyahNumber      int              `json:"ayahNumber"`
	Score           float64          `json:"score"`
	TranscribedText string           `json:"transcribedText"`
	ReferenceText   string           `json:"referenceText"`
	AudioDurationMs int              `json:"audioDurationMs"`
	Substitutions   int              `json:"substitutions"`
	Deletions       int              `json:"deletions"`
	Insertions      int              `json:"insertions"`
	WordDiff        []WordDiffDetail `json:"wordDiff"`
	SrsUpdate       SrsUpdate        `json:"srsUpdate"`
}

type EvaluateTextRequest struct {
	SurahNumber int    `json:"surahNumber"`
	AyahNumber  int    `json:"ayahNumber"`
	UserText    string `json:"userText"` // Teks yang dilafalkan
}

type SrsDueItem struct {
	SurahNumber     int     `json:"surahNumber"`
	SurahName       string  `json:"surahName"`
	AyahNumber      int     `json:"ayahNumber"`
	RepetitionCount int     `json:"repetitionCount"`
	IntervalDays    int     `json:"intervalDays"`
	LastScore       float64 `json:"lastScore"`
	QualityRating   int     `json:"qualityRating"`
	NextReviewAt    string  `json:"nextReviewAt"`
}

type SrsTodayResponse struct {
	TotalDue int          `json:"totalDue"`
	Items    []SrsDueItem `json:"items"`
}

type MurojaahSession struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	SurahNumber int        `json:"surahNumber"`
	TotalAyahs  int        `json:"totalAyahs"`
	AvgScore    float64    `json:"avgScore"`
	Status      string     `json:"status"`
	StartedAt   time.Time  `json:"startedAt"`
	FinishedAt  *time.Time `json:"finishedAt,omitempty"`
}

