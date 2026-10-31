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
	"github.com/fifa-team/hifzhly-backend/internal/handler"
	"github.com/fifa-team/hifzhly-backend/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Dependencies
	quranService := service.NewQuranService()
	quranHandler := handler.NewQuranHandler(quranService)

	// Routes
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "healthy",
			"app":     "Hifzhly Backend",
			"version": "1.0.0",
		})
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Quran proxy routes
		r.Get("/quran/surahs", quranHandler.GetSurahs)
		r.Get("/quran/surahs/{number}", quranHandler.GetSurahDetail)

		// Mock endpoint for rapid frontend development (per API_CONTRACT_AGREEMENT.md)
		r.Get("/srs/today", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"totalDue": 2,
				"items": []map[string]interface{}{
					{
						"surahNumber":     78,
						"surahName":       "An-Naba'",
						"ayahNumber":      1,
						"repetitionCount": 1,
						"intervalDays":    1,
						"lastScore":       65.0,
						"qualityRating":   2,
						"nextReviewAt":    "2026-10-31",
					},
					{
						"surahNumber":     78,
						"surahName":       "An-Naba'",
						"ayahNumber":      5,
						"repetitionCount": 3,
						"intervalDays":    7,
						"lastScore":       90.0,
						"qualityRating":   4,
						"nextReviewAt":    "2026-10-31",
					},
				},
			})
		})

		r.Get("/tajwid/modules", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]map[string]interface{}{
				{
					"id":             "1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21",
					"title":          "Hukum Nun Sukun dan Tanwin",
					"slug":           "hukum-nun-sukun-dan-tanwin",
					"summary":        "Mempelajari 4 kaidah hukum: Idzhar Halqi, Idgham, Ikhfa Haqiqi, dan Iqlab.",
					"youtubeVideoId": "7kK84x4_uY8",
					"orderIndex":     1,
				},
				{
					"id":             "2e9c6b15-0537-58c9-c5c4-e3b04aa8fa32",
					"title":          "Hukum Mim Sukun",
					"slug":           "hukum-mim-sukun",
					"summary":        "Mempelajari kaidah Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.",
					"youtubeVideoId": "W2b8G4kK9x1",
					"orderIndex":     2,
				},
			})
		})
	})

	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("[Hifzhly Backend] Server running on port %s (env: %s)...", cfg.AppPort, cfg.AppEnv)
	if err := http.ListenAndServe(serverAddr, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
