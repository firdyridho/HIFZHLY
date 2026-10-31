package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

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
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	contentType := r.Header.Get("Content-Type")

	// Skenario 1: Input Audio multipart/form-data dari mikrofon browser
	if strings.HasPrefix(contentType, "multipart/form-data") {
		err := r.ParseMultipartForm(10 << 20) // 10 MB max
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Gagal memproses form multipart: ukuran melebihi batas atau korup"})
			return
		}

		surahStr := r.FormValue("surahNumber")
		ayahStr := r.FormValue("ayahNumber")
		userTextFallback := r.FormValue("userText")

		surahNumber, _ := strconv.Atoi(surahStr)
		ayahNumber, _ := strconv.Atoi(ayahStr)

		if surahNumber < 1 || surahNumber > 114 || ayahNumber < 1 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Nomor surah (1-114) atau nomor ayat tidak valid"})
			return
		}

		var audioBytes []byte
		var mimeType string

		file, header, err := r.FormFile("audio")
		if err == nil && file != nil {
			defer file.Close()
			audioBytes, _ = io.ReadAll(file)
			mimeType = header.Header.Get("Content-Type")
			if mimeType == "" {
				mimeType = "audio/webm"
			}
		}

		res, err := h.murojaahService.EvaluateAudio(r.Context(), userID, surahNumber, ayahNumber, audioBytes, mimeType, userTextFallback)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(res)
		return
	}

	// Skenario 2: Input Teks JSON biasa
	var req model.EvaluateTextRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Format request body tidak valid"})
		return
	}

	if req.SurahNumber < 1 || req.SurahNumber > 114 || req.AyahNumber < 1 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: "Nomor surah (1-114) atau nomor ayat tidak valid"})
		return
	}

	res, err := h.murojaahService.EvaluateText(r.Context(), userID, req.SurahNumber, req.AyahNumber, req.UserText)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *MurojaahHandler) GetDueToday(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var userID string
	if val := r.Context().Value("userID"); val != nil {
		if idStr, ok := val.(string); ok {
			userID = idStr
		}
	}

	res, err := h.murojaahService.GetDueToday(r.Context(), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ErrorResponse{Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
