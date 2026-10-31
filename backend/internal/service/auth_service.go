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
	ValidateToken(tokenString string) (string, error)
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

	// Check if already exists
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

	user := &model.User{
		Email:            req.Email,
		Username:         req.Username,
		FullName:         req.FullName,
		PasswordHash:     string(hashedPassword),
		DailyTargetAyahs: dailyTarget,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	token, err := s.generateJWT(user.ID, user.Username)
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
		return nil, fmt.Errorf("kredensial login tidak valid")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("kredensial login tidak valid")
	}

	token, err := s.generateJWT(user.ID, user.Username)
	if err != nil {
		return nil, fmt.Errorf("gagal menerbitkan token: %w", err)
	}

	return &model.AuthResponse{
		Message: "Login berhasil",
		Token:   token,
		User:    *user,
	}, nil
}

func (s *authServiceImpl) generateJWT(userID, username string) (string, error) {
	claims := jwt.MapClaims{
		"userId":   userID,
		"username": username,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *authServiceImpl) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metode signing tidak valid")
		}
		return s.jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return "", fmt.Errorf("token tidak valid atau telah kedaluwarsa")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if userID, ok := claims["userId"].(string); ok {
			return userID, nil
		}
	}

	return "", fmt.Errorf("isi token tidak valid")
}

func (s *authServiceImpl) GetProfile(ctx context.Context, userID string) (*model.User, error) {
	return s.userRepo.FindByID(ctx, userID)
}
