package handler

import (
	"encoding/json"
	"net/http"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/fifa-team/hifzhly-backend/internal/service"
)

type MurojaahHandler struct {
	murojaahService service.MurojaahService
}

func NewMurojaahHandler(murojaahService service.MurojaahService) *MurojaahHandler {
	return &MurojaahHandler{murojaahService: murojaahService}
}

func (h *MurojaahHandler) Evaluate(w http.ResponseWriter, r *http.Request) {
	var req model.EvaluateTextRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Format request body tidak valid"})
		return
	}

	if req.SurahNumber < 1 || req.SurahNumber > 114 || req.AyahNumber < 1 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Surah atau nomor ayat tidak valid"})
		return
	}

	res, err := h.murojaahService.EvaluateText(r.Context(), req.SurahNumber, req.AyahNumber, req.UserText)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

