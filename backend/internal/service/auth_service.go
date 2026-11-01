package service

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"strings"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, req model.RegisterRequest) (*model.AuthResponse, error)
	Login(ctx context.Context, req model.LoginRequest) (*model.AuthResponse, error)
	ValidateToken(tokenString string) (string, string, error) // returns userID, role, error
	GetProfile(ctx context.Context, userID string) (*model.User, error)
	UpdateProfile(ctx context.Context, userID string, req model.UpdateProfileRequest) (*model.User, error)
	ChangePassword(ctx context.Context, userID string, req model.ChangePasswordRequest) error
	Setup2FA(ctx context.Context, userID string) (*model.TwoFactorSetupResponse, error)
	Verify2FA(ctx context.Context, userID string, req model.TwoFactorVerifyRequest) error
}

type authServiceImpl struct {
	userRepo  repository.UserRepository
	jwtSecret []byte
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	if jwtSecret == "" {
		jwtSecret = "default_secret_key_fifa_hifzhly_2026"
	}
	return &authServiceImpl{
		userRepo:  userRepo,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *authServiceImpl) Register(ctx context.Context, req model.RegisterRequest) (*model.AuthResponse, error) {
	if req.Username == "" || req.Email == "" || req.Password == "" {
		return nil, fmt.Errorf("username, email, dan password wajib diisi")
	}

	existing, _ := s.userRepo.FindByUsernameOrEmail(ctx, req.Username)
	if existing != nil {
		return nil, fmt.Errorf("username sudah digunakan")
	}
	existingEmail, _ := s.userRepo.FindByUsernameOrEmail(ctx, req.Email)
	if existingEmail != nil {
		return nil, fmt.Errorf("email sudah terdaftar")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("gagal hash password: %w", err)
	}

	dailyTarget := req.DailyTargetAyahs
	if dailyTarget <= 0 {
		dailyTarget = 10
	}

	role := req.Role
	if req.Username == "admin" || req.Email == "admin@hifzhly.id" {
		role = "admin"
	} else if role == "" {
		role = "user"
	}

	user := &model.User{
		Email:            req.Email,
		Username:         req.Username,
		FullName:         req.FullName,
		PasswordHash:     string(hashedPassword),
		Role:             role,
		DailyTargetAyahs: dailyTarget,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	if user.Username == "admin" || user.Email == "admin@hifzhly.id" {
		user.Role = "admin"
	}

	token, err := s.generateJWT(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, fmt.Errorf("gagal menerbitkan token: %w", err)
	}

	return &model.AuthResponse{
		Message: "Registrasi berhasil",
		Token:   token,
		User:    *user,
	}, nil
}

func (s *authServiceImpl) Login(ctx context.Context, req model.LoginRequest) (*model.AuthResponse, error) {
	if req.UsernameOrEmail == "" || req.Password == "" {
		return nil, fmt.Errorf("username/email dan password wajib diisi")
	}

	user, err := s.userRepo.FindByUsernameOrEmail(ctx, req.UsernameOrEmail)
	if err != nil || user == nil {
		// Built-in Super Admin fallback (untuk asatidz/pengujian sistem)
		if (req.UsernameOrEmail == "admin" || req.UsernameOrEmail == "admin@hifzhly.id") && req.Password == "admin123" {
			adminUser := &model.User{
				ID:               "00000000-0000-0000-0000-000000000001",
				Username:         "admin",
				Email:            "admin@hifzhly.id",
				FullName:         "Ustadz Pembina (Admin)",
				Role:             "admin",
				DailyTargetAyahs: 20,
			}
			token, err := s.generateJWT(adminUser.ID, adminUser.Username, adminUser.Role)
			if err != nil {
				return nil, fmt.Errorf("gagal menerbitkan token: %w", err)
			}
			return &model.AuthResponse{
				Message: "Login admin berhasil",
				Token:   token,
				User:    *adminUser,
			}, nil
		}
		return nil, fmt.Errorf("kredensial login tidak valid")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("kredensial login tidak valid")
	}

	// Otomatis pastikan akun admin mendapatkan role admin meskipun di db lama tercatat user
	if user.Username == "admin" || user.Email == "admin@hifzhly.id" {
		user.Role = "admin"
	}

	// Validasi expected role jika dikirim (misal login lewat portal admin)
	if req.ExpectedRole != "" && user.Role != req.ExpectedRole {
		return nil, fmt.Errorf("akun ini tidak memiliki akses sebagai %s", req.ExpectedRole)
	}

	token, err := s.generateJWT(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, fmt.Errorf("gagal menerbitkan token: %w", err)
	}

	return &model.AuthResponse{
		Message: "Login berhasil",
		Token:   token,
		User:    *user,
	}, nil
}

func (s *authServiceImpl) generateJWT(userID, username, role string) (string, error) {
	claims := jwt.MapClaims{
		"userId":   userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *authServiceImpl) ValidateToken(tokenString string) (string, string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metode signing tidak valid")
		}
		return s.jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return "", "", fmt.Errorf("token tidak valid atau telah kedaluwarsa")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		userID, _ := claims["userId"].(string)
		role, _ := claims["role"].(string)
		if role == "" {
			role = "user"
		}
		if userID != "" {
			return userID, role, nil
		}
	}

	return "", "", fmt.Errorf("isi token tidak valid")
}

func (s *authServiceImpl) GetProfile(ctx context.Context, userID string) (*model.User, error) {
	if userID == "00000000-0000-0000-0000-000000000001" {
		return &model.User{
			ID:               "00000000-0000-0000-0000-000000000001",
			Username:         "admin",
			Email:            "admin@hifzhly.id",
			FullName:         "Ustadz Pembina (Admin)",
			Role:             "admin",
			DailyTargetAyahs: 20,
		}, nil
	}
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user != nil && (user.Username == "admin" || user.Email == "admin@hifzhly.id") {
		user.Role = "admin"
	}
	return user, nil
}

func (s *authServiceImpl) UpdateProfile(ctx context.Context, userID string, req model.UpdateProfileRequest) (*model.User, error) {
	if strings.TrimSpace(req.FullName) == "" || strings.TrimSpace(req.Username) == "" {
		return nil, fmt.Errorf("nama lengkap dan username tidak boleh kosong")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return nil, fmt.Errorf("pengguna tidak ditemukan")
	}

	// Jika username berubah, periksa apakah username sudah dipakai
	if req.Username != user.Username {
		existing, _ := s.userRepo.FindByUsernameOrEmail(ctx, req.Username)
		if existing != nil && existing.ID != userID {
			return nil, fmt.Errorf("username '%s' sudah digunakan oleh akun lain", req.Username)
		}
	}

	if err := s.userRepo.UpdateProfile(ctx, userID, strings.TrimSpace(req.FullName), strings.TrimSpace(req.Username)); err != nil {
		return nil, fmt.Errorf("gagal memperbarui profil: %w", err)
	}

	user.FullName = strings.TrimSpace(req.FullName)
	user.Username = strings.TrimSpace(req.Username)
	return user, nil
}

func (s *authServiceImpl) ChangePassword(ctx context.Context, userID string, req model.ChangePasswordRequest) error {
	if len(req.NewPassword) < 8 {
		return fmt.Errorf("password baru minimal harus terdiri dari 8 karakter")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return fmt.Errorf("pengguna tidak ditemukan")
	}

	// Validasi password lama
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		return fmt.Errorf("password lama yang Anda masukkan tidak sesuai")
	}

	// Hash password baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("gagal memproses enkripsi password baru: %w", err)
	}

	return s.userRepo.UpdatePassword(ctx, userID, string(hashedPassword))
}

func (s *authServiceImpl) Setup2FA(ctx context.Context, userID string) (*model.TwoFactorSetupResponse, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return nil, fmt.Errorf("pengguna tidak ditemukan")
	}

	// Generate 10-byte (16 base32 chars) random secret
	bytes := make([]byte, 10)
	if _, err := rand.Read(bytes); err != nil {
		return nil, fmt.Errorf("gagal membuat secret key: %w", err)
	}
	secret := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(bytes)

	// Simpan secret sementara
	_ = s.userRepo.UpdateTwoFactor(ctx, userID, false, secret)

	otpURI := fmt.Sprintf("otpauth://totp/Hifzhly:%s?secret=%s&issuer=Hifzhly", user.Email, secret)
	return &model.TwoFactorSetupResponse{
		Secret: secret,
		QRCode: otpURI,
	}, nil
}

func (s *authServiceImpl) Verify2FA(ctx context.Context, userID string, req model.TwoFactorVerifyRequest) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return fmt.Errorf("pengguna tidak ditemukan")
	}

	secret := user.TwoFactorSecret
	if secret == "" {
		return fmt.Errorf("belum ada sesi pengaturan 2FA aktif")
	}

	cleanCode := strings.TrimSpace(req.Code)
	if len(cleanCode) != 6 {
		return fmt.Errorf("kode verifikasi harus terdiri dari 6 digit angka")
	}

	if !validateTOTP(secret, cleanCode) {
		return fmt.Errorf("kode verifikasi 6 digit tidak valid atau telah kedaluwarsa")
	}

	return s.userRepo.UpdateTwoFactor(ctx, userID, req.Enable, secret)
}

func computeTOTP(secret string, timeStep int64) (string, error) {
	key, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(strings.ToUpper(secret))
	if err != nil {
		return "", err
	}
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, uint64(timeStep))
	mac := hmac.New(sha1.New, key)
	mac.Write(buf)
	h := mac.Sum(nil)
	offset := h[len(h)-1] & 0x0f
	binaryCode := binary.BigEndian.Uint32(h[offset:offset+4]) & 0x7fffffff
	code := binaryCode % 1000000
	return fmt.Sprintf("%06d", code), nil
}

func validateTOTP(secret, inputCode string) bool {
	if len(inputCode) != 6 {
		return false
	}
	now := time.Now().Unix() / 30
	for _, step := range []int64{now, now - 1, now + 1} {
		code, err := computeTOTP(secret, step)
		if err == nil && code == inputCode {
			return true
		}
	}
	return false
}
