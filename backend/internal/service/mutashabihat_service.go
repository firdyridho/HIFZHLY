package service

import (
	"fmt"

	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type MutashabihatService interface {
	GetMutashabihat(surahNumber, ayahNumber int) []model.MutashabihItem
}

type mutashabihatServiceImpl struct {
	// Peta kunci: "surah:ayah" -> daftar ayat mutasyabih
	db map[string][]model.MutashabihItem
}

func NewMutashabihatService() MutashabihatService {
	s := &mutashabihatServiceImpl{
		db: make(map[string][]model.MutashabihItem),
	}
	s.loadCuratedData()
	return s
}

func (s *mutashabihatServiceImpl) GetMutashabihat(surahNumber, ayahNumber int) []model.MutashabihItem {
	key := fmt.Sprintf("%d:%d", surahNumber, ayahNumber)
	if items, exists := s.db[key]; exists {
		return items
	}
	return nil
}

func (s *mutashabihatServiceImpl) loadCuratedData() {
	// Contoh Kurasi data Mutasyabihat (mengadopsi standar QUL Tarteel)
	// QS. An-Naba' [78:4] vs QS. An-Naba' [78:5]
	s.db["78:4"] = []model.MutashabihItem{
		{
			SurahNumber: 78,
			SurahName:   "An-Naba'",
			AyahNumber:  5,
			TextArabic:  "ثُمَّ كَلَّا سَيَعْلَمُونَ",
			Similarity:  "Penekanan Berulang (Tawkid)",
			Note:        "Ayat 4 diawali 'كَلَّا سَيَعْلَمُونَ', diikuti ayat 5 dengan tambahan 'ثُمَّ'.",
		},
	}
	s.db["78:5"] = []model.MutashabihItem{
		{
			SurahNumber: 78,
			SurahName:   "An-Naba'",
			AyahNumber:  4,
			TextArabic:  "كَلَّا سَيَعْلَمُونَ",
			Similarity:  "Penekanan Berulang (Tawkid)",
			Note:        "Perhatikan ayat 5 menggunakan awalan 'ثُمَّ كَلَّا'.",
		},
	}

	// QS. At-Takwir [81:1] vs QS. Al-Infitar [82:1]
	s.db["81:1"] = []model.MutashabihItem{
		{
			SurahNumber: 82,
			SurahName:   "Al-Infitar",
			AyahNumber:  1,
			TextArabic:  "إِذَا ٱلسَّمَآءُ ٱنفَطَرَتْ",
			Similarity:  "Struktur Hari Kiamat (Idza)",
			Note:        "At-Takwir diawali 'إِذَا ٱلشَّمْسُ كُوِّرَتْ', jangan tertukar dengan Al-Infitar 'إِذَا ٱلسَّمَآءُ ٱنفَطَرَتْ'.",
		},
	}
	s.db["82:1"] = []model.MutashabihItem{
		{
			SurahNumber: 81,
			SurahName:   "At-Takwir",
			AyahNumber:  1,
			TextArabic:  "إِذَا ٱلشَّمْسُ كُوِّرَتْ",
			Similarity:  "Struktur Hari Kiamat (Idza)",
			Note:        "Al-Infitar menggunakan kata 'ٱلسَّمَآءُ ٱنفَطَرَتْ', bukan 'ٱلشَّمْسُ كُوِّرَتْ'.",
		},
	}

	// QS. Al-Kafirun [109:3] vs QS. Al-Kafirun [109:5]
	s.db["109:3"] = []model.MutashabihItem{
		{
			SurahNumber: 109,
			SurahName:   "Al-Kafirun",
			AyahNumber:  5,
			TextArabic:  "وَلَآ أَنتُمْ عَبِدُونَ مَآ أَعْبُدُ",
			Similarity:  "Pengulangan Ayat Identik",
			Note:        "Ayat 3 dan 5 memiliki lafal yang sama persis, perhatikan jeda ayat 4 di antaranya.",
		},
	}
	s.db["109:5"] = []model.MutashabihItem{
		{
			SurahNumber: 109,
			SurahName:   "Al-Kafirun",
			AyahNumber:  3,
			TextArabic:  "وَلَآ أَنتُمْ عَبِدُونَ مَآ أَعْبُdُونَ",
			Similarity:  "Pengulangan Ayat Identik",
			Note:        "Ayat 5 adalah penegasan kembali dari ayat 3 sebelum ayat penutup 'Lakum diinukum'.",
		},
	}
}

