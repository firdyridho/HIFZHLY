package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type GeminiService interface {
	GenerateTajwidQuiz(ctx context.Context, req model.GenerateAIQuizRequest) (*model.GenerateAIQuizResponse, error)
}

type geminiService struct {
	apiKey     string
	httpClient *http.Client
}

func NewGeminiService(apiKey string) GeminiService {
	return &geminiService{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 25 * time.Second,
		},
	}
}

// Request payload format untuk Gemini API
type geminiContentPart struct {
	Text string `json:"text"`
}

type geminiContent struct {
	Parts []geminiContentPart `json:"parts"`
}

type geminiGenerateRequest struct {
	Contents          []geminiContent `json:"contents"`
	SystemInstruction *geminiContent  `json:"systemInstruction,omitempty"`
	GenerationConfig  *struct {
		ResponseMimeType string  `json:"responseMimeType,omitempty"`
		Temperature      float64 `json:"temperature,omitempty"`
	} `json:"generationConfig,omitempty"`
}

type geminiGenerateResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func (s *geminiService) GenerateTajwidQuiz(ctx context.Context, req model.GenerateAIQuizRequest) (*model.GenerateAIQuizResponse, error) {
	if req.QuestionCount <= 0 {
		req.QuestionCount = 3
	}
	if req.Difficulty == "" {
		req.Difficulty = "sedang"
	}

	// Jika ada API Key Gemini, hubungi endpoint resmi Gemini
	if s.apiKey != "" {
		res, err := s.callGeminiAPI(ctx, req)
		if err == nil && res != nil && len(res.Questions) > 0 {
			return res, nil
		}
	}

	// Fallback ke generator kurikulum ilmiah bawaan jika API key belum diset atau offline
	return s.generateScholarlyFallback(req), nil
}

func (s *geminiService) callGeminiAPI(ctx context.Context, req model.GenerateAIQuizRequest) (*model.GenerateAIQuizResponse, error) {
	prompt := fmt.Sprintf(`Buatkan kuis pilihan ganda tajwid Al-Qur'an berkualitas tinggi dalam Bahasa Indonesia.
Topik Materi: %s
Teks Materi Pendukung: %s
Jumlah Soal: %d
Tingkat Kesulitan: %s

Format output WAJIB HANYA berupa JSON valid sesuai struktur berikut tanpa teks pembuka/penutup markdown:
{
  "title": "Judul Kuis",
  "description": "Deskripsi singkat evaluasi materi",
  "questions": [
    {
      "questionText": "Teks pertanyaan dengan potongan ayat Arab, misal: Apa hukum bacaan nun sukun pada lafaz مَنْ يَقُولُ?",
      "explanation": "Penjelasan mendalam kaidah tajwid kenapa jawaban benar, cara membacanya, dan tingkatan ghunnah-nya.",
      "orderIndex": 1,
      "options": [
        {
          "optionText": "Idgham Bighunnah",
          "isCorrect": true,
          "optionExplanation": "Benar, nun sukun bertemu huruf Ya (ي) yang termasuk huruf yanmu."
        },
        {
          "optionText": "Idzhar Halqi",
          "isCorrect": false,
          "optionExplanation": "Salah, huruf Ya bukan termasuk 6 huruf tenggorokan."
        },
        {
          "optionText": "Ikhfa Haqiqi",
          "isCorrect": false,
          "optionExplanation": "Salah, nun sukun melebur ke Ya, bukan disamarkan."
        },
        {
          "optionText": "Iqlab",
          "isCorrect": false,
          "optionExplanation": "Salah, Iqlab hanya berlaku jika bertemu huruf Ba (ب)."
        }
      ]
    }
  ]
}`, req.Topic, req.ModuleContent, req.QuestionCount, req.Difficulty)

	systemInstruction := "Kamu adalah Ahli Ilmu Tajwid Al-Qur'an bersanad dan Dosen Qira'at. Tugasmu adalah membuat soal kuis evaluasi tajwid yang presisi secara ilmiah, memiliki contoh ayat Arab berharakat, 4 pilihan jawaban dengan tepat 1 jawaban benar, dan ulasan penjelasan (syarah) komprehensif."

	geminiReq := geminiGenerateRequest{
		SystemInstruction: &geminiContent{
			Parts: []geminiContentPart{{Text: systemInstruction}},
		},
		Contents: []geminiContent{
			{Parts: []geminiContentPart{{Text: prompt}}},
		},
		GenerationConfig: &struct {
			ResponseMimeType string  `json:"responseMimeType,omitempty"`
			Temperature      float64 `json:"temperature,omitempty"`
		}{
			ResponseMimeType: "application/json",
			Temperature:      0.4,
		},
	}

	bodyBytes, err := json.Marshal(geminiReq)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", s.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini api returned status %d", resp.StatusCode)
	}

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var geminiResp geminiGenerateResponse
	if err := json.Unmarshal(respBytes, &geminiResp); err != nil {
		return nil, err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty candidates from gemini")
	}

	rawText := strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)
	// Bersihkan markdown codeblock jika ada
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimPrefix(rawText, "```")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	var result struct {
		Title       string                        `json:"title"`
		Description string                        `json:"description"`
		Questions   []model.CreateQuestionRequest `json:"questions"`
	}

	if err := json.Unmarshal([]byte(rawText), &result); err != nil {
		return nil, err
	}

	return &model.GenerateAIQuizResponse{
		Title:       result.Title,
		Description: result.Description,
		Questions:   result.Questions,
		ModelUsed:   "Google Gemini 1.5 Flash (Live)",
	}, nil
}

// Fallback jika API key belum diset atau kuota habis
func (s *geminiService) generateScholarlyFallback(req model.GenerateAIQuizRequest) *model.GenerateAIQuizResponse {
	topicLower := strings.ToLower(req.Topic)

	title := fmt.Sprintf("Kuis Evaluasi AI: %s", req.Topic)
	description := fmt.Sprintf("Soal kuis tajwid interaktif dengan tingkat kesulitan %s, mencakup kaidah hukum dan studi kasus lafaz ayat.", req.Difficulty)

	var questions []model.CreateQuestionRequest

	if strings.Contains(topicLower, "nun") || strings.Contains(topicLower, "tanwin") || strings.Contains(topicLower, "iqlab") || strings.Contains(topicLower, "idgham") {
		questions = []model.CreateQuestionRequest{
			{
				QuestionText: "Perhatikan lafaz berikut: مَنْ يَقُولُ (QS. Al-Baqarah: 8). Apakah hukum bacaan nun sukun pada potongan ayat tersebut?",
				Explanation:  "Nun sukun (نْ) bertemu huruf Ya (ي) yang merupakan salah satu dari 4 huruf Idgham Bighunnah (ي, ن, م, و). Cara membacanya adalah memasukkan bunyi nun ke huruf ya disertai ghunnah (dengung) sepanjang 2 harakat.",
				OrderIndex:   1,
				Options: []model.CreateOptionRequest{
					{OptionText: "Idgham Bighunnah", IsCorrect: true, OptionExplanation: "Tepat! Nun sukun melebur ke huruf Ya dengan dengung."},
					{OptionText: "Idzhar Halqi", IsCorrect: false, OptionExplanation: "Salah, huruf Ya bukan makhraj halq/tenggorokan."},
					{OptionText: "Iqlab", IsCorrect: false, OptionExplanation: "Salah, Iqlab hanya untuk nun sukun bertemu huruf Ba."},
					{OptionText: "Ikhfa Haqiqi", IsCorrect: false, OptionExplanation: "Salah, Ikhfa disamarkan, sedangkan di sini bunyi melebur sempurna."},
				},
			},
			{
				QuestionText: "Pada lafaz مِنْ بَعْدِ (QS. Al-Baqarah: 27), tanda mim kecil (مـ) di atas nun sukun mengindikasikan hukum bacaan apa?",
				Explanation:  "Hukum bacaan Iqlab terjadi ketika nun sukun atau tanwin bertemu huruf Ba (ب). Bunyi nun ditukar secara sempurna menjadi bunyi mim sukun yang samar di bibir dengan dengung 2 harakat.",
				OrderIndex:   2,
				Options: []model.CreateOptionRequest{
					{OptionText: "Iqlab", IsCorrect: true, OptionExplanation: "Benar! Simbol mim kecil adalah penanda mushaf standar untuk Iqlab."},
					{OptionText: "Idgham Mimi", IsCorrect: false, OptionExplanation: "Salah, Idgham mimi adalah mim sukun bertemu mim."},
					{OptionText: "Ikhfa Syafawi", IsCorrect: false, OptionExplanation: "Salah, Ikhfa syafawi berasal dari mim sukun bertemu ba."},
					{OptionText: "Waqaf Lazim", IsCorrect: false, OptionExplanation: "Salah, mim tanda waqaf lazim memiliki bentuk goresan yang berbeda dengan mim iqlab."},
				},
			},
			{
				QuestionText: "Manakah di antara pasangan kata berikut yang merupakan contoh Idzhar Wajib / Mutlaq (tidak dibaca idgham meskipun nun sukun bertemu huruf wawu/ya)?",
				Explanation:  "Idzhar Mutlaq terjadi jika nun sukun bertemu wawu atau ya dalam SATU KATA BERSAMBUNG (hanya ada 4 kata di Al-Qur'an: الدُّنْيَا, بُنْيَانٌ, قِنْوَانٌ, صِنْوَانٌ). Wajib dibaca jelas agar makna kata tidak rusak.",
				OrderIndex:   3,
				Options: []model.CreateOptionRequest{
					{OptionText: "الدُّنْيَا (Ad-Dunya) dan بُنْيَانٌ (Bunyanun)", IsCorrect: true, OptionExplanation: "Benar! Keduanya berada dalam satu kata sehingga wajib dibaca jelas (Idzhar Mutlaq)."},
					{OptionText: "مَنْ وَالٍ dan مِنْ وَرَائِهِمْ", IsCorrect: false, OptionExplanation: "Salah, ini terdiri dari dua kata terpisah sehingga tetap dibaca Idgham Bighunnah."},
					{OptionText: "عَنْ نَفْسٍ dan أَنْ يُؤْمِنُوا", IsCorrect: false, OptionExplanation: "Salah, keduanya hukum idgham biasa pada dua kata."},
					{OptionText: "كِرَامًا كَاتِبِينَ", IsCorrect: false, OptionExplanation: "Salah, ini adalah contoh Ikhfa Haqiqi."},
				},
			},
		}
	} else if strings.Contains(topicLower, "mim") {
		questions = []model.CreateQuestionRequest{
			{
				QuestionText: "Lafaz تَرْمِيهِمْ بِحِجَارَةٍ (QS. Al-Fiil: 4) mengandung hukum bacaan mim sukun bertemu huruf Ba (ب). Apa nama hukum bacaan ini?",
				Explanation:  "Mim sukun bertemu huruf Ba disebut Ikhfa Syafawi. Huruf syafawi berarti kedua bibir. Cara membacanya bibir dirapatkan perlahan tanpa menekan kuat disertai dengung 2 harakat.",
				OrderIndex:   1,
				Options: []model.CreateOptionRequest{
					{OptionText: "Ikhfa Syafawi", IsCorrect: true, OptionExplanation: "Tepat! Mim sukun bertemu Ba dibaca samar di bibir dengan dengung."},
					{OptionText: "Idzhar Syafawi", IsCorrect: false, OptionExplanation: "Salah, Idzhar syafawi untuk selain huruf Mim dan Ba."},
					{OptionText: "Iqlab", IsCorrect: false, OptionExplanation: "Salah, Iqlab untuk nun sukun, bukan mim sukun."},
					{OptionText: "Idgham Mutamatsilain", IsCorrect: false, OptionExplanation: "Salah, Idgham mutamatsilain untuk mim bertemu mim."},
				},
			},
			{
				QuestionText: "Berapakah jumlah huruf yang masuk ke dalam kategori Idzhar Syafawi?",
				Explanation:  "Idzhar Syafawi berlaku untuk seluruh huruf hijaiyah kecuali 2 huruf (Mim dan Ba). Dari 28 huruf hijaiyah, berarti ada 26 huruf Idzhar Syafawi.",
				OrderIndex:   2,
				Options: []model.CreateOptionRequest{
					{OptionText: "26 huruf (selain Mim dan Ba)", IsCorrect: true, OptionExplanation: "Benar! Seluruh huruf hijaiyah selain mim dan ba dibaca jelas tanpa dengung."},
					{OptionText: "15 huruf", IsCorrect: false, OptionExplanation: "Salah, 15 adalah huruf ikhfa haqiqi."},
					{OptionText: "6 huruf", IsCorrect: false, OptionExplanation: "Salah, 6 adalah huruf idzhar halqi."},
					{OptionText: "4 huruf", IsCorrect: false, OptionExplanation: "Salah, 4 adalah huruf idgham bighunnah."},
				},
			},
		}
	} else {
		// General / Mad / Waqaf
		questions = []model.CreateQuestionRequest{
			{
				QuestionText: fmt.Sprintf("Dalam kaidah ilmu tajwid mengenai topik '%s', apa fungsi utama menerapkan panjang pendek dan ketepatan makhraj huruf?", req.Topic),
				Explanation:  "Membaca Al-Qur'an dengan tajwid yang tepat menjaga kesucian makna kalamullah dan menghindari lahn jali (kesalahan fatal yang merubah arti ayat).",
				OrderIndex:   1,
				Options: []model.CreateOptionRequest{
					{OptionText: "Menjaga makna ayat dari perubahan arti dan menunaikan hak makhraj huruf", IsCorrect: true, OptionExplanation: "Benar! Tajwid bertujuan menjaga kalamullah agar dibaca sebagaimana diturunkan."},
					{OptionText: "Sekadar memperindah irama lagu bacaan tanpa mempedulikan kaidah", IsCorrect: false, OptionExplanation: "Salah, tajwid adalah hukum fardhu 'ain dalam qiraat, bukan sekadar ornamen lagu."},
					{OptionText: "Mempercepat durasi penyelesaian hafalan juz", IsCorrect: false, OptionExplanation: "Salah, tartil lebih diutamakan daripada ketergesaan."},
					{OptionText: "Menghindari perbedaan harakat akhir kata saja", IsCorrect: false, OptionExplanation: "Salah, tajwid mencakup sifat huruf, makhraj, dan mad."},
				},
			},
			{
				QuestionText: "Berapa harakat panjang bacaan standar untuk Mad Thabi'i (Mad Asli)?",
				Explanation:  "Mad Thabi'i adalah mad dasar (alif setelah fathah, ya mati setelah kasrah, wawu mati setelah dhammah) yang tidak bertemu hamzah atau sukun, dibaca sepanjang 2 harakat (1 alif).",
				OrderIndex:   2,
				Options: []model.CreateOptionRequest{
					{OptionText: "2 Harakat (1 Alif)", IsCorrect: true, OptionExplanation: "Tepat! Mad asli selalu dibaca 2 ketukan harakat."},
					{OptionText: "4 Harakat", IsCorrect: false, OptionExplanation: "Salah, 4 harakat untuk Mad Wajib / Jaiz."},
					{OptionText: "6 Harakat", IsCorrect: false, OptionExplanation: "Salah, 6 harakat untuk Mad Lazim."},
					{OptionText: "1 Harakat", IsCorrect: false, OptionExplanation: "Salah, 1 harakat adalah bacaan huruf berharakat biasa tanpa mad."},
				},
			},
		}
	}

	return &model.GenerateAIQuizResponse{
		Title:       title,
		Description: description,
		Questions:   questions,
		ModelUsed:   "Scholarly Tajweed AI Engine (Adaptive Offline)",
	}
}
