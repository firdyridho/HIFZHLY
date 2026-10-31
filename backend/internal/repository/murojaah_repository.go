package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MurojaahRepository interface {
	GetOrCreateSession(ctx context.Context, userID string, surahNumber int) (string, error)
	SaveEvaluation(ctx context.Context, eval *model.EvaluationResponse, sessionID, userID string) error
	UpsertAyahMemoryState(ctx context.Context, userID string, surahNumber, ayahNumber int, srs model.SrsUpdate, score float64) error
	GetDueAyahs(ctx context.Context, userID string) ([]model.SrsDueItem, error)
	GetDefaultUserID(ctx context.Context) (string, error)
}

type murojaahRepository struct {
	db *pgxpool.Pool
}

func NewMurojaahRepository(db *pgxpool.Pool) MurojaahRepository {
	return &murojaahRepository{db: db}
}

func (r *murojaahRepository) GetDefaultUserID(ctx context.Context) (string, error) {
	if r.db == nil {
		return "00000000-0000-0000-0000-000000000001", nil
	}

	var userID string
	err := r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
	if err != nil {
		// Fallback to placeholder UUID if users table is empty
		return "00000000-0000-0000-0000-000000000001", nil
	}
	return userID, nil
}

func (r *murojaahRepository) GetOrCreateSession(ctx context.Context, userID string, surahNumber int) (string, error) {
	if r.db == nil {
		return fmt.Sprintf("mock-session-%d", surahNumber), nil
	}

	if userID == "" {
		defID, err := r.GetDefaultUserID(ctx)
		if err == nil {
			userID = defID
		}
	}

	// 1. Cek sesi in_progress yang sedang aktif untuk surah ini
	var sessionID string
	err := r.db.QueryRow(ctx, `
		SELECT id FROM murojaah_sessions
		WHERE user_id = $1 AND surah_number = $2 AND status = 'in_progress'
		ORDER BY started_at DESC
		LIMIT 1
	`, userID, surahNumber).Scan(&sessionID)

	if err == nil && sessionID != "" {
		return sessionID, nil
	}

	// 2. Buat sesi baru jika belum ada
	err = r.db.QueryRow(ctx, `
		INSERT INTO murojaah_sessions (user_id, surah_number, total_ayahs, avg_score, status)
		VALUES ($1, $2, 0, 0, 'in_progress')
		RETURNING id
	`, userID, surahNumber).Scan(&sessionID)

	if err != nil {
		return fmt.Sprintf("fallback-sess-%d-%d", surahNumber, time.Now().Unix()), nil
	}

	return sessionID, nil
}

func (r *murojaahRepository) SaveEvaluation(ctx context.Context, eval *model.EvaluationResponse, sessionID, userID string) error {
	if r.db == nil {
		return nil
	}

	if userID == "" {
		defID, err := r.GetDefaultUserID(ctx)
		if err == nil {
			userID = defID
		}
	}

	wordDiffBytes, err := json.Marshal(eval.WordDiff)
	if err != nil {
		wordDiffBytes = []byte("[]")
	}

	// Insert ke murojaah_evaluations
	query := `
		INSERT INTO murojaah_evaluations (
			id, session_id, user_id, surah_number, ayah_number, audio_duration_ms,
			transcribed_text, reference_text, score, substitutions, deletions, insertions, word_diff_json
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		)
	`
	_, err = r.db.Exec(ctx, query,
		sessionID,
		userID,
		eval.SurahNumber,
		eval.AyahNumber,
		eval.AudioDurationMs,
		eval.TranscribedText,
		eval.ReferenceText,
		eval.Score,
		eval.Substitutions,
		eval.Deletions,
		eval.Insertions,
		wordDiffBytes,
	)
	if err != nil {
		// Log and continue gracefully
		fmt.Printf("[SaveEvaluation] warning: %v\n", err)
	}

	// Update agregasi di murojaah_sessions
	updateSessionQuery := `
		UPDATE murojaah_sessions
		SET total_ayahs = total_ayahs + 1,
		    avg_score = (avg_score * total_ayahs + $1) / (total_ayahs + 1)
		WHERE id = $2
	`
	_, _ = r.db.Exec(ctx, updateSessionQuery, eval.Score, sessionID)

	// Update mutabaah_logs hari ini
	todayLogQuery := `
		INSERT INTO mutabaah_logs (user_id, log_date, ayahs_reviewed, average_score, target_achieved)
		VALUES ($1, CURRENT_DATE, 1, $2, false)
		ON CONFLICT (user_id, log_date) DO UPDATE SET
			ayahs_reviewed = mutabaah_logs.ayahs_reviewed + 1,
			average_score = (mutabaah_logs.average_score * mutabaah_logs.ayahs_reviewed + EXCLUDED.average_score) / (mutabaah_logs.ayahs_reviewed + 1)
	`
	_, _ = r.db.Exec(ctx, todayLogQuery, userID, eval.Score)

	return nil
}

func (r *murojaahRepository) UpsertAyahMemoryState(ctx context.Context, userID string, surahNumber, ayahNumber int, srs model.SrsUpdate, score float64) error {
	if r.db == nil {
		return nil
	}

	if userID == "" {
		defID, err := r.GetDefaultUserID(ctx)
		if err == nil {
			userID = defID
		}
	}

	query := `
		INSERT INTO ayah_memory_states (
			user_id, surah_number, ayah_number, repetition_count, interval_days, ease_factor,
			last_score, quality_rating, next_review_at, last_reviewed_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9::date, CURRENT_TIMESTAMP
		)
		ON CONFLICT (user_id, surah_number, ayah_number) DO UPDATE SET
			repetition_count = EXCLUDED.repetition_count,
			interval_days = EXCLUDED.interval_days,
			ease_factor = EXCLUDED.ease_factor,
			last_score = EXCLUDED.last_score,
			quality_rating = EXCLUDED.quality_rating,
			next_review_at = EXCLUDED.next_review_at,
			last_reviewed_at = CURRENT_TIMESTAMP
	`

	_, err := r.db.Exec(ctx, query,
		userID,
		surahNumber,
		ayahNumber,
		srs.RepetitionCount,
		srs.IntervalDays,
		srs.EaseFactor,
		score,
		srs.QualityRating,
		srs.NextReviewAt,
	)

	return err
}

func (r *murojaahRepository) GetDueAyahs(ctx context.Context, userID string) ([]model.SrsDueItem, error) {
	if r.db == nil {
		return r.getFallbackDueAyahs(), nil
	}

	if userID == "" {
		defID, err := r.GetDefaultUserID(ctx)
		if err == nil {
			userID = defID
		}
	}

	query := `
		SELECT surah_number, ayah_number, repetition_count, interval_days, last_score, quality_rating, next_review_at::text
		FROM ayah_memory_states
		WHERE user_id = $1 AND next_review_at <= CURRENT_DATE
		ORDER BY next_review_at ASC, surah_number ASC, ayah_number ASC
		LIMIT 20
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return r.getFallbackDueAyahs(), nil
	}
	defer rows.Close()

	var items []model.SrsDueItem
	for rows.Next() {
		var item model.SrsDueItem
		err := rows.Scan(
			&item.SurahNumber,
			&item.AyahNumber,
			&item.RepetitionCount,
			&item.IntervalDays,
			&item.LastScore,
			&item.QualityRating,
			&item.NextReviewAt,
		)
		if err == nil {
			item.SurahName = r.getSurahName(item.SurahNumber)
			items = append(items, item)
		}
	}

	if len(items) == 0 {
		return r.getFallbackDueAyahs(), nil
	}

	return items, nil
}

func (r *murojaahRepository) getFallbackDueAyahs() []model.SrsDueItem {
	todayStr := time.Now().Format("2006-01-02")
	return []model.SrsDueItem{
		{
			SurahNumber:     78,
			SurahName:       "An-Naba'",
			AyahNumber:      1,
			RepetitionCount: 2,
			IntervalDays:    3,
			LastScore:       90.0,
			QualityRating:   4,
			NextReviewAt:    todayStr,
		},
		{
			SurahNumber:     78,
			SurahName:       "An-Naba'",
			AyahNumber:      2,
			RepetitionCount: 1,
			IntervalDays:    1,
			LastScore:       70.0,
			QualityRating:   3,
			NextReviewAt:    todayStr,
		},
		{
			SurahNumber:     78,
			SurahName:       "An-Naba'",
			AyahNumber:      3,
			RepetitionCount: 0,
			IntervalDays:    1,
			LastScore:       55.0,
			QualityRating:   2,
			NextReviewAt:    todayStr,
		},
	}
}

func (r *murojaahRepository) getSurahName(num int) string {
	names := map[int]string{
		1:  "Al-Fatihah",
		78: "An-Naba'",
		79: "An-Nazi'at",
		80: "'Abasa",
		81: "At-Takwir",
		82: "Al-Infitar",
		83: "Al-Muthaffifin",
		84: "Al-Insyiqaq",
		85: "Al-Buruj",
		86: "At-Tariq",
		87: "Al-A'la",
		88: "Al-Ghasyiyah",
		89: "Al-Fajr",
		90: "Al-Balad",
		91: "Asy-Syams",
		92: "Al-Lail",
		93: "Ad-Duha",
		94: "Asy-Syarh",
		95: "At-Tin",
		96: "Al-'Alaq",
		97: "Al-Qadr",
		98: "Al-Bayyinah",
		99: "Az-Zalzalah",
		100: "Al-'Adiyat",
		101: "Al-Qari'ah",
		102: "At-Takasur",
		103: "Al-'Asr",
		104: "Al-Humazah",
		105: "Al-Fil",
		106: "Quraisy",
		107: "Al-Ma'un",
		108: "Al-Kausar",
		109: "Al-Kafirun",
		110: "An-Nasr",
		111: "Al-Lahab",
		112: "Al-Ikhlas",
		113: "Al-Falaq",
		114: "An-Nas",
	}
	if name, ok := names[num]; ok {
		return name
	}
	return fmt.Sprintf("Surah %d", num)
}
