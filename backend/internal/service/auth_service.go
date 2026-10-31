package service

import (
	"context"
	"fmt"
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
	if role == "" {
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
	return s.userRepo.FindByID(ctx, userID)
}
