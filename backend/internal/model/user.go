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
	TwoFactorEnabled bool      `json:"twoFactorEnabled"`
	TwoFactorSecret  string    `json:"-"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// UpdateProfileRequest DTO pembaruan nama & username
type UpdateProfileRequest struct {
	FullName string `json:"fullName"`
	Username string `json:"username"`
}

// ChangePasswordRequest DTO pembaruan kata sandi
type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// TwoFactorSetupResponse DTO setup 2FA
type TwoFactorSetupResponse struct {
	Secret string `json:"secret"`
	QRCode string `json:"qrCode"`
}

// TwoFactorVerifyRequest DTO verifikasi 2FA
type TwoFactorVerifyRequest struct {
	Code   string `json:"code"`
	Enable bool   `json:"enable"`
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
	TwoFactorCode   string `json:"twoFactorCode,omitempty"`
}

// AuthResponse DTO respon sukses login/register
type AuthResponse struct {
	Message    string `json:"message"`
	Token      string `json:"token,omitempty"`
	User       User   `json:"user,omitempty"`
	Require2FA bool   `json:"require2fa,omitempty"`
}
