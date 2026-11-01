package model

import "time"

// 1. Model Jadwal Sholat
type PrayerScheduleItem struct {
	Name    string `json:"name"`
	Time    string `json:"time"` // Format "HH:mm"
	Hours   int    `json:"hours"`
	Minutes int    `json:"minutes"`
}

type PrayerTimesResponse struct {
	City      string               `json:"city"`
	Date      string               `json:"date"`
	Schedules []PrayerScheduleItem `json:"schedules"`
}

// 2. Model Kumpulan Doa
type DoaItem struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Category    string `json:"category"` // "sebelum_murojaah", "sesudah_murojaah", "khatam", "harian"
	Arabic      string `json:"arabic"`
	Latin       string `json:"latin"`
	Translation string `json:"translation"`
	Fadhilah    string `json:"fadhilah,omitempty"`
}

// 3. Model Mutabaah & Analitik
type MutabaahWeeklyDay struct {
	Date      string  `json:"date"`
	Ayahs     int     `json:"ayahs"`
	TargetMet bool    `json:"targetMet"`
	AvgScore  float64 `json:"avgScore,omitempty"`
}

type MutabaahSummaryResponse struct {
	CurrentStreak       int                 `json:"currentStreak"`
	MaxStreak           int                 `json:"maxStreak"`
	TodayReviewedAyahs  int                 `json:"todayReviewedAyahs"`
	DailyTarget         int                 `json:"dailyTarget"`
	TargetMetToday      bool                `json:"targetMetToday"`
	TotalAyahsMemorized int                 `json:"totalAyahsMemorized"`
	WeeklyActivity      []MutabaahWeeklyDay `json:"weeklyActivity"`
}

type HeatmapAyahItem struct {
	AyahNumber   int     `json:"ayahNumber"`
	Status       string  `json:"status"` // "strong", "reviewing", "weak", "untested"
	LastScore    float64 `json:"lastScore"`
	IntervalDays int     `json:"intervalDays"`
}

type SurahHeatmapResponse struct {
	SurahNumber int               `json:"surahNumber"`
	SurahName   string            `json:"surahName"`
	TotalAyahs  int               `json:"totalAyahs"`
	Ayahs       []HeatmapAyahItem `json:"ayahs"`
}

// 4. Model Admin Santri Monitoring
type AdminSantriOverview struct {
	ID            string    `json:"id"`
	FullName      string    `json:"fullName"`
	Username      string    `json:"username"`
	CurrentStreak int       `json:"currentStreak"`
	LastSurah     string    `json:"lastSurah"`
	LastScore     float64   `json:"lastScore"`
	LastActive    string    `json:"lastActive"`
	Status        string    `json:"status"` // "active", "need_review"
	CreatedAt     time.Time `json:"createdAt"`
}

type AdminSantriListResponse struct {
	TotalSantri          int                   `json:"totalSantri"`
	TotalSessionsToday   int                   `json:"totalSessionsToday"`
	NeedReviewCount      int                   `json:"needReviewCount"`
	AverageAccuracyScore float64               `json:"averageAccuracyScore"`
	Santri               []AdminSantriOverview `json:"santri"`
}

// 5. Model Unified Mutabaah Integration System
type CreateMutabaahLogRequest struct {
	ActivityType    string   `json:"activityType"` // 'tilawah', 'murojaah', 'hafalan_baru', 'tajwid', 'murojaah_ai'
	SurahNumber     int      `json:"surahNumber"`
	SurahName       string   `json:"surahName"`
	StartAyah       int      `json:"startAyah"`
	EndAyah         int      `json:"endAyah"`
	TotalAyahs      int      `json:"totalAyahs,omitempty"`
	PagesCount      int      `json:"pagesCount,omitempty"`
	DurationSeconds int      `json:"durationSeconds,omitempty"`
	DurationMinutes int      `json:"durationMinutes,omitempty"`
	Score           *float64 `json:"score,omitempty"`
	SantriNotes     string   `json:"santriNotes,omitempty"`
	Notes           string   `json:"notes,omitempty"`
	Verifier        string   `json:"verifier,omitempty"`
	Type            string   `json:"type,omitempty"`
}

type MutabaahLogItem struct {
	ID              string  `json:"id"`
	UserID          string  `json:"userId,omitempty"`
	UserName        string  `json:"userName,omitempty"`
	LogDate         string  `json:"logDate"`
	Time            string  `json:"time"`
	Type            string  `json:"type"` // 'tilawah', 'murojaah', 'hafalan_baru', etc.
	SurahNumber     int     `json:"surahNumber"`
	SurahName       string  `json:"surahName"`
	StartAyah       int     `json:"ayahStart"`
	EndAyah         int     `json:"ayahEnd"`
	TotalAyahs      int     `json:"totalAyahs"`
	PagesCount      int     `json:"pagesCount"`
	DurationSeconds int     `json:"durationSeconds"`
	Score           float64 `json:"score"`
	SantriNotes     string  `json:"santriNotes,omitempty"`
	Notes           string  `json:"notes,omitempty"`
	UstadzNotes     string  `json:"ustadzNotes,omitempty"`
	UstadzStatus    string  `json:"ustadzStatus"` // 'completed', 'verified', 'needs_improvement'
	UstadzName      string  `json:"ustadzName,omitempty"`
	Verifier        string  `json:"verifier,omitempty"`
	CreatedAt       string  `json:"createdAt"`
}

type UserCommitment struct {
	DailyTargetAyahsTilawah int    `json:"dailyTargetAyahsTilawah"`
	DailyTargetPagesTilawah int    `json:"dailyTargetPagesTilawah"`
	DailyTargetAyahsHafalan int    `json:"dailyTargetAyahsHafalan"`
	TargetSurahNumber       int    `json:"targetSurahNumber"`
	TargetSurahName         string `json:"targetSurahName"`
	TargetStartAyah         int    `json:"targetStartAyah"`
	TargetEndAyah           int    `json:"targetEndAyah"`
	TargetDeadline          string `json:"targetDeadline"`
	CurrentStreak           int    `json:"currentStreak"`
	MaxStreak               int    `json:"maxStreak"`
	ProgressionOrder        string `json:"progressionOrder"`        // "juz_30" | "juz_1_asc" | "custom_surah"
	MurojaahTargetUnit       string `json:"murojaahTargetUnit"`      // "surah" | "ayah" | "page"
	DailyTargetMurojaahCount int    `json:"dailyTargetMurojaahCount"`
	TargetJuzNumber          int    `json:"targetJuzNumber"`
}

type UpdateUserCommitmentRequest struct {
	DailyTargetAyahsTilawah  *int   `json:"dailyTargetAyahsTilawah,omitempty"`
	DailyTargetPagesTilawah  *int   `json:"dailyTargetPagesTilawah,omitempty"`
	DailyTargetAyahsHafalan  *int   `json:"dailyTargetAyahsHafalan,omitempty"`
	TargetSurahNumber        *int   `json:"targetSurahNumber,omitempty"`
	TargetSurahName          string `json:"targetSurahName,omitempty"`
	TargetStartAyah          *int   `json:"targetStartAyah,omitempty"`
	TargetEndAyah            *int   `json:"targetEndAyah,omitempty"`
	TargetDeadline           string `json:"targetDeadline,omitempty"`
	ProgressionOrder         string `json:"progressionOrder,omitempty"`
	MurojaahTargetUnit       string `json:"murojaahTargetUnit,omitempty"`
	DailyTargetMurojaahCount *int   `json:"dailyTargetMurojaahCount,omitempty"`
	TargetJuzNumber          *int   `json:"targetJuzNumber,omitempty"`
}

type AdminMutabaahTilawahInfo struct {
	SurahName string `json:"surahName"`
	StartAyah int    `json:"startAyah"`
	EndAyah   int    `json:"endAyah"`
	Pages     int    `json:"pages"`
}

type AdminMutabaahSetoranInfo struct {
	SurahName string  `json:"surahName"`
	StartAyah int     `json:"startAyah"`
	EndAyah   int     `json:"endAyah"`
	Score     float64 `json:"score"`
}

type AdminMutabaahMonitoringItem struct {
	ID               string                    `json:"id"`
	FullName         string                    `json:"fullName"`
	Username         string                    `json:"username"`
	CurrentStreak    int                       `json:"currentStreak"`
	TodayTilawah     *AdminMutabaahTilawahInfo `json:"todayTilawah,omitempty"`
	TodaySetoran     *AdminMutabaahSetoranInfo `json:"todaySetoran,omitempty"`
	TargetMetToday   bool                      `json:"targetMetToday"`
	SantriNotes      string                    `json:"santriNotes,omitempty"`
	EvaluationStatus string                    `json:"evaluationStatus"` // 'completed', 'verified', 'needs_improvement', 'pending'
	UstadzNotes      string                    `json:"ustadzNotes,omitempty"`
	LastLogID        string                    `json:"lastLogId,omitempty"`
}

type UstadzEvaluationRequest struct {
	Status      string `json:"status"` // 'verified' | 'needs_improvement'
	UstadzNotes string `json:"ustadzNotes"`
	UstadzName  string `json:"ustadzName,omitempty"`
}
