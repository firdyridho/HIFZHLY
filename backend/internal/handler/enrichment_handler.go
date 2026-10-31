package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/repository"
	"github.com/fifa-team/hifzhly-backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type EnrichmentHandler struct {
	prayerService service.PrayerTimesService
	doaService    service.DoaService
	mutabaahRepo  repository.MutabaahRepository
}

func NewEnrichmentHandler(
	prayerService service.PrayerTimesService,
	doaService service.DoaService,
	mutabaahRepo repository.MutabaahRepository,
) *EnrichmentHandler {
	return &EnrichmentHandler{
		prayerService: prayerService,
		doaService:    doaService,
		mutabaahRepo:  mutabaahRepo,
	}
}

func (h *EnrichmentHandler) GetPrayerTimes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	city := r.URL.Query().Get("city")
	resp, err := h.prayerService.GetPrayerTimes(r.Context(), city)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(resp)
}

func (h *EnrichmentHandler) GetAllDoa(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	items, err := h.doaService.GetAllDoa(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total": len(items),
		"doa":   items,
	})
}

func (h *EnrichmentHandler) GetMutabaahSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	summary, err := h.mutabaahRepo.GetSummary(r.Context(), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(summary)
}

func (h *EnrichmentHandler) GetSurahHeatmap(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	surahStr := chi.URLParam(r, "surahNumber")
	surahNum, _ := strconv.Atoi(surahStr)
	if surahNum < 1 || surahNum > 114 {
		surahNum = 78
	}

	heatmap, err := h.mutabaahRepo.GetSurahHeatmap(r.Context(), userID, surahNum)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(heatmap)
}

func (h *EnrichmentHandler) GetAdminSantri(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	data, err := h.mutabaahRepo.GetAdminSantriMonitoring(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(data)
}

// 6. Unified Mutabaah Integration Endpoints

func (h *EnrichmentHandler) CreateMutabaahLog(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	var req model.CreateMutabaahLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload: " + err.Error()})
		return
	}

	item, err := h.mutabaahRepo.CreateLog(r.Context(), userID, &req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (h *EnrichmentHandler) GetMutabaahHistory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	activityType := r.URL.Query().Get("activity_type")
	limitStr := r.URL.Query().Get("limit")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 50
	}

	items, err := h.mutabaahRepo.GetHistory(r.Context(), userID, activityType, limit)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(items)
}

func (h *EnrichmentHandler) GetTargets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	targets, err := h.mutabaahRepo.GetTargets(r.Context(), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(targets)
}

func (h *EnrichmentHandler) UpdateTargets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	var req model.UpdateUserCommitmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload: " + err.Error()})
		return
	}

	targets, err := h.mutabaahRepo.UpdateTargets(r.Context(), userID, &req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(targets)
}

func (h *EnrichmentHandler) GetAdminMutabaahMonitoring(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	list, err := h.mutabaahRepo.GetAdminMonitoringList(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(list)
}

func (h *EnrichmentHandler) SubmitUstadzEvaluation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	logID := chi.URLParam(r, "id")
	if logID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Missing mutabaah log id"})
		return
	}

	var ustadzID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			ustadzID = idStr
		}
	}

	var req model.UstadzEvaluationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload: " + err.Error()})
		return
	}

	if err := h.mutabaahRepo.SubmitUstadzEvaluation(r.Context(), logID, ustadzID, &req); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Evaluasi ustadz berhasil disimpan",
		"logId":   logID,
		"status":  req.Status,
	})
}
