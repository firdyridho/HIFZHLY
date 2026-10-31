package model

import "time"

// User merepresentasikan entitas akun santri atau admin/ustaz
type User struct {
	ID               string    `json:"id"`
	Email            string    `json:"email"`
	Username         string    `json:"username"`
	FullName         string    `json:"fullName"`
	PasswordHash     string    `json:"-"`
	Role             string    `json:"role"` // "user" (santri/pengguna) atau "admin" (ustaz/pengelola)
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
	Role             string `json:"role,omitempty"` // default: "user"
	DailyTargetAyahs int    `json:"dailyTargetAyahs"`
}

// LoginRequest DTO login
type LoginRequest struct {
	UsernameOrEmail string `json:"usernameOrEmail"`
	Password        string `json:"password"`
	ExpectedRole    string `json:"expectedRole,omitempty"` // Opsional: "user" atau "admin"
}

// AuthResponse DTO respon sukses login/register
type AuthResponse struct {
	Message string `json:"message"`
	Token   string `json:"token"`
	User    User   `json:"user"`
}
