package handler

import (
	"encoding/json"
	"net/http"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type TajwidHandler struct {
	tajwidService service.TajwidService
}

func NewTajwidHandler(tajwidService service.TajwidService) *TajwidHandler {
	return &TajwidHandler{tajwidService: tajwidService}
}

// GetModules menangani GET /api/v1/tajwid/modules
func (h *TajwidHandler) GetModules(w http.ResponseWriter, r *http.Request) {
	modules, err := h.tajwidService.GetModules(r.Context())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ErrorResponse{
			Error: "Gagal mengambil daftar modul tajwid",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(modules)
}

// GetModuleDetail menangani GET /api/v1/tajwid/modules/{slug}
func (h *TajwidHandler) GetModuleDetail(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{
			Error: "Parameter slug modul wajib disertakan",
		})
		return
	}

	mod, quiz, err := h.tajwidService.GetModuleDetail(r.Context(), slug)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(model.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	response := map[string]interface{}{
		"module": mod,
		"quiz":   quiz,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// SubmitQuiz menangani POST /api/v1/tajwid/quizzes/{quizId}/submit
func (h *TajwidHandler) SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	quizID := chi.URLParam(r, "quizId")
	if quizID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{
			Error: "Parameter quizId wajib disertakan",
		})
		return
	}

	var req model.QuizSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{
			Error: "Format data jawaban kuis tidak valid",
		})
		return
	}

	// Ambil userID dari context jika santri sedang login (opsional)
	userID, _ := r.Context().Value("userId").(string)

	result, err := h.tajwidService.SubmitQuiz(r.Context(), userID, quizID, req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ==========================================
// ADMIN HANDLERS (MANAGEMENT & AI GENERATOR)
// ==========================================

// CreateModule menangani POST /api/v1/admin/tajwid/modules
func (h *TajwidHandler) CreateModule(w http.ResponseWriter, r *http.Request) {
	var req model.CreateOrUpdateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Format data modul tidak valid"})
		return
	}

	mod, err := h.tajwidService.CreateModule(r.Context(), req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(mod)
}

// UpdateModule menangani PUT /api/v1/admin/tajwid/modules/{id}
func (h *TajwidHandler) UpdateModule(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.CreateOrUpdateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Format data modul tidak valid"})
		return
	}

	mod, err := h.tajwidService.UpdateModule(r.Context(), id, req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mod)
}

// DeleteModule menangani DELETE /api/v1/admin/tajwid/modules/{id}
func (h *TajwidHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.tajwidService.DeleteModule(r.Context(), id); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Gagal menghapus modul tajwid"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Modul tajwid berhasil dihapus",
	})
}

// SaveQuiz menangani POST /api/v1/admin/tajwid/modules/{id}/quizzes
func (h *TajwidHandler) SaveQuiz(w http.ResponseWriter, r *http.Request) {
	moduleID := chi.URLParam(r, "id")
	var req model.CreateOrUpdateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Format data kuis tidak valid"})
		return
	}

	quiz, err := h.tajwidService.SaveQuiz(r.Context(), moduleID, req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz)
}

// GenerateAIQuiz menangani POST /api/v1/admin/tajwid/generate-quiz (Gemini AI Engine)
func (h *TajwidHandler) GenerateAIQuiz(w http.ResponseWriter, r *http.Request) {
	var req model.GenerateAIQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Format parameter AI generator tidak valid"})
		return
	}

	aiResult, err := h.tajwidService.GenerateAIQuiz(r.Context(), req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(aiResult)
}

