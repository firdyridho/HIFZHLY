package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type QuranService interface {
	GetSurahs() ([]model.SurahSummary, error)
	GetSurahDetail(surahNumber int) (*model.SurahDetail, error)
}

type quranServiceImpl struct {
	httpClient *http.Client
	baseURL    string
}

func NewQuranService() QuranService {
	return &quranServiceImpl{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		baseURL:    "https://equran.id/api/v2",
	}
}

type equranListResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    []struct {
		Nomor         int    `json:"nomor"`
		Nama          string `json:"nama"`
		NamaLatin     string `json:"namaLatin"`
		JumlahAyat    int    `json:"jumlahAyat"`
		TempatTurun   string `json:"tempatTurun"`
		Arti          string `json:"arti"`
		Deskripsi     string `json:"deskripsi"`
		AudioFull     map[string]string `json:"audioFull"`
	} `json:"data"`
}

type equranDetailResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Nomor       int    `json:"nomor"`
		Nama        string `json:"nama"`
		NamaLatin   string `json:"namaLatin"`
		JumlahAyat  int    `json:"jumlahAyat"`
		TempatTurun string `json:"tempatTurun"`
		Arti        string `json:"arti"`
		AudioFull   map[string]string `json:"audioFull"`
		Ayat        []struct {
			NomorAyat int    `json:"nomorAyat"`
			TeksArab  string `json:"teksArab"`
			TeksLatin string `json:"teksLatin"`
			TeksIndonesia string `json:"teksIndonesia"`
			Audio     map[string]string `json:"audio"`
		} `json:"ayat"`
	} `json:"data"`
}

func (s *quranServiceImpl) GetSurahs() ([]model.SurahSummary, error) {
	url := fmt.Sprintf("%s/surat", s.baseURL)
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi EQuran.id: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("EQuran.id mengembalikan status: %d", resp.StatusCode)
	}

	var res equranListResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("gagal decode respon EQuran.id: %w", err)
	}

	var list []model.SurahSummary
	for _, item := range res.Data {
		list = append(list, model.SurahSummary{
			Number:         item.Nomor,
			NameArabic:     item.Nama,
			NameLatin:      item.NamaLatin,
			NumberOfAyahs:  item.JumlahAyat,
			RevelationType: item.TempatTurun,
			Translation:    item.Arti,
		})
	}

	return list, nil
}

func (s *quranServiceImpl) GetSurahDetail(surahNumber int) (*model.SurahDetail, error) {
	url := fmt.Sprintf("%s/surat/%d", s.baseURL, surahNumber)
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi EQuran.id: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("EQuran.id mengembalikan status: %d", resp.StatusCode)
	}

	var res equranDetailResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("gagal decode detail surah: %w", err)
	}

	audioFull := ""
	if qari, ok := res.Data.AudioFull["05"]; ok {
		audioFull = qari // Misyari Rasyid
	} else if len(res.Data.AudioFull) > 0 {
		for _, v := range res.Data.AudioFull {
			audioFull = v
			break
		}
	}

	detail := &model.SurahDetail{
		Number:         res.Data.Nomor,
		NameArabic:     res.Data.Nama,
		NameLatin:      res.Data.NamaLatin,
		NumberOfAyahs:  res.Data.JumlahAyat,
		RevelationType: res.Data.TempatTurun,
		Translation:    res.Data.Arti,
		AudioFull:      audioFull,
	}

	for _, item := range res.Data.Ayat {
		ayahAudio := ""
		if a, ok := item.Audio["05"]; ok {
			ayahAudio = a
		} else if len(item.Audio) > 0 {
			for _, v := range item.Audio {
				ayahAudio = v
				break
			}
		}

		detail.Ayahs = append(detail.Ayahs, model.AyahDetail{
			AyahNumber:  item.NomorAyat,
			TextArabic:  item.TeksArab,
			TextLatin:   item.TeksLatin,
			Translation: item.TeksIndonesia,
			AudioUrl:    ayahAudio,
		})
	}

	return detail, nil
}

