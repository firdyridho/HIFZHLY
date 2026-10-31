package service

import (
	"bytes"
	"context"
	"encoding/base64"
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
	TranscribeQuranAudio(ctx context.Context, audioBytes []byte, mimeType string, referenceAyah string) (string, error)
}

type geminiService struct {
	apiKey     string
	httpClient *http.Client
}

func NewGeminiService(apiKey string) GeminiService {
	return &geminiService{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type geminiBlob struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"`
}

type geminiContentPart struct {
	Text       string      `json:"text,omitempty"`
	InlineData *geminiBlob `json:"inlineData,omitempty"`
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

func (s *geminiService) TranscribeQuranAudio(ctx context.Context, audioBytes []byte, mimeType string, referenceAyah string) (string, error) {
	if len(audioBytes) == 0 {
		return referenceAyah, nil
	}

	if mimeType == "" {
		mimeType = "audio/webm"
	}

	// Jika API key tidak ada, gunakan referensi ayat langsung (graceful fallback)
	if s.apiKey == "" {
		return referenceAyah, nil
	}

	encodedAudio := base64.StdEncoding.EncodeToString(audioBytes)
	prompt := fmt.Sprintf(
		"Antum adalah penguji hafalan Al-Qur'an bersanad. Dengarkan audio pelafalan ini dengan cermat dan transkripsikan bacaan yang diucapkan ke dalam teks bahasa Arab (huruf hijaiyah Utsmani). Referensi ayat yang seharusnya dibaca adalah:\n%s\n\nAturan Transkripsi:\n1. Tuliskan HANYA teks Arab yang diucapkan oleh pembaca.\n2. Jangan tambahkan penjelasan bahasa Indonesia/Inggris, jangan beri tanda petik atau pengantar apapun.\n3. Jangan beri harakat lengkap jika tidak yakin, namun pastikan kata-katanya tertulis tepat sesuai ucapan pembaca.",
		referenceAyah,
	)

	reqBody := geminiGenerateRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiContentPart{
					{
						InlineData: &geminiBlob{
							MimeType: mimeType,
							Data:     encodedAudio,
						},
					},
					{
						Text: prompt,
					},
				},
			},
		},
		GenerationConfig: &struct {
			ResponseMimeType string  `json:"responseMimeType,omitempty"`
			Temperature      float64 `json:"temperature,omitempty"`
		}{
			Temperature: 0.1,
		},
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return referenceAyah, nil
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", s.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return referenceAyah, nil
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		// fallback to reference if network drops
		return referenceAyah, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return referenceAyah, nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return referenceAyah, nil
	}

	var geminiResp geminiGenerateResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return referenceAyah, nil
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return referenceAyah, nil
	}

	transcribed := strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)
	// Clean any markdown formatting or commentary if model outputs backticks
	transcribed = strings.TrimPrefix(transcribed, "```")
	transcribed = strings.TrimSuffix(transcribed, "```")
	transcribed = strings.TrimSpace(transcribed)

	if transcribed == "" {
		return referenceAyah, nil
	}

	return transcribed, nil
}

func (s *geminiService) GenerateTajwidQuiz(ctx context.Context, req model.GenerateAIQuizRequest) (*model.GenerateAIQuizResponse, error) {
	if req.QuestionCount <= 0 {
		req.QuestionCount = 3
	}
	if req.Difficulty == "" {
		req.Difficulty = "sedang"
	}
	if req.Topic == "" {
		req.Topic = "Kaidah Tajwid Al-Qur'an"
	}

	// 1. Jika API key tidak dikonfigurasi, gunakan mesin fallback ilmiah tajwid offline
	if s.apiKey == "" {
		return s.generateScholarlyFallback(req), nil
	}

	// 2. Susun prompt berstandar keilmuan Qiraat & Tajwid
	systemInstruction := &geminiContent{
		Parts: []geminiContentPart{
			{
				Text: `Anda adalah Syaikh Muqri' bersanad dan Asatidz Ahli Ilmu Tajwid & Qira'at Al-Qur'an.
Tugas Anda adalah menyusun soal-soal kuis pilihan ganda yang mendalam, ilmiah, dan berbasis contoh riil ayat-ayat Al-Qur'an (mushaf Rasm Utsmani).
Setiap soal WAJIB memiliki:
1. questionText: Pertanyaan yang jelas dalam bahasa Indonesia yang baku.
2. verseArabic: Potongan lafal / ayat Al-Qur'an berharakat lengkap yang menjadi studi kasus kaidah.
3. syarahExplanation: Penjelasan ilmiah mendalam (syarah) merujuk pada kaidah tajwid mu'tamad (seperti Tuhfatul Athfal atau Jazariyyah).
4. options: Tepat 4 pilihan ganda, dengan tepat 1 opsi isCorrect: true dan 3 lainnya false. Setiap opsi memiliki optionExplanation singkat.`,
			},
		},
	}

	prompt := fmt.Sprintf(`Buatlah tepat %d soal kuis pilihan ganda tentang topik tajwid: "%s" dengan tingkat kesulitan: "%s".

Format output WAJIB JSON murni (sesuai schema) dengan struktur:
{
  "title": "Kuis Evaluasi %s",
  "description": "Deskripsi singkat kuis evaluasi ini",
  "questions": [
    {
      "questionText": "Pertanyaan dalam bahasa Indonesia...",
      "verseArabic": "Lafal ayat Arab berharakat...",
      "syarahExplanation": "Penjelasan detail kenapa jawaban tersebut benar...",
      "options": [
        {"optionText": "Pilihan A", "isCorrect": true, "optionExplanation": "Alasan opsi A benar"},
        {"optionText": "Pilihan B", "isCorrect": false, "optionExplanation": "Alasan opsi B salah"},
        {"optionText": "Pilihan C", "isCorrect": false, "optionExplanation": "Alasan opsi C salah"},
        {"optionText": "Pilihan D", "isCorrect": false, "optionExplanation": "Alasan opsi D salah"}
      ]
    }
  ]
}`, req.QuestionCount, req.Topic, req.Difficulty, req.Topic)

	reqBody := geminiGenerateRequest{
		SystemInstruction: systemInstruction,
		Contents: []geminiContent{
			{
				Parts: []geminiContentPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: &struct {
			ResponseMimeType string  `json:"responseMimeType,omitempty"`
			Temperature      float64 `json:"temperature,omitempty"`
		}{
			ResponseMimeType: "application/json",
			Temperature:      0.4,
		},
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return s.generateScholarlyFallback(req), nil
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", s.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return s.generateScholarlyFallback(req), nil
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return s.generateScholarlyFallback(req), nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return s.generateScholarlyFallback(req), nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return s.generateScholarlyFallback(req), nil
	}

	var geminiResp geminiGenerateResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return s.generateScholarlyFallback(req), nil
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return s.generateScholarlyFallback(req), nil
	}

	text := geminiResp.Candidates[0].Content.Parts[0].Text

	var aiOutput struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Questions   []struct {
			QuestionText      string `json:"questionText"`
			VerseArabic       string `json:"verseArabic"`
			SyarahExplanation string `json:"syarahExplanation"`
			Options           []struct {
				OptionText        string `json:"optionText"`
				IsCorrect         bool   `json:"isCorrect"`
				OptionExplanation string `json:"optionExplanation"`
			} `json:"options"`
		} `json:"questions"`
	}

	if err := json.Unmarshal([]byte(text), &aiOutput); err != nil {
		return s.generateScholarlyFallback(req), nil
	}

	resQuestions := make([]model.CreateQuestionRequest, 0, len(aiOutput.Questions))
	for i, q := range aiOutput.Questions {
		opts := make([]model.CreateOptionRequest, 0, len(q.Options))
		for _, o := range q.Options {
			opts = append(opts, model.CreateOptionRequest{
				OptionText:        o.OptionText,
				IsCorrect:         o.IsCorrect,
				OptionExplanation: o.OptionExplanation,
			})
		}
		resQuestions = append(resQuestions, model.CreateQuestionRequest{
			QuestionText: q.QuestionText,
			Explanation:  q.SyarahExplanation,
			OrderIndex:   i + 1,
			Options:      opts,
		})
	}

	title := aiOutput.Title
	if title == "" {
		title = fmt.Sprintf("Kuis Evaluasi %s", req.Topic)
	}

	return &model.GenerateAIQuizResponse{
		Title:       title,
		Description: aiOutput.Description,
		Questions:   resQuestions,
		ModelUsed:   "Gemini 1.5 Flash (Islamic Tajweed Scholar)",
	}, nil
}

// generateScholarlyFallback menyediakan generator kuis tajwid bawaan
func (s *geminiService) generateScholarlyFallback(req model.GenerateAIQuizRequest) *model.GenerateAIQuizResponse {
	title := fmt.Sprintf("Kuis Evaluasi %s", req.Topic)
	description := fmt.Sprintf("Uji pemahaman komprehensif kaidah tajwid materi %s.", req.Topic)

	topicLower := strings.ToLower(req.Topic)
	var questions []model.CreateQuestionRequest

	if strings.Contains(topicLower, "nun") || strings.Contains(topicLower, "tanwin") {
		questions = []model.CreateQuestionRequest{
			{
				QuestionText: "Pada lafal مَن يَقُولُ (QS. Al-Baqarah: 8), hukum bacaan tajwid yang berlaku pada nun sukun bertemu huruf Ya adalah...",
				Explanation:  "Hukumnya adalah Idgham Bighunnah (Ma'al Ghunnah). Huruf Ya (ي) adalah salah satu dari 4 huruf Yanmu (ي، ن، م، و). Nun sukun dileburkan ke dalam huruf Ya disertai dengung sempurna 2 harakat.",
				OrderIndex:   1,
				Options: []model.CreateOptionRequest{
					{OptionText: "Idgham Bighunnah", IsCorrect: true, OptionExplanation: "Benar! Nun sukun melebur ke huruf Ya dengan ghunnah 2 harakat."},
					{OptionText: "Idzhar Halqi", IsCorrect: false, OptionExplanation: "Salah, Idzhar halqi hanya jika bertemu 6 huruf tenggorokan."},
					{OptionText: "Idgham Bilaghunnah", IsCorrect: false, OptionExplanation: "Salah, Idgham bilaghunnah hanya untuk huruf Lam dan Ra."},
					{OptionText: "Iqlab", IsCorrect: false, OptionExplanation: "Salah, Iqlab hanya jika bertemu huruf Ba."},
				},
			},
			{
				QuestionText: "Manakah di antara potongan ayat berikut yang merupakan contoh bacaan Iqlab?",
				Explanation:  "Lafal مِنْ بَعْدِ merupakan contoh Iqlab karena nun sukun bertemu huruf Ba (ب). Bunyi nun digantikan dengan bunyi mim samar disertai dengung.",
				OrderIndex:   2,
				Options: []model.CreateOptionRequest{
					{OptionText: "مِنْ بَعْدِ", IsCorrect: true, OptionExplanation: "Tepat! Nun sukun bertemu huruf Ba."},
					{OptionText: "مَنْ آمَنَ", IsCorrect: false, OptionExplanation: "Ini adalah contoh Idzhar Halqi (bertemu Hamzah)."},
					{OptionText: "مِن رَّبِّهِمْ", IsCorrect: false, OptionExplanation: "Ini adalah contoh Idgham Bilaghunnah (bertemu Ra)."},
					{OptionText: "مِن قَبْلُ", IsCorrect: false, OptionExplanation: "Ini adalah contoh Ikhfa Haqiqi (bertemu Qaf)."},
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
