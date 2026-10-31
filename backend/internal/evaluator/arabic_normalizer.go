package evaluator

import (
	"regexp"
	"strings"
	"unicode"
)

var (
	// Regex untuk menghapus harakat (tashkeel/diacritics: fathah, kasrah, dhammah, sukun, shaddah, tanwin)
	harakatRegex = regexp.MustCompile("[\u064B-\u065F\u0670\u06D6-\u06ED]")
	// Tanda waqaf dan ornamen ayat
	waqfRegex = regexp.MustCompile("[\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED۝۞۩]")
)

// NormalizeArabic membersihkan teks Arab untuk perbandingan adil fonetik dasar
func NormalizeArabic(text string) string {
	// 1. Hapus tanda waqaf
	cleaned := waqfRegex.ReplaceAllString(text, "")

	// 2. Hapus harakat
	cleaned = harakatRegex.ReplaceAllString(cleaned, "")

	// 3. Normalisasi variasi Alif (أ, إ, آ -> ا)
	cleaned = strings.ReplaceAll(cleaned, "أ", "ا")
	cleaned = strings.ReplaceAll(cleaned, "إ", "ا")
	cleaned = strings.ReplaceAll(cleaned, "آ", "ا")
	cleaned = strings.ReplaceAll(cleaned, "ٱ", "ا")

	// 4. Normalisasi Alif Maqshurah dan Ya (ى -> ي)
	cleaned = strings.ReplaceAll(cleaned, "ى", "ي")

	// 5. Normalisasi Ta Marbuthah (ة -> ه)
	cleaned = strings.ReplaceAll(cleaned, "ة", "ه")

	// 6. Rapikan spasi
	words := strings.Fields(cleaned)
	return strings.Join(words, " ")
}

// SplitWords memecah teks menjadi potongan kata Arab
func SplitWords(text string) []string {
	var words []string
	fields := strings.Fields(text)
	for _, f := range fields {
		trimmed := strings.TrimFunc(f, func(r rune) bool {
			return unicode.IsPunct(r) || unicode.IsSpace(r)
		})
		if trimmed != "" {
			words = append(words, trimmed)
		}
	}
	return words
}
