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
