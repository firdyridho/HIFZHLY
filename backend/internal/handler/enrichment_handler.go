package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

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
