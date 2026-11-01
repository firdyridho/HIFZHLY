package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/config"
	"github.com/fifa-team/hifzhly-backend/internal/evaluator"
	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type VoiceHandler struct {
	cfg        *config.Config
	httpClient *http.Client
}

func NewVoiceHandler(cfg *config.Config) *VoiceHandler {
	return &VoiceHandler{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type VoiceEvaluateRequest struct {
	SurahNumber   int    `json:"surahNumber"`
	AyahNumber    int    `json:"ayahNumber"`
	ReferenceText string `json:"referenceText"`
	SpokenText    string `json:"spokenText"`
}

type VoiceEvaluateResponse struct {
	Score           int      `json:"score"`
	IsAyahComplete  bool     `json:"isAyahComplete"`
	MatchedCount    int      `json:"matchedCount"`
	TotalWords      int      `json:"totalWords"`
	MatchedWords    []string `json:"matchedWords"`
	TranscribedText string   `json:"transcribedText"`
}

// EvaluateVoice menangani evaluasi suara pelafalan santri secara real-time
func (h *VoiceHandler) EvaluateVoice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Cek apakah request berformat JSON
	var req VoiceEvaluateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.WebResponse{
			Error:   "Payload evaluasi suara tidak valid: " + err.Error(),
			Message: "Bad Request",
		})
		return
	}

	if req.ReferenceText == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.WebResponse{
			Error:   "Reference text ayat wajib disertakan",
			Message: "Bad Request",
		})
		return
	}

	// 1. Coba hubungi microservice AI-Worker di VPS jika URL tersedia
	if h.cfg.AIWorkerURL != "" {
		aiPayload, _ := json.Marshal(map[string]interface{}{
			"reference_text": req.ReferenceText,
			"spoken_text":    req.SpokenText,
			"surah_number":   req.SurahNumber,
			"ayah_number":    req.AyahNumber,
		})

		aiReq, err := http.NewRequestWithContext(r.Context(), "POST", h.cfg.AIWorkerURL+"/evaluate", bytes.NewBuffer(aiPayload))
		if err == nil {
			aiReq.Header.Set("Content-Type", "application/json")
			aiResp, err := h.httpClient.Do(aiReq)
			if err == nil && aiResp.StatusCode == http.StatusOK {
				var aiResult map[string]interface{}
				if err := json.NewDecoder(aiResp.Body).Decode(&aiResult); err == nil {
					aiResp.Body.Close()
					w.WriteHeader(http.StatusOK)
					json.NewEncoder(w).Encode(model.WebResponse{
						Message: "Evaluasi suara berhasil diproses oleh AI Worker VPS",
						Data:    aiResult,
					})
					return
				}
				aiResp.Body.Close()
			}
		}
	}

	// 2. Fallback cerdas: Jalankan Levenshtein Normalizer internal Go di VPS
	evalResult := evaluator.EvaluateRecitation(req.ReferenceText, req.SpokenText)

	refWords := evaluator.SplitWords(req.ReferenceText)
	totalWords := len(refWords)

	var matchedWords []string
	for _, diff := range evalResult.WordDiff {
		if diff.Status == "correct" {
			matchedWords = append(matchedWords, diff.Word)
		}
	}

	matchedCount := len(matchedWords)
	isComplete := matchedCount == totalWords && totalWords > 0

	score := int(evalResult.Score)
	if isComplete {
		score = 100
	}

	resp := VoiceEvaluateResponse{
		Score:           score,
		IsAyahComplete:  isComplete,
		MatchedCount:    matchedCount,
		TotalWords:      totalWords,
		MatchedWords:    matchedWords,
		TranscribedText: req.SpokenText,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.WebResponse{
		Message: "Evaluasi pelafalan berhasil dihitung",
		Data:    resp,
	})
}

// HealthCheck memeriksa ketersediaan microservice AI di VPS
func (h *VoiceHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	aiStatus := "offline"
	if h.cfg.AIWorkerURL != "" {
		resp, err := h.httpClient.Get(h.cfg.AIWorkerURL + "/health")
		if err == nil && resp.StatusCode == http.StatusOK {
			aiStatus = "online"
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      "ready",
		"backend":     "go",
		"aiWorkerUrl": h.cfg.AIWorkerURL,
		"aiWorker":    aiStatus,
	})
}
