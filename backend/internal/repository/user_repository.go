package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	FindByUsernameOrEmail(ctx context.Context, identifier string) (*model.User, error)
	FindByID(ctx context.Context, id string) (*model.User, error)
	UpdateStreak(ctx context.Context, userID string, currentStreak, maxStreak int) error
	UpdateProfile(ctx context.Context, userID, fullName, username string) error
	UpdatePassword(ctx context.Context, userID, newPasswordHash string) error
	UpdateTwoFactor(ctx context.Context, userID string, enabled bool, secret string) error
}

type userRepositoryImpl struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) UserRepository {
	if pool != nil {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			_, _ = pool.Exec(ctx, `
				ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
				ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(100) DEFAULT '';
			`)
		}()
	}
	return &userRepositoryImpl{pool: pool}
}

func (r *userRepositoryImpl) Create(ctx context.Context, user *model.User) error {
	if r.pool == nil {
		return fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		INSERT INTO users (email, username, full_name, password_hash, role, daily_target_ayahs, current_streak, max_streak, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`

	if user.Role == "" {
		user.Role = "user"
	}

	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query,
		user.Email,
		user.Username,
		user.FullName,
		user.PasswordHash,
		user.Role,
		user.DailyTargetAyahs,
		0,
		0,
		now,
		now,
	).Scan(&user.ID)

	if err != nil {
		return fmt.Errorf("gagal membuat user: %w", err)
	}

	user.CreatedAt = now
	user.UpdatedAt = now
	return nil
}

func (r *userRepositoryImpl) FindByUsernameOrEmail(ctx context.Context, identifier string) (*model.User, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		SELECT id, email, username, full_name, password_hash, role, daily_target_ayahs, current_streak, max_streak, 
		       COALESCE(two_factor_enabled, false), COALESCE(two_factor_secret, ''), created_at, updated_at
		FROM users
		WHERE username = $1 OR email = $1
		LIMIT 1
	`

	var user model.User
	err := r.pool.QueryRow(ctx, query, identifier).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.FullName,
		&user.PasswordHash,
		&user.Role,
		&user.DailyTargetAyahs,
		&user.CurrentStreak,
		&user.MaxStreak,
		&user.TwoFactorEnabled,
		&user.TwoFactorSecret,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepositoryImpl) FindByID(ctx context.Context, id string) (*model.User, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		SELECT id, email, username, full_name, password_hash, role, daily_target_ayahs, current_streak, max_streak, 
		       COALESCE(two_factor_enabled, false), COALESCE(two_factor_secret, ''), created_at, updated_at
		FROM users
		WHERE id = $1
		LIMIT 1
	`

	var user model.User
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.FullName,
		&user.PasswordHash,
		&user.Role,
		&user.DailyTargetAyahs,
		&user.CurrentStreak,
		&user.MaxStreak,
		&user.TwoFactorEnabled,
		&user.TwoFactorSecret,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepositoryImpl) UpdateStreak(ctx context.Context, userID string, currentStreak, maxStreak int) error {
	if r.pool == nil {
		return fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		UPDATE users
		SET current_streak = $1, max_streak = $2, updated_at = $3
		WHERE id = $4
	`

	_, err := r.pool.Exec(ctx, query, currentStreak, maxStreak, time.Now().UTC(), userID)
	return err
}

func (r *userRepositoryImpl) UpdateProfile(ctx context.Context, userID, fullName, username string) error {
	if r.pool == nil {
		return fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		UPDATE users
		SET full_name = $1, username = $2, updated_at = $3
		WHERE id = $4
	`

	_, err := r.pool.Exec(ctx, query, fullName, username, time.Now().UTC(), userID)
	return err
}

func (r *userRepositoryImpl) UpdatePassword(ctx context.Context, userID, newPasswordHash string) error {
	if r.pool == nil {
		return fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		UPDATE users
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := r.pool.Exec(ctx, query, newPasswordHash, time.Now().UTC(), userID)
	return err
}

func (r *userRepositoryImpl) UpdateTwoFactor(ctx context.Context, userID string, enabled bool, secret string) error {
	if r.pool == nil {
		return fmt.Errorf("koneksi database belum aktif")
	}

	query := `
		UPDATE users
		SET two_factor_enabled = $1, two_factor_secret = $2, updated_at = $3
		WHERE id = $4
	`

	_, err := r.pool.Exec(ctx, query, enabled, secret, time.Now().UTC(), userID)
	return err
}
