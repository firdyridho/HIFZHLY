package model

// MutashabihItem informasi ayat serupa antar-surah (dari QUL Tarteel standard)
type MutashabihItem struct {
	SurahNumber int    `json:"surahNumber"`
	SurahName   string `json:"surahName"`
	AyahNumber  int    `json:"ayahNumber"`
	TextArabic  string `json:"textArabic"`
	Similarity  string `json:"similarity"` // e.g. "Identik", "Struktur Serupa", "Akhiran Berbeda"
	Note        string `json:"note"`
}

// SurahSummary ringkasan surah dari EQuran.id
type SurahSummary struct {
	Number         int    `json:"number"`
	NameArabic     string `json:"nameArabic"`
	NameLatin      string `json:"nameLatin"`
	NumberOfAyahs  int    `json:"numberOfAyahs"`
	RevelationType string `json:"revelationType"`
	Translation    string `json:"translation"`
}

// AyahDetail teks ayat lengkap yang diperkaya dengan data Mutashabihat
type AyahDetail struct {
	AyahNumber   int              `json:"ayahNumber"`
	TextArabic   string           `json:"textArabic"`
	TextLatin    string           `json:"textLatin"`
	Translation  string           `json:"translation"`
	AudioUrl     string           `json:"audioUrl"`
	Mutashabihat []MutashabihItem `json:"mutashabihat,omitempty"`
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
