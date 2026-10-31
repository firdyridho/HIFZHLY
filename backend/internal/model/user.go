package model

import "time"

// User merepresentasikan entitas akun santri/pengguna
type User struct {
	ID               string    `json:"id"`
	Email            string    `json:"email"`
	Username         string    `json:"username"`
	FullName         string    `json:"fullName"`
	PasswordHash     string    `json:"-"`
	DailyTargetAyahs int       `json:"dailyTargetAyahs"`
	CurrentStreak    int       `json:"currentStreak"`
	MaxStreak        int       `json:"maxStreak"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// RegisterRequest DTO pendaftaran
type RegisterRequest struct {
	Email            string `json:"email"`
	Username         string `json:"username"`
	FullName         string `json:"fullName"`
	Password         string `json:"password"`
	DailyTargetAyahs int    `json:"dailyTargetAyahs"`
}

// LoginRequest DTO login
type LoginRequest struct {
	UsernameOrEmail string `json:"usernameOrEmail"`
	Password        string `json:"password"`
}

// AuthResponse DTO respon sukses login/register
type AuthResponse struct {
	Message string `json:"message"`
	Token   string `json:"token"`
	User    User   `json:"user"`
}

