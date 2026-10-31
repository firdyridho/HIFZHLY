package evaluator

import (
	"math"

	"github.com/fifa-team/hifzhly-backend/internal/model"
)

type WordDiffItem struct {
	Index       int    `json:"index"`
	Word        string `json:"word"`
	Status      string `json:"status"` // "correct", "substituted", "deleted", "inserted"
	UserSaid    string `json:"userSaid,omitempty"`
	MistakeType string `json:"mistakeType,omitempty"`
}

type EvaluationResult struct {
	Score           float64        `json:"score"`
	TranscribedText string         `json:"transcribedText"`
	ReferenceText   string         `json:"referenceText"`
	Substitutions   int            `json:"substitutions"`
	Deletions       int            `json:"deletions"`
	Insertions      int            `json:"insertions"`
	WordDiff        []WordDiffItem `json:"wordDiff"`
}

// EvaluateRecitation membandingkan bacaan pengguna terhadap teks referensi ayat
func EvaluateRecitation(referenceRaw, userRaw string) EvaluationResult {
	refWordsOriginal := SplitWords(referenceRaw)
	userWordsOriginal := SplitWords(userRaw)

	refNormalized := SplitWords(NormalizeArabic(referenceRaw))
	userNormalized := SplitWords(NormalizeArabic(userRaw))

	n := len(refNormalized)
	m := len(userNormalized)

	// Inisialisasi matriks dynamic programming untuk Levenshtein edit distance
	dp := make([][]int, n+1)
	for i := range dp {
		dp[i] = make([]int, m+1)
	}

	for i := 0; i <= n; i++ {
		dp[i][0] = i // deletions
	}
	for j := 0; j <= m; j++ {
		dp[0][j] = j // insertions
	}

	for i := 1; i <= n; i++ {
		for j := 1; j <= m; j++ {
			if refNormalized[i-1] == userNormalized[j-1] {
				dp[i][j] = dp[i-1][j-1]
			} else {
				sub := dp[i-1][j-1] + 1
				del := dp[i-1][j] + 1
				ins := dp[i][j-1] + 1
				minVal := sub
				if del < minVal {
					minVal = del
				}
				if ins < minVal {
					minVal = ins
				}
				dp[i][j] = minVal
			}
		}
	}

	// Backtracking untuk menghasilkan penyejajaran kata (Word Alignment)
	i := n
	j := m
	var diffs []WordDiffItem
	substitutions := 0
	deletions := 0
	insertions := 0

	for i > 0 || j > 0 {
		if i > 0 && j > 0 && refNormalized[i-1] == userNormalized[j-1] {
			diffs = append([]WordDiffItem{{
				Index:    i - 1,
				Word:     getOriginalWord(refWordsOriginal, i-1),
				Status:   "correct",
				UserSaid: getOriginalWord(userWordsOriginal, j-1),
			}}, diffs...)
			i--
			j--
		} else if i > 0 && j > 0 && dp[i][j] == dp[i-1][j-1]+1 {
			substitutions++
			diffs = append([]WordDiffItem{{
				Index:       i - 1,
				Word:        getOriginalWord(refWordsOriginal, i-1),
				Status:      "substituted",
				UserSaid:    getOriginalWord(userWordsOriginal, j-1),
				MistakeType: "kata_tertukar",
			}}, diffs...)
			i--
			j--
		} else if i > 0 && dp[i][j] == dp[i-1][j]+1 {
			deletions++
			diffs = append([]WordDiffItem{{
				Index:       i - 1,
				Word:        getOriginalWord(refWordsOriginal, i-1),
				Status:      "deleted",
				MistakeType: "kata_terlewat",
			}}, diffs...)
			i--
		} else {
			insertions++
			userWord := ""
			if j > 0 {
				userWord = getOriginalWord(userWordsOriginal, j-1)
			}
			diffs = append([]WordDiffItem{{
				Index:       i,
				Word:        "+",
				Status:      "inserted",
				UserSaid:    userWord,
				MistakeType: "kata_berlebih",
			}}, diffs...)
			j--
		}
	}

	// Formula penskoran sesuai Proposal: Skor = 1 - (S + D + I) / N
	totalWords := float64(n)
	if totalWords == 0 {
		totalWords = 1.0
	}

	errorCount := float64(substitutions + deletions + insertions)
	rawScore := (1.0 - (errorCount / totalWords)) * 100.0
	if rawScore < 0 {
		rawScore = 0.0
	}
	finalScore := math.Round(rawScore*100) / 100

	return EvaluationResult{
		Score:           finalScore,
		TranscribedText: userRaw,
		ReferenceText:   referenceRaw,
		Substitutions:   substitutions,
		Deletions:       deletions,
		Insertions:      insertions,
		WordDiff:        diffs,
	}
}

func getOriginalWord(words []string, idx int) string {
	if idx >= 0 && idx < len(words) {
		return words[idx]
	}
	return ""
}

// ConvertToModelDiff konversi ke model struct
func ConvertToModelDiff(items []WordDiffItem) []model.WordDiffDetail {
	var result []model.WordDiffDetail
	for _, it := range items {
		result = append(result, model.WordDiffDetail{
			Index:       it.Index,
			Word:        it.Word,
			Status:      it.Status,
			UserSaid:    it.UserSaid,
			MistakeType: it.MistakeType,
		})
	}
	return result
}
