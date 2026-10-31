package model

// SurahSummary ringkasan surah dari EQuran.id
type SurahSummary struct {
	Number         int    `json:"number"`
	NameArabic     string `json:"nameArabic"`
	NameLatin      string `json:"nameLatin"`
	NumberOfAyahs  int    `json:"numberOfAyahs"`
	RevelationType string `json:"revelationType"`
	Translation    string `json:"translation"`
}

// AyahDetail teks ayat lengkap
type AyahDetail struct {
	AyahNumber  int    `json:"ayahNumber"`
	TextArabic  string `json:"textArabic"`
	TextLatin   string `json:"textLatin"`
	Translation string `json:"translation"`
	AudioUrl    string `json:"audioUrl"`
}

// SurahDetail detail surah lengkap beserta daftar ayat
type SurahDetail struct {
	Number         int          `json:"number"`
	NameArabic     string       `json:"nameArabic"`
	NameLatin      string       `json:"nameLatin"`
	NumberOfAyahs  int          `json:"numberOfAyahs"`
	RevelationType string       `json:"revelationType"`
	Translation    string       `json:"translation"`
	AudioFull      string       `json:"audioFull"`
	Ayahs          []AyahDetail `json:"ayahs"`
}

