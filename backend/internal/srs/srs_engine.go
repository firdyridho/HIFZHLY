package srs

import (
	"math"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type SrsState struct {
	RepetitionCount int       `json:"repetitionCount"`
	IntervalDays    int       `json:"intervalDays"`
	EaseFactor      float64   `json:"easeFactor"`
	LastScore       float64   `json:"lastScore"`
	QualityRating   int       `json:"qualityRating"`
	NextReviewAt    time.Time `json:"nextReviewAt"`
	LastReviewedAt  time.Time `json:"lastReviewedAt"`
}

// MapScoreToQuality memetakan skor AI (0-100) ke skala kualitas memori SuperMemo (0-5)
func MapScoreToQuality(score float64) int {
	switch {
	case score >= 95.0:
		return 5
	case score >= 85.0:
		return 4
	case score >= 70.0:
		return 3
	case score >= 50.0:
		return 2
	case score >= 20.0:
		return 1
	default:
		return 0
	}
}

// CalculateNextReview menghitung jadwal pengulangan murojaah berikutnya berdasarkan performa
func CalculateNextReview(current SrsState, score float64) model.SrsUpdate {
	q := MapScoreToQuality(score)
	ef := current.EaseFactor
	if ef <= 0 {
		ef = 2.50
	}

	reps := current.RepetitionCount
	var interval int

	if q < 3 {
		// Jika skor < 70% (lupa/banyak salah), reset pengulangan ke hari berikutnya
		reps = 0
		interval = 1
	} else {
		// Jika bacaan lancar (skor >= 70%)
		switch reps {
		case 0:
			interval = 1
		case 1:
			interval = 3
		case 2:
			interval = 7
		case 3:
			interval = 14
		default:
			interval = int(math.Round(float64(current.IntervalDays) * ef))
			if interval < 30 {
				interval = 30
			}
		}
		reps++
	}

	// Update Ease Factor SuperMemo SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
	diff := float64(5 - q)
	newEf := ef + (0.1 - diff*(0.08+diff*0.02))
	if newEf < 1.30 {
		newEf = 1.30 // Batas bawah efektivitas
	}
	newEf = math.Round(newEf*100) / 100

	nextDate := time.Now().UTC().AddDate(0, 0, interval)
	nextDateFormatted := nextDate.Format("2006-01-02")

	return model.SrsUpdate{
		QualityRating:   q,
		RepetitionCount: reps,
		IntervalDays:    interval,
		EaseFactor:      newEf,
		NextReviewAt:    nextDateFormatted,
	}
}

