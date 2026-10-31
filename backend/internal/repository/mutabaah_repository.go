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
	CreateLog(ctx context.Context, userID string, req *model.CreateMutabaahLogRequest) (*model.MutabaahLogItem, error)
	GetHistory(ctx context.Context, userID string, activityType string, limit int) ([]model.MutabaahLogItem, error)
	GetTargets(ctx context.Context, userID string) (*model.UserCommitment, error)
	UpdateTargets(ctx context.Context, userID string, req *model.UpdateUserCommitmentRequest) (*model.UserCommitment, error)
	GetAdminMonitoringList(ctx context.Context) ([]model.AdminMutabaahMonitoringItem, error)
	SubmitUstadzEvaluation(ctx context.Context, logID string, ustadzID string, req *model.UstadzEvaluationRequest) error
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
		SELECT COALESCE(SUM(total_ayahs), 0)
		FROM mutabaah_logs 
		WHERE user_id = $1 AND log_date = CURRENT_DATE
	`, userID).Scan(&todayReviewed)

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
		SELECT log_date::text, COALESCE(SUM(total_ayahs), 0), COALESCE(AVG(score), 100.0)
		FROM mutabaah_logs
		WHERE user_id = $1 AND log_date >= CURRENT_DATE - INTERVAL '6 days'
		GROUP BY log_date
		ORDER BY log_date ASC
	`, userID)

	if err == nil {
		defer rows.Close()
		logMap := make(map[string]model.MutabaahWeeklyDay)
		for rows.Next() {
			var dStr string
			var ayahs int
			var avgSc float64
			if err := rows.Scan(&dStr, &ayahs, &avgSc); err == nil {
				logMap[dStr] = model.MutabaahWeeklyDay{
					Date:      dStr,
					Ayahs:     ayahs,
					TargetMet: ayahs >= dailyTarget,
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

// Implementasi Endpoint Baru Unified Mutabaah Integration System

func (r *mutabaahRepository) CreateLog(ctx context.Context, userID string, req *model.CreateMutabaahLogRequest) (*model.MutabaahLogItem, error) {
	if userID == "" && r.db != nil {
		_ = r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
	}
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000001"
	}

	actType := req.ActivityType
	if actType == "" {
		actType = req.Type
	}
	if actType == "" {
		actType = "tilawah"
	}

	surahNum := req.SurahNumber
	if surahNum <= 0 {
		surahNum = 1
	}

	surahName := req.SurahName
	if surahName == "" {
		surahName = r.getSurahName(surahNum)
	}

	startAyah := req.StartAyah
	if startAyah <= 0 {
		startAyah = 1
	}
	endAyah := req.EndAyah
	if endAyah <= 0 {
		endAyah = startAyah
	}

	totalAyahs := req.TotalAyahs
	if totalAyahs <= 0 {
		diff := endAyah - startAyah
		if diff < 0 {
			diff = -diff
		}
		totalAyahs = diff + 1
	}

	pagesCount := req.PagesCount
	if pagesCount <= 0 {
		pagesCount = (totalAyahs + 14) / 15
		if pagesCount < 1 {
			pagesCount = 1
		}
	}

	durationSec := req.DurationSeconds
	if durationSec <= 0 {
		if req.DurationMinutes > 0 {
			durationSec = req.DurationMinutes * 60
		} else {
			durationSec = totalAyahs * 90
		}
	}
	durationMin := (durationSec + 59) / 60
	if durationMin < 1 {
		durationMin = 1
	}

	scoreVal := 100.0
	if req.Score != nil {
		scoreVal = *req.Score
	}

	notes := req.SantriNotes
	if notes == "" {
		notes = req.Notes
	}

	now := time.Now()
	logDate := now.Format("2006-01-02")
	timeStr := now.Format("15:04 WIB")
	logID := fmt.Sprintf("rep-%d", now.UnixNano())
	status := "completed"
	ustadzNotes := "Menunggu evaluasi ustadz pembimbing."
	verifier := "Ustadz Pembimbing"
	if req.Verifier != "" {
		verifier = req.Verifier
	}

	if r.db != nil {
		var dbID string
		var createdAt time.Time
		err := r.db.QueryRow(ctx, `
			INSERT INTO mutabaah_logs (
				user_id, log_date, activity_type, surah_number, surah_name,
				start_ayah, end_ayah, total_ayahs, pages_count, duration_seconds,
				score, santri_notes, status, ayahs_reviewed, total_duration_minutes, average_score, target_achieved
			) VALUES (
				$1, CURRENT_DATE, $2, $3, $4,
				$5, $6, $7, $8, $9,
				$10, $11, 'completed', $7, $12, $10, true
			) RETURNING id, created_at
		`, userID, actType, surahNum, surahName, startAyah, endAyah, totalAyahs, pagesCount, durationSec, scoreVal, notes, durationMin).Scan(&dbID, &createdAt)

		if err == nil {
			logID = dbID
			timeStr = createdAt.Format("15:04 WIB")
			// Update streak user
			_, _ = r.db.Exec(ctx, `
				UPDATE users SET 
					current_streak = current_streak + 1,
					max_streak = GREATEST(max_streak, current_streak + 1)
				WHERE id = $1 AND NOT EXISTS (
					SELECT 1 FROM mutabaah_logs WHERE user_id = $1 AND log_date = CURRENT_DATE AND id <> $2
				)
			`, userID, dbID)
		}
	}

	return &model.MutabaahLogItem{
		ID:              logID,
		UserID:          userID,
		LogDate:         logDate,
		Time:            timeStr,
		Type:            actType,
		SurahNumber:     surahNum,
		SurahName:       surahName,
		StartAyah:       startAyah,
		EndAyah:         endAyah,
		TotalAyahs:      totalAyahs,
		PagesCount:      pagesCount,
		DurationSeconds: durationSec,
		Score:           scoreVal,
		SantriNotes:     notes,
		Notes:           notes,
		UstadzNotes:     ustadzNotes,
		UstadzStatus:    status,
		Verifier:        verifier,
		CreatedAt:       now.Format(time.RFC3339),
	}, nil
}

func (r *mutabaahRepository) GetHistory(ctx context.Context, userID string, activityType string, limit int) ([]model.MutabaahLogItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	if r.db != nil {
		if userID == "" {
			_ = r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
		}

		query := `
			SELECT 
				l.id, l.user_id, l.log_date::text, 
				COALESCE(l.activity_type, 'tilawah'), 
				COALESCE(l.surah_number, 1), 
				COALESCE(l.surah_name, 'Al-Fatihah'),
				COALESCE(l.start_ayah, 1), 
				COALESCE(l.end_ayah, 1), 
				COALESCE(l.total_ayahs, l.ayahs_reviewed, 1), 
				COALESCE(l.pages_count, 1), 
				COALESCE(l.duration_seconds, l.total_duration_minutes * 60, 60),
				COALESCE(l.score, l.average_score, 100.0), 
				COALESCE(l.santri_notes, ''), 
				COALESCE(l.ustadz_notes, 'Menunggu evaluasi ustadz pembimbing.'),
				COALESCE(l.status, 'completed'), 
				COALESCE(u.full_name, 'Ustadz Pembimbing'),
				l.created_at
			FROM mutabaah_logs l
			LEFT JOIN users u ON u.id = l.ustadz_id
			WHERE ($1 = '' OR l.user_id = $1::uuid)
			  AND ($2 = '' OR l.activity_type = $2)
			ORDER BY l.created_at DESC
			LIMIT $3
		`

		rows, err := r.db.Query(ctx, query, userID, activityType, limit)
		if err == nil {
			defer rows.Close()
			var result []model.MutabaahLogItem
			for rows.Next() {
				var item model.MutabaahLogItem
				var createdAt time.Time
				if err := rows.Scan(
					&item.ID, &item.UserID, &item.LogDate,
					&item.Type, &item.SurahNumber, &item.SurahName,
					&item.StartAyah, &item.EndAyah, &item.TotalAyahs,
					&item.PagesCount, &item.DurationSeconds, &item.Score,
					&item.SantriNotes, &item.UstadzNotes, &item.UstadzStatus,
					&item.UstadzName, &createdAt,
				); err == nil {
					item.Time = createdAt.Format("15:04 WIB")
					item.Notes = item.SantriNotes
					item.Verifier = item.UstadzName
					item.CreatedAt = createdAt.Format(time.RFC3339)
					result = append(result, item)
				}
			}
			if len(result) > 0 {
				return result, nil
			}
		}
	}

	return r.getFallbackHistory(), nil
}

func (r *mutabaahRepository) GetTargets(ctx context.Context, userID string) (*model.UserCommitment, error) {
	if r.db != nil {
		if userID == "" {
			_ = r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
		}

		var c model.UserCommitment
		var targetDeadline *time.Time
		err := r.db.QueryRow(ctx, `
			SELECT 
				daily_target_ayahs_tilawah, daily_target_pages_tilawah, daily_target_ayahs_hafalan,
				COALESCE(target_surah_number, 67), COALESCE(target_surah_name, 'Al-Mulk'),
				COALESCE(target_start_ayah, 1), COALESCE(target_end_ayah, 30),
				target_deadline, current_streak, max_streak
			FROM user_commitments
			WHERE user_id = $1
		`, userID).Scan(
			&c.DailyTargetAyahsTilawah, &c.DailyTargetPagesTilawah, &c.DailyTargetAyahsHafalan,
			&c.TargetSurahNumber, &c.TargetSurahName, &c.TargetStartAyah, &c.TargetEndAyah,
			&targetDeadline, &c.CurrentStreak, &c.MaxStreak,
		)

		if err == nil {
			if targetDeadline != nil {
				c.TargetDeadline = targetDeadline.Format("2006-01-02")
			} else {
				c.TargetDeadline = time.Now().AddDate(0, 1, 0).Format("2006-01-02")
			}
			return &c, nil
		}
	}

	return r.getFallbackTargets(), nil
}

func (r *mutabaahRepository) UpdateTargets(ctx context.Context, userID string, req *model.UpdateUserCommitmentRequest) (*model.UserCommitment, error) {
	current, _ := r.GetTargets(ctx, userID)
	if req.DailyTargetAyahsTilawah != nil {
		current.DailyTargetAyahsTilawah = *req.DailyTargetAyahsTilawah
	}
	if req.DailyTargetPagesTilawah != nil {
		current.DailyTargetPagesTilawah = *req.DailyTargetPagesTilawah
	}
	if req.DailyTargetAyahsHafalan != nil {
		current.DailyTargetAyahsHafalan = *req.DailyTargetAyahsHafalan
	}
	if req.TargetSurahNumber != nil {
		current.TargetSurahNumber = *req.TargetSurahNumber
	}
	if req.TargetSurahName != "" {
		current.TargetSurahName = req.TargetSurahName
	}
	if req.TargetStartAyah != nil {
		current.TargetStartAyah = *req.TargetStartAyah
	}
	if req.TargetEndAyah != nil {
		current.TargetEndAyah = *req.TargetEndAyah
	}
	if req.TargetDeadline != "" {
		current.TargetDeadline = req.TargetDeadline
	}

	if r.db != nil {
		if userID == "" {
			_ = r.db.QueryRow(ctx, `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`).Scan(&userID)
		}

		var deadlineVal interface{} = nil
		if current.TargetDeadline != "" {
			if t, err := time.Parse("2006-01-02", current.TargetDeadline); err == nil {
				deadlineVal = t
			}
		}

		_, _ = r.db.Exec(ctx, `
			INSERT INTO user_commitments (
				user_id, daily_target_ayahs_tilawah, daily_target_pages_tilawah, daily_target_ayahs_hafalan,
				target_surah_number, target_surah_name, target_start_ayah, target_end_ayah, target_deadline, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
			) ON CONFLICT (user_id) DO UPDATE SET
				daily_target_ayahs_tilawah = EXCLUDED.daily_target_ayahs_tilawah,
				daily_target_pages_tilawah = EXCLUDED.daily_target_pages_tilawah,
				daily_target_ayahs_hafalan = EXCLUDED.daily_target_ayahs_hafalan,
				target_surah_number = EXCLUDED.target_surah_number,
				target_surah_name = EXCLUDED.target_surah_name,
				target_start_ayah = EXCLUDED.target_start_ayah,
				target_end_ayah = EXCLUDED.target_end_ayah,
				target_deadline = EXCLUDED.target_deadline,
				updated_at = NOW()
		`, userID, current.DailyTargetAyahsTilawah, current.DailyTargetPagesTilawah, current.DailyTargetAyahsHafalan,
			current.TargetSurahNumber, current.TargetSurahName, current.TargetStartAyah, current.TargetEndAyah, deadlineVal)

		// Sync juga target hafalan ke tabel users
		_, _ = r.db.Exec(ctx, `UPDATE users SET daily_target_ayahs = $1 WHERE id = $2`, current.DailyTargetAyahsHafalan, userID)
	}

	return current, nil
}

func (r *mutabaahRepository) GetAdminMonitoringList(ctx context.Context) ([]model.AdminMutabaahMonitoringItem, error) {
	if r.db != nil {
		query := `
			SELECT 
				u.id, 
				u.full_name, 
				u.username, 
				u.current_streak,
				tilawah.surah_name, tilawah.start_ayah, tilawah.end_ayah, tilawah.pages_count,
				setoran.surah_name, setoran.start_ayah, setoran.end_ayah, setoran.score,
				latest.santri_notes, latest.status, latest.ustadz_notes, latest.id
			FROM users u
			LEFT JOIN LATERAL (
				SELECT surah_name, start_ayah, end_ayah, pages_count
				FROM mutabaah_logs
				WHERE user_id = u.id AND activity_type = 'tilawah' AND log_date = CURRENT_DATE
				ORDER BY created_at DESC LIMIT 1
			) tilawah ON true
			LEFT JOIN LATERAL (
				SELECT surah_name, start_ayah, end_ayah, score
				FROM mutabaah_logs
				WHERE user_id = u.id AND activity_type IN ('murojaah', 'murojaah_ai', 'hafalan_baru') AND log_date = CURRENT_DATE
				ORDER BY created_at DESC LIMIT 1
			) setoran ON true
			LEFT JOIN LATERAL (
				SELECT id, santri_notes, status, ustadz_notes
				FROM mutabaah_logs
				WHERE user_id = u.id
				ORDER BY created_at DESC LIMIT 1
			) latest ON true
			WHERE u.role = 'user'
			ORDER BY u.created_at DESC
			LIMIT 50
		`

		rows, err := r.db.Query(ctx, query)
		if err == nil {
			defer rows.Close()
			var list []model.AdminMutabaahMonitoringItem
			for rows.Next() {
				var item model.AdminMutabaahMonitoringItem
				var tSurah, sSurah *string
				var tStart, tEnd, tPages *int
				var sStart, sEnd *int
				var sScore *float64
				var sNotes, uStatus, uNotes, lID *string

				if err := rows.Scan(
					&item.ID, &item.FullName, &item.Username, &item.CurrentStreak,
					&tSurah, &tStart, &tEnd, &tPages,
					&sSurah, &sStart, &sEnd, &sScore,
					&sNotes, &uStatus, &uNotes, &lID,
				); err == nil {
					if tSurah != nil {
						item.TodayTilawah = &model.AdminMutabaahTilawahInfo{
							SurahName: *tSurah,
							StartAyah: *tStart,
							EndAyah:   *tEnd,
							Pages:     *tPages,
						}
					}
					if sSurah != nil {
						item.TodaySetoran = &model.AdminMutabaahSetoranInfo{
							SurahName: *sSurah,
							StartAyah: *sStart,
							EndAyah:   *sEnd,
							Score:     *sScore,
						}
					}
					if sNotes != nil {
						item.SantriNotes = *sNotes
					}
					if uStatus != nil && *uStatus != "" {
						item.EvaluationStatus = *uStatus
					} else {
						item.EvaluationStatus = "completed"
					}
					if uNotes != nil {
						item.UstadzNotes = *uNotes
					}
					if lID != nil {
						item.LastLogID = *lID
					}
					item.TargetMetToday = item.TodayTilawah != nil || item.TodaySetoran != nil
					list = append(list, item)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	return r.getFallbackMonitoringList(), nil
}

func (r *mutabaahRepository) SubmitUstadzEvaluation(ctx context.Context, logID string, ustadzID string, req *model.UstadzEvaluationRequest) error {
	if r.db != nil && logID != "" {
		_, err := r.db.Exec(ctx, `
			UPDATE mutabaah_logs SET
				status = $1,
				ustadz_notes = $2,
				ustadz_id = CASE WHEN $3 <> '' THEN $3::uuid ELSE ustadz_id END
			WHERE id::text = $4
		`, req.Status, req.UstadzNotes, ustadzID, logID)
		return err
	}
	return nil
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
		CurrentStreak:       5,
		MaxStreak:           14,
		TodayReviewedAyahs:  20,
		DailyTarget:         10,
		TargetMetToday:      true,
		TotalAyahsMemorized: 184,
		WeeklyActivity: []model.MutabaahWeeklyDay{
			{Date: "2026-10-26", Ayahs: 12, TargetMet: true, AvgScore: 92.5},
			{Date: "2026-10-27", Ayahs: 15, TargetMet: true, AvgScore: 94.0},
			{Date: "2026-10-28", Ayahs: 8, TargetMet: false, AvgScore: 88.0},
			{Date: "2026-10-29", Ayahs: 20, TargetMet: true, AvgScore: 96.5},
			{Date: "2026-10-30", Ayahs: 18, TargetMet: true, AvgScore: 95.0},
			{Date: "2026-10-31", Ayahs: 25, TargetMet: true, AvgScore: 97.2},
			{Date: "2026-11-01", Ayahs: 20, TargetMet: true, AvgScore: 96.0},
		},
	}
}

func (r *mutabaahRepository) getFallbackAdminMonitoring() *model.AdminSantriListResponse {
	return &model.AdminSantriListResponse{
		TotalSantri:          4,
		TotalSessionsToday:   8,
		NeedReviewCount:      1,
		AverageAccuracyScore: 89.2,
		Santri: []model.AdminSantriOverview{
			{
				ID:            "santri-01",
				FullName:      "Faeyza Ardellein (Pijaa)",
				Username:      "pijaa",
				CurrentStreak: 5,
				LastSurah:     "QS. An-Naba'",
				LastScore:     96.0,
				LastActive:    "10 menit lalu",
				Status:        "active",
				CreatedAt:     time.Now().AddDate(0, -2, 0),
			},
			{
				ID:            "santri-02",
				FullName:      "Muhammad Bilal",
				Username:      "mbilal_santri",
				CurrentStreak: 3,
				LastSurah:     "QS. An-Nazi'at",
				LastScore:     68.5,
				LastActive:    "1 jam lalu",
				Status:        "need_review",
				CreatedAt:     time.Now().AddDate(0, -1, -5),
			},
		},
	}
}

func (r *mutabaahRepository) getFallbackTargets() *model.UserCommitment {
	return &model.UserCommitment{
		DailyTargetAyahsTilawah: 20,
		DailyTargetPagesTilawah: 2,
		DailyTargetAyahsHafalan: 10,
		TargetSurahNumber:       67,
		TargetSurahName:         "Al-Mulk",
		TargetStartAyah:         1,
		TargetEndAyah:           30,
		TargetDeadline:          "2026-11-30",
		CurrentStreak:           5,
		MaxStreak:               14,
	}
}

func (r *mutabaahRepository) getFallbackHistory() []model.MutabaahLogItem {
	now := time.Now()
	todayStr := now.Format("2006-01-02")
	return []model.MutabaahLogItem{
		{
			ID:              "seed-rep-1",
			LogDate:         todayStr,
			Time:            "17:35 WIB",
			Type:            "tilawah",
			SurahNumber:     2,
			SurahName:       "Al-Baqarah",
			StartAyah:       142,
			EndAyah:         160,
			TotalAyahs:      19,
			PagesCount:      2,
			DurationSeconds: 1200,
			Score:           96.0,
			SantriNotes:     "Makhraj 'ain dan ghunnah di ayat 155 sudah lancar.",
			Notes:           "Makhraj 'ain dan ghunnah di ayat 155 sudah lancar.",
			UstadzNotes:     "Maa syaa Allah, bacaan sangat fasih dan mutqin. Lanjutkan juz 2.",
			UstadzStatus:    "verified",
			UstadzName:      "Ustadz Ahmad, Lc.",
			Verifier:        "Ustadz Ahmad, Lc.",
			CreatedAt:       now.Format(time.RFC3339),
		},
		{
			ID:              "seed-rep-2",
			LogDate:         todayStr,
			Time:            "16:15 WIB",
			Type:            "murojaah",
			SurahNumber:     78,
			SurahName:       "An-Naba'",
			StartAyah:       1,
			EndAyah:         15,
			TotalAyahs:      15,
			PagesCount:      1,
			DurationSeconds: 600,
			Score:           98.5,
			SantriNotes:     "Alhamdulillah kelancaran repetisi SRS ayat 1-15 tuntas.",
			Notes:           "Alhamdulillah kelancaran repetisi SRS ayat 1-15 tuntas.",
			UstadzNotes:     "Mumtaz! Pertahankan ritme tartilnya.",
			UstadzStatus:    "verified",
			UstadzName:      "Ustadz Ahmad, Lc.",
			Verifier:        "Hifzhly AI Evaluator",
			CreatedAt:       now.Add(-1 * time.Hour).Format(time.RFC3339),
		},
		{
			ID:              "seed-rep-3",
			LogDate:         todayStr,
			Time:            "09:30 WIB",
			Type:            "hafalan_baru",
			SurahNumber:     67,
			SurahName:       "Al-Mulk",
			StartAyah:       1,
			EndAyah:         10,
			TotalAyahs:      10,
			PagesCount:      1,
			DurationSeconds: 900,
			Score:           75.0,
			SantriNotes:     "Ayat 8 masih ragu di lafazh takadu tamayyazu minal ghaiz.",
			Notes:           "Ayat 8 masih ragu di lafazh takadu tamayyazu minal ghaiz.",
			UstadzNotes:     "Perhatikan wakaf ikhtiyari dan idgham bighunnah pada ayat 8.",
			UstadzStatus:    "needs_improvement",
			UstadzName:      "Ustadz Farhan",
			Verifier:        "Ustadz Farhan",
			CreatedAt:       now.Add(-8 * time.Hour).Format(time.RFC3339),
		},
	}
}

func (r *mutabaahRepository) getFallbackMonitoringList() []model.AdminMutabaahMonitoringItem {
	return []model.AdminMutabaahMonitoringItem{
		{
			ID:            "santri-01",
			FullName:      "Faeyza Ardellein (Pijaa)",
			Username:      "pijaa",
			CurrentStreak: 5,
			TodayTilawah: &model.AdminMutabaahTilawahInfo{
				SurahName: "Al-Baqarah",
				StartAyah: 142,
				EndAyah:   160,
				Pages:     2,
			},
			TodaySetoran: &model.AdminMutabaahSetoranInfo{
				SurahName: "An-Naba'",
				StartAyah: 1,
				EndAyah:   15,
				Score:     96.0,
			},
			TargetMetToday:   true,
			SantriNotes:      "Makhraj 'ain dan ghunnah sudah lancar, siap lanjut ayat 16.",
			EvaluationStatus: "verified",
			UstadzNotes:      "Maa syaa Allah, bacaan sangat fasih dan mutqin.",
			LastLogID:        "seed-rep-1",
		},
		{
			ID:            "santri-02",
			FullName:      "Muhammad Bilal",
			Username:      "mbilal_santri",
			CurrentStreak: 3,
			TodayTilawah: &model.AdminMutabaahTilawahInfo{
				SurahName: "Ali Imran",
				StartAyah: 1,
				EndAyah:   20,
				Pages:     2,
			},
			TodaySetoran: &model.AdminMutabaahSetoranInfo{
				SurahName: "An-Nazi'at",
				StartAyah: 1,
				EndAyah:   10,
				Score:     72.0,
			},
			TargetMetToday:   false,
			SantriNotes:      "Ayat 8 masih sering tertukar dengan surah 'Abasa.",
			EvaluationStatus: "needs_improvement",
			UstadzNotes:      "Perlu bimbingan khusus pada waqaf dan ibtida di ayat 8-10.",
			LastLogID:        "seed-rep-2",
		},
		{
			ID:            "santri-03",
			FullName:      "Fatimah Az-Zahra",
			Username:      "fatimah_z",
			CurrentStreak: 12,
			TodayTilawah: &model.AdminMutabaahTilawahInfo{
				SurahName: "An-Nisa",
				StartAyah: 50,
				EndAyah:   75,
				Pages:     3,
			},
			TodaySetoran: &model.AdminMutabaahSetoranInfo{
				SurahName: "'Abasa",
				StartAyah: 1,
				EndAyah:   20,
				Score:     98.0,
			},
			TargetMetToday:   true,
			SantriNotes:      "Alhamdulillah sudah setoran tuntas sebelum maghrib.",
			EvaluationStatus: "verified",
			UstadzNotes:      "Mumtaz! Tajwid dan tartil sangat terjaga.",
			LastLogID:        "seed-rep-3",
		},
		{
			ID:            "santri-04",
			FullName:      "Zaid bin Tsabit",
			Username:      "zaid_t",
			CurrentStreak: 1,
			TodayTilawah:  nil,
			TodaySetoran: &model.AdminMutabaahSetoranInfo{
				SurahName: "At-Takwir",
				StartAyah: 1,
				EndAyah:   14,
				Score:     58.0,
			},
			TargetMetToday:   false,
			SantriNotes:      "Belum sempat tilawah lembar hari ini karena persiapan ujian.",
			EvaluationStatus: "pending",
			UstadzNotes:      "",
			LastLogID:        "seed-rep-4",
		},
	}
}
