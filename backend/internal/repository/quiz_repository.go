package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type QuizRepository struct {
	db *pgxpool.Pool
}

func NewQuizRepository(db *pgxpool.Pool) *QuizRepository {
	repo := &QuizRepository{db: db}
	if db != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = repo.autoMigrate(ctx)
	}
	return repo
}

func (r *QuizRepository) autoMigrate(ctx context.Context) error {
	query := `
	CREATE TABLE IF NOT EXISTS quiz_scores (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		mode VARCHAR(50) NOT NULL,
		juz_start INT NOT NULL DEFAULT 1,
		juz_end INT NOT NULL DEFAULT 30,
		total_questions INT NOT NULL DEFAULT 10,
		correct_answers INT NOT NULL DEFAULT 0,
		score INT NOT NULL DEFAULT 0,
		month_key VARCHAR(7) NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_quiz_scores_month ON quiz_scores(month_key, score DESC);
	CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON quiz_scores(user_id, month_key);
	`
	_, err := r.db.Exec(ctx, query)
	return err
}

func (r *QuizRepository) SaveScore(ctx context.Context, score *model.QuizScore) error {
	if r.db == nil {
		return fmt.Errorf("database connection not available")
	}

	query := `
	INSERT INTO quiz_scores (user_id, mode, juz_start, juz_end, total_questions, correct_answers, score, month_key, created_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
	RETURNING id, created_at
	`
	return r.db.QueryRow(ctx, query,
		score.UserID,
		score.Mode,
		score.JuzStart,
		score.JuzEnd,
		score.TotalQuestions,
		score.CorrectAnswers,
		score.Score,
		score.MonthKey,
	).Scan(&score.ID, &score.CreatedAt)
}

func (r *QuizRepository) GetMonthlyLeaderboard(ctx context.Context, monthKey string, limit int) ([]model.LeaderboardEntry, error) {
	if r.db == nil {
		return []model.LeaderboardEntry{}, nil
	}

	if limit <= 0 {
		limit = 10
	}

	query := `
	SELECT 
		qs.user_id,
		COALESCE(u.username, 'santri') as username,
		COALESCE(u.full_name, 'Santri Hifzhly') as full_name,
		SUM(qs.score) as total_score,
		COUNT(qs.id) as games_played,
		MAX(qs.score) as highest_score
	FROM quiz_scores qs
	JOIN users u ON qs.user_id = u.id
	WHERE qs.month_key = $1
	GROUP BY qs.user_id, u.username, u.full_name
	ORDER BY total_score DESC, highest_score DESC
	LIMIT $2
	`

	rows, err := r.db.Query(ctx, query, monthKey, limit)
	if err != nil {
		return nil, fmt.Errorf("query leaderboard gagal: %w", err)
	}
	defer rows.Close()

	var entries []model.LeaderboardEntry
	rank := 1
	for rows.Next() {
		var e model.LeaderboardEntry
		e.Rank = rank
		if err := rows.Scan(&e.UserID, &e.Username, &e.FullName, &e.TotalScore, &e.GamesPlayed, &e.HighestScore); err != nil {
			return nil, err
		}
		entries = append(entries, e)
		rank++
	}

	return entries, nil
}

