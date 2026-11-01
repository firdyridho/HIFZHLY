package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/fifa-team/hifzhly-backend/internal/config"
	"github.com/fifa-team/hifzhly-backend/internal/database"
	"github.com/fifa-team/hifzhly-backend/internal/handler"
	appMiddleware "github.com/fifa-team/hifzhly-backend/internal/middleware"
	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/repository"
	"github.com/fifa-team/hifzhly-backend/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	// 1. Inisialisasi Database PostgreSQL & Redis
	pgPool, err := database.NewPostgresPool(cfg.DatabaseURL)
	if err != nil {
		log.Printf("[Init Warning] PostgreSQL pool: %v", err)
	}
	if pgPool != nil {
		defer pgPool.Close()
	}

	redisClient := database.NewRedisClient(cfg.RedisHost, cfg.RedisPort)
	if redisClient != nil {
		defer redisClient.Close()
	}

	// 2. Repositories & Services
	userRepo := repository.NewUserRepository(pgPool)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	mutashabihatService := service.NewMutashabihatService()
	quranService := service.NewQuranService(mutashabihatService)
	geminiService := service.NewGeminiService(cfg.GeminiAPIKey)
	murojaahRepo := repository.NewMurojaahRepository(pgPool)
	murojaahService := service.NewMurojaahService(quranService, geminiService, murojaahRepo)
	tajwidRepo := repository.NewTajwidRepository(pgPool)
	tajwidService := service.NewTajwidService(tajwidRepo, geminiService)
	prayerService := service.NewPrayerTimesService(redisClient)
	doaService := service.NewDoaService()
	mutabaahRepo := repository.NewMutabaahRepository(pgPool)
	quizRepo := repository.NewQuizRepository(pgPool)
	quizService := service.NewQuizService(quizRepo, "")

	// 3. Handlers & Middlewares
	authHandler := handler.NewAuthHandler(authService)
	authMiddleware := appMiddleware.NewAuthMiddleware(authService)
	quranHandler := handler.NewQuranHandler(quranService)
	murojaahHandler := handler.NewMurojaahHandler(murojaahService)
	tajwidHandler := handler.NewTajwidHandler(tajwidService)
	enrichmentHandler := handler.NewEnrichmentHandler(prayerService, doaService, mutabaahRepo)
	voiceHandler := handler.NewVoiceHandler(cfg)
	quizHandler := handler.NewQuizHandler(quizService)

	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")
			next.ServeHTTP(w, r)
		})
	})
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Health Check
	healthHandler := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "healthy",
			"app":     "Hifzhly Backend",
			"version": "1.0.0",
		})
	}
	r.Get("/health", healthHandler)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", healthHandler)

		// Public Auth Endpoints
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		// Protected Auth Endpoints
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequireAuth)
			r.Get("/auth/me", authHandler.GetMe)
			r.Put("/auth/profile", authHandler.UpdateProfile)
			r.Put("/auth/password", authHandler.ChangePassword)
			r.Post("/auth/2fa/setup", authHandler.Setup2FA)
			r.Post("/auth/2fa/verify", authHandler.Verify2FA)
		})

		// Quran Proxy & Enrichment Endpoints
		r.Get("/quran/surahs", quranHandler.GetSurahs)
		r.Get("/quran/surahs/{number}", quranHandler.GetSurahDetail)
		r.Get("/quran/mutashabihat/{surah}/{ayah}", func(w http.ResponseWriter, r *http.Request) {
			surahStr := chi.URLParam(r, "surah")
			ayahStr := chi.URLParam(r, "ayah")
			var sNum, aNum int
			fmt.Sscanf(surahStr, "%d", &sNum)
			fmt.Sscanf(ayahStr, "%d", &aNum)

			items := mutashabihatService.GetMutashabihat(sNum, aNum)
			w.Header().Set("Content-Type", "application/json")
			if items == nil {
				items = []model.MutashabihItem{}
			}
			json.NewEncoder(w).Encode(map[string]interface{}{
				"surahNumber":  sNum,
				"ayahNumber":   aNum,
				"mutashabihat": items,
			})
		})

		// Murojaah AI Voice Evaluator (Word Diff & Scoring via Multipart or JSON)
		r.Post("/murojaah/evaluate", murojaahHandler.Evaluate)

		// Real-time Voice AI Engine (VPS AI-Worker / Levenshtein)
		r.Post("/voice/evaluate", voiceHandler.EvaluateVoice)
		r.Get("/voice/health", voiceHandler.HealthCheck)

		// Spaced Repetition (SRS Due Today from PostgreSQL)
		r.Get("/srs/today", murojaahHandler.GetDueToday)

		// Prayer Times (Jadwal Sholat Astronomis Kemenag RI) & Kumpulan Doa
		r.Get("/prayer-times", enrichmentHandler.GetPrayerTimes)
		r.Get("/doa", enrichmentHandler.GetAllDoa)

		// Mutabaah & Retention Analytics
		r.Get("/mutabaah/summary", enrichmentHandler.GetMutabaahSummary)
		r.Get("/mutabaah/heatmap/{surahNumber}", enrichmentHandler.GetSurahHeatmap)

		// Mutabaah Yaumi & Unified Logging System
		r.Post("/mutabaah/log", enrichmentHandler.CreateMutabaahLog)
		r.Get("/mutabaah/history", enrichmentHandler.GetMutabaahHistory)
		r.Get("/mutabaah/targets", enrichmentHandler.GetTargets)
		r.Put("/mutabaah/targets", enrichmentHandler.UpdateTargets)

		// Admin Santri Monitoring & Live Mutabaah
		r.Get("/admin/santri", enrichmentHandler.GetAdminSantri)
		r.Get("/admin/mutabaah/monitoring", enrichmentHandler.GetAdminMutabaahMonitoring)
		r.Post("/admin/mutabaah/{id}/evaluation", enrichmentHandler.SubmitUstadzEvaluation)

		// Tajwid Modules & Quizzes
		r.Get("/tajwid/modules", tajwidHandler.GetModules)
		r.Get("/tajwid/modules/{slug}", tajwidHandler.GetModuleDetail)
		r.Post("/tajwid/quizzes/{quizId}/submit", tajwidHandler.SubmitQuiz)
		r.Post("/tajwid/ai-tutor", quizHandler.AskAITutor)

		// Quran Quiz & Monthly Leaderboard
		r.Get("/quiz/leaderboard", quizHandler.GetLeaderboard)
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequireAuth)
			r.Post("/quiz/submit", quizHandler.SubmitScore)
		})

		// Admin Tajwid Management & AI Quiz Generator (Gemini)
		r.Route("/admin/tajwid", func(adminRouter chi.Router) {
			adminRouter.Post("/modules", tajwidHandler.CreateModule)
			adminRouter.Put("/modules/{id}", tajwidHandler.UpdateModule)
			adminRouter.Delete("/modules/{id}", tajwidHandler.DeleteModule)
			adminRouter.Post("/modules/{id}/quizzes", tajwidHandler.SaveQuiz)
			adminRouter.Post("/generate-quiz", tajwidHandler.GenerateAIQuiz)
		})
	})

	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("[Hifzhly Backend] Server running on port %s (env: %s)...", cfg.AppPort, cfg.AppEnv)
	if err := http.ListenAndServe(serverAddr, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
