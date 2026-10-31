package evaluator

import (
	"testing"
)

func TestEvaluateRecitation(t *testing.T) {
	ref := "عَمَّ يَتَسَآءَلُونَ" // 2 kata
	// Kasus 1: Tepat 100%
	res1 := EvaluateRecitation(ref, "عَمَّ يَتَسَاءَلُونَ")
	if res1.Score != 100.0 {
		t.Errorf("Ekspektasi skor 100, dapat: %f", res1.Score)
	}
	if len(res1.WordDiff) != 2 {
		t.Errorf("Ekspektasi 2 kata, dapat: %d", len(res1.WordDiff))
	}

	// Kasus 2: 1 kata tertukar / salah baca (substitusi)
	res2 := EvaluateRecitation(ref, "عَمَّ يَتَسَاءَلُ")
	if res2.Substitutions != 1 {
		t.Errorf("Ekspektasi 1 substitusi, dapat: %d", res2.Substitutions)
	}
	// Skor = (1 - (1/2)) * 100 = 50%
	if res2.Score != 50.0 {
		t.Errorf("Ekspektasi skor 50.0, dapat: %f", res2.Score)
	}
}
