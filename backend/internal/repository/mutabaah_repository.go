package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MutabaahRepository interface {
	GetSummary(ctx context.Context, userID string) (*model.MutabaahSummaryResponse, error)
	GetSurahHeatmap(ctx context.Context, userID string, surahNumber int) (*model.SurahHeatmapResponse, error)
	GetAdminSantriMonitoring(ctx context.Context) (*model.AdminSantriListResponse, error)
}

type mutabaahRepository struct {
	db *pgxpool.Pool
}

func NewMutabaahRepository(db *pgxpool.Pool) MutabaahRepository {
	return &mutabaahRepository{db: db}
}

func (r *mutabaahRepository) GetSummary(ctx context.Context, userID string) (*model.MutabaahSummaryResponse, error) {
	if r.db == nil {
		return r.getFallbackSummary(), nil
	}

	if userID == "" {
		_ = r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
	}

	dailyTarget := 10
	currentStreak := 0
	maxStreak := 0

	// 1. Ambil target dan streak user
	_ = r.db.QueryRow(ctx, `
		SELECT daily_target_ayahs, current_streak, max_streak 
		FROM users WHERE id = $1
	`, userID).Scan(&dailyTarget, &currentStreak, &maxStreak)

	// 2. Ambil total ayat mutqin (hafalan tervalidasi)
	totalMemorized := 0
	_ = r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM ayah_memory_states 
		WHERE user_id = $1 AND quality_rating >= 3
	`, userID).Scan(&totalMemorized)

	// 3. Ambil aktivitas hari ini
	todayReviewed := 0
	targetMetToday := false
	_ = r.db.QueryRow(ctx, `
		SELECT ayahs_reviewed, target_achieved 
		FROM mutabaah_logs 
		WHERE user_id = $1 AND log_date = CURRENT_DATE
	`, userID).Scan(&todayReviewed, &targetMetToday)

	if todayReviewed >= dailyTarget {
		targetMetToday = true
	}

	// 4. Ambil aktivitas 7 hari terakhir
	weeklyDays := make([]model.MutabaahWeeklyDay, 7)
	now := time.Now()
	for i := 6; i >= 0; i-- {
		d := now.AddDate(0, 0, -i)
		dateStr := d.Format("2006-01-02")
		weeklyDays[6-i] = model.MutabaahWeeklyDay{
			Date:      dateStr,
			Ayahs:     0,
			TargetMet: false,
		}
	}

	rows, err := r.db.Query(ctx, `
		SELECT log_date::text, ayahs_reviewed, target_achieved, average_score
		FROM mutabaah_logs
		WHERE user_id = $1 AND log_date >= CURRENT_DATE - INTERVAL '6 days'
		ORDER BY log_date ASC
	`, userID)

	if err == nil {
		defer rows.Close()
		logMap := make(map[string]model.MutabaahWeeklyDay)
		for rows.Next() {
			var dStr string
			var ayahs int
			var met bool
			var avgSc float64
			if err := rows.Scan(&dStr, &ayahs, &met, &avgSc); err == nil {
				logMap[dStr] = model.MutabaahWeeklyDay{
					Date:      dStr,
					Ayahs:     ayahs,
					TargetMet: met || ayahs >= dailyTarget,
					AvgScore:  avgSc,
				}
			}
		}

		for idx, w := range weeklyDays {
			if val, ok := logMap[w.Date]; ok {
				weeklyDays[idx] = val
			}
		}
	}

	return &model.MutabaahSummaryResponse{
		CurrentStreak:       currentStreak,
		MaxStreak:           maxStreak,
		TodayReviewedAyahs:  todayReviewed,
		DailyTarget:         dailyTarget,
		TargetMetToday:      targetMetToday,
		TotalAyahsMemorized: totalMemorized,
		WeeklyActivity:      weeklyDays,
	}, nil
}

func (r *mutabaahRepository) GetSurahHeatmap(ctx context.Context, userID string, surahNumber int) (*model.SurahHeatmapResponse, error) {
	totalAyahsMap := map[int]struct {
		Name  string
		Ayahs int
	}{
		78: {"An-Naba'", 40},
		79: {"An-Nazi'at", 46},
		80: {"'Abasa", 42},
		81: {"At-Takwir", 29},
		82: {"Al-Infitar", 19},
		83: {"Al-Muthaffifin", 36},
		84: {"Al-Insyiqaq", 25},
		85: {"Al-Buruj", 22},
		86: {"At-Tariq", 17},
		87: {"Al-A'la", 19},
		88: {"Al-Ghasyiyah", 26},
		89: {"Al-Fajr", 30},
		90: {"Al-Balad", 20},
		91: {"Asy-Syams", 15},
		92: {"Al-Lail", 21},
		93: {"Ad-Duha", 11},
		94: {"Asy-Syarh", 8},
		95: {"At-Tin", 8},
		96: {"Al-'Alaq", 19},
		97: {"Al-Qadr", 5},
		98: {"Al-Bayyinah", 8},
		99: {"Az-Zalzalah", 8},
		100: {"Al-'Adiyat", 11},
		101: {"Al-Qari'ah", 11},
		102: {"At-Takasur", 8},
		103: {"Al-'Asr", 3},
		104: {"Al-Humazah", 9},
		105: {"Al-Fil", 5},
		106: {"Quraisy", 4},
		107: {"Al-Ma'un", 7},
		108: {"Al-Kausar", 3},
		109: {"Al-Kafirun", 6},
		110: {"An-Nasr", 3},
		111: {"Al-Lahab", 5},
		112: {"Al-Ikhlas", 4},
		113: {"Al-Falaq", 5},
		114: {"An-Nas", 6},
		1:   {"Al-Fatihah", 7},
		2:   {"Al-Baqarah", 286},
	}

	meta, exists := totalAyahsMap[surahNumber]
	if !exists {
		meta = struct {
			Name  string
			Ayahs int
		}{Name: fmt.Sprintf("Surah %d", surahNumber), Ayahs: 20}
	}

	items := make([]model.HeatmapAyahItem, meta.Ayahs)
	for i := 0; i < meta.Ayahs; i++ {
		items[i] = model.HeatmapAyahItem{
			AyahNumber:   i + 1,
			Status:       "untested",
			LastScore:    0,
			IntervalDays: 0,
		}
	}

	if r.db != nil {
		if userID == "" {
			_ = r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
		}

		rows, err := r.db.Query(ctx, `
			SELECT ayah_number, interval_days, last_score
			FROM ayah_memory_states
			WHERE user_id = $1 AND surah_number = $2
		`, userID, surahNumber)

		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var aNum, interval int
				var score float64
				if err := rows.Scan(&aNum, &interval, &score); err == nil && aNum >= 1 && aNum <= meta.Ayahs {
					status := "weak"
					if interval >= 7 || score >= 85 {
						status = "strong"
					} else if interval >= 3 || score >= 70 {
						status = "reviewing"
					}
					items[aNum-1] = model.HeatmapAyahItem{
						AyahNumber:   aNum,
						Status:       status,
						LastScore:    score,
						IntervalDays: interval,
					}
				}
			}
		}
	}

	return &model.SurahHeatmapResponse{
		SurahNumber: surahNumber,
		SurahName:   meta.Name,
		TotalAyahs:  meta.Ayahs,
		Ayahs:       items,
	}, nil
}

func (r *mutabaahRepository) GetAdminSantriMonitoring(ctx context.Context) (*model.AdminSantriListResponse, error) {
	if r.db == nil {
		return r.getFallbackAdminMonitoring(), nil
	}

	query := `
		SELECT 
			u.id, 
			u.full_name, 
			u.username, 
			u.current_streak, 
			u.created_at,
			COALESCE(s.surah_number, 78) as last_surah_num,
			COALESCE(s.avg_score, 85.0) as last_score,
			s.started_at
		FROM users u
		LEFT JOIN LATERAL (
			SELECT surah_number, avg_score, started_at
			FROM murojaah_sessions
			WHERE user_id = u.id
			ORDER BY started_at DESC
			LIMIT 1
		) s ON true
		WHERE u.role = 'user'
		ORDER BY u.created_at DESC
		LIMIT 50
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return r.getFallbackAdminMonitoring(), nil
	}
	defer rows.Close()

	var list []model.AdminSantriOverview
	needReviewCount := 0
	totalScoreSum := 0.0

	for rows.Next() {
		var item model.AdminSantriOverview
		var lastSurahNum int
		var startedAt *time.Time

		err := rows.Scan(
			&item.ID,
			&item.FullName,
			&item.Username,
			&item.CurrentStreak,
			&item.CreatedAt,
			&lastSurahNum,
			&item.LastScore,
			&startedAt,
		)
		if err == nil {
			item.LastSurah = fmt.Sprintf("QS. %s", r.getSurahName(lastSurahNum))
			if startedAt != nil {
				item.LastActive = r.formatRelativeTime(*startedAt)
			} else {
				item.LastActive = "Baru bergabung"
			}

			if item.LastScore < 70 {
				item.Status = "need_review"
				needReviewCount++
			} else {
				item.Status = "active"
			}

			totalScoreSum += item.LastScore
			list = append(list, item)
		}
	}

	if len(list) == 0 {
		return r.getFallbackAdminMonitoring(), nil
	}

	avgScore := 0.0
	if len(list) > 0 {
		avgScore = totalScoreSum / float64(len(list))
	}

	// Hitung total sesi hari ini
	todaySessions := 0
	_ = r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM murojaah_sessions 
		WHERE started_at >= CURRENT_DATE
	`).Scan(&todaySessions)

	return &model.AdminSantriListResponse{
		TotalSantri:          len(list),
		TotalSessionsToday:   todaySessions,
		NeedReviewCount:      needReviewCount,
		AverageAccuracyScore: avgScore,
		Santri:               list,
	}, nil
}

func (r *mutabaahRepository) formatRelativeTime(t time.Time) string {
	diff := time.Since(t)
	if diff < time.Minute {
		return "Baru saja"
	} else if diff < time.Hour {
		return fmt.Sprintf("%d menit lalu", int(diff.Minutes()))
	} else if diff < 24*time.Hour {
		return fmt.Sprintf("%d jam lalu", int(diff.Hours()))
	}
	return fmt.Sprintf("%d hari lalu", int(diff.Hours()/24))
}

func (r *mutabaahRepository) getSurahName(num int) string {
	names := map[int]string{
		1: "Al-Fatihah", 2: "Al-Baqarah", 78: "An-Naba'", 79: "An-Nazi'at",
		80: "'Abasa", 81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Muthaffifin",
		84: "Al-Insyiqaq", 85: "Al-Buruj", 86: "At-Tariq", 87: "Al-A'la",
		88: "Al-Ghasyiyah", 89: "Al-Fajr", 90: "Al-Balad", 91: "Asy-Syams",
		92: "Al-Lail", 93: "Ad-Duha", 94: "Asy-Syarh", 95: "At-Tin",
		96: "Al-'Alaq", 97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah",
		100: "Al-'Adiyat", 101: "Al-Qari'ah", 102: "At-Takasur", 103: "Al-'Asr",
		104: "Al-Humazah", 105: "Al-Fil", 106: "Quraisy", 107: "Al-Ma'un",
		108: "Al-Kausar", 109: "Al-Kafirun", 110: "An-Nasr", 111: "Al-Lahab",
		112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas",
	}
	if name, ok := names[num]; ok {
		return name
	}
	return fmt.Sprintf("Surah %d", num)
}

func (r *mutabaahRepository) getFallbackSummary() *model.MutabaahSummaryResponse {
	return &model.MutabaahSummaryResponse{
		CurrentStreak:       1,
		MaxStreak:           3,
		TodayReviewedAyahs:  0,
		DailyTarget:         10,
		TargetMetToday:      false,
		TotalAyahsMemorized: 0,
		WeeklyActivity:      []model.MutabaahWeeklyDay{},
	}
}

func (r *mutabaahRepository) getFallbackAdminMonitoring() *model.AdminSantriListResponse {
	return &model.AdminSantriListResponse{
		TotalSantri:          0,
		TotalSessionsToday:   0,
		NeedReviewCount:      0,
		AverageAccuracyScore: 0.0,
		Santri:               []model.AdminSantriOverview{},
	}
}
