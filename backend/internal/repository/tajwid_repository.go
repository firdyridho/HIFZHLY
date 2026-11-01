package repository

import (
	"context"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TajwidRepository interface {
	GetAllModules(ctx context.Context) ([]model.TajwidModule, error)
	GetModuleBySlug(ctx context.Context, slug string) (*model.TajwidModule, error)
	GetQuizByModuleID(ctx context.Context, moduleID string) (*model.TajwidQuiz, error)
	GetQuizByID(ctx context.Context, quizID string) (*model.TajwidQuiz, error)
	SaveQuizAttempt(ctx context.Context, userID, quizID string, score float64, totalQuestions, correctAnswers int) error
	CreateModule(ctx context.Context, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error)
	UpdateModule(ctx context.Context, id string, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error)
	DeleteModule(ctx context.Context, id string) error
	UpsertQuizWithQuestions(ctx context.Context, moduleID string, req model.CreateOrUpdateQuizRequest) (*model.TajwidQuiz, error)
}

type tajwidRepository struct {
	db *pgxpool.Pool
}

func NewTajwidRepository(db *pgxpool.Pool) TajwidRepository {
	return &tajwidRepository{db: db}
}

func (r *tajwidRepository) GetAllModules(ctx context.Context) ([]model.TajwidModule, error) {
	if r.db == nil {
		return r.getFallbackModules(), nil
	}

	queryWithMedia := `
		SELECT id, title, slug, summary, youtube_video_id, order_index, is_active, created_at, updated_at,
		       COALESCE(thumbnail_url, ''), COALESCE(pdf_url, '')
		FROM tajwid_modules
		WHERE is_active = true
		ORDER BY order_index ASC
	`
	rows, err := r.db.Query(ctx, queryWithMedia)
	if err != nil {
		// Fallback to legacy query without thumbnail_url / pdf_url
		queryLegacy := `
			SELECT id, title, slug, summary, youtube_video_id, order_index, is_active, created_at, updated_at
			FROM tajwid_modules
			WHERE is_active = true
			ORDER BY order_index ASC
		`
		legacyRows, legacyErr := r.db.Query(ctx, queryLegacy)
		if legacyErr != nil {
			return r.getFallbackModules(), nil
		}
		defer legacyRows.Close()

		var modules []model.TajwidModule
		for legacyRows.Next() {
			var m model.TajwidModule
			if err := legacyRows.Scan(
				&m.ID, &m.Title, &m.Slug, &m.Summary,
				&m.YoutubeVideoID, &m.OrderIndex, &m.IsActive, &m.CreatedAt, &m.UpdatedAt,
			); err != nil {
				return nil, err
			}
			modules = append(modules, m)
		}
		if len(modules) == 0 {
			return r.getFallbackModules(), nil
		}
		return modules, nil
	}
	defer rows.Close()

	var modules []model.TajwidModule
	for rows.Next() {
		var m model.TajwidModule
		if err := rows.Scan(
			&m.ID, &m.Title, &m.Slug, &m.Summary,
			&m.YoutubeVideoID, &m.OrderIndex, &m.IsActive, &m.CreatedAt, &m.UpdatedAt,
			&m.ThumbnailURL, &m.PdfURL,
		); err != nil {
			return nil, err
		}
		modules = append(modules, m)
	}

	if len(modules) == 0 {
		return r.getFallbackModules(), nil
	}

	return modules, nil
}

func (r *tajwidRepository) GetModuleBySlug(ctx context.Context, slug string) (*model.TajwidModule, error) {
	altSlug := slug
	if slug == "hukum-madd" {
		altSlug = "hukum-mad"
	} else if slug == "hukum-mad" {
		altSlug = "hukum-madd"
	}

	if r.db == nil {
		for _, m := range r.getFallbackModules() {
			if m.Slug == slug || m.Slug == altSlug {
				return &m, nil
			}
		}
		return nil, nil
	}

	queryWithMedia := `
		SELECT id, title, slug, summary, content_body, youtube_video_id, order_index, is_active, created_at, updated_at,
		       COALESCE(thumbnail_url, ''), COALESCE(pdf_url, '')
		FROM tajwid_modules
		WHERE (slug = $1 OR slug = $2) AND is_active = true
		LIMIT 1
	`
	var m model.TajwidModule
	err := r.db.QueryRow(ctx, queryWithMedia, slug, altSlug).Scan(
		&m.ID, &m.Title, &m.Slug, &m.Summary, &m.ContentBody,
		&m.YoutubeVideoID, &m.OrderIndex, &m.IsActive, &m.CreatedAt, &m.UpdatedAt,
		&m.ThumbnailURL, &m.PdfURL,
	)
	if err != nil {
		// Fallback to legacy query without thumbnail_url / pdf_url
		queryLegacy := `
			SELECT id, title, slug, summary, content_body, youtube_video_id, order_index, is_active, created_at, updated_at
			FROM tajwid_modules
			WHERE (slug = $1 OR slug = $2) AND is_active = true
			LIMIT 1
		`
		errLegacy := r.db.QueryRow(ctx, queryLegacy, slug, altSlug).Scan(
			&m.ID, &m.Title, &m.Slug, &m.Summary, &m.ContentBody,
			&m.YoutubeVideoID, &m.OrderIndex, &m.IsActive, &m.CreatedAt, &m.UpdatedAt,
		)
		if errLegacy != nil {
			for _, fm := range r.getFallbackModules() {
				if fm.Slug == slug || fm.Slug == altSlug {
					return &fm, nil
				}
			}
			return nil, nil
		}
	}

	return &m, nil
}

func (r *tajwidRepository) GetQuizByModuleID(ctx context.Context, moduleID string) (*model.TajwidQuiz, error) {
	// Fallback check
	fallbackQuiz := r.getFallbackQuiz(moduleID)
	if r.db == nil {
		return fallbackQuiz, nil
	}

	query := `
		SELECT id, module_id, title, description, passing_score
		FROM tajwid_quizzes
		WHERE module_id = $1
	`
	var q model.TajwidQuiz
	err := r.db.QueryRow(ctx, query, moduleID).Scan(
		&q.ID, &q.ModuleID, &q.Title, &q.Description, &q.PassingScore,
	)
	if err != nil {
		return fallbackQuiz, nil
	}

	questions, err := r.getQuestionsForQuiz(ctx, q.ID)
	if err == nil && len(questions) > 0 {
		q.Questions = questions
	} else if fallbackQuiz != nil {
		q.Questions = fallbackQuiz.Questions
	}

	return &q, nil
}

func (r *tajwidRepository) GetQuizByID(ctx context.Context, quizID string) (*model.TajwidQuiz, error) {
	fallbackQuiz := r.getFallbackQuizByID(quizID)
	if r.db == nil {
		return fallbackQuiz, nil
	}

	query := `
		SELECT id, module_id, title, description, passing_score
		FROM tajwid_quizzes
		WHERE id = $1
	`
	var q model.TajwidQuiz
	err := r.db.QueryRow(ctx, query, quizID).Scan(
		&q.ID, &q.ModuleID, &q.Title, &q.Description, &q.PassingScore,
	)
	if err != nil {
		return fallbackQuiz, nil
	}

	questions, err := r.getQuestionsForQuiz(ctx, q.ID)
	if err == nil && len(questions) > 0 {
		q.Questions = questions
	} else if fallbackQuiz != nil {
		q.Questions = fallbackQuiz.Questions
	}

	return &q, nil
}

func (r *tajwidRepository) getQuestionsForQuiz(ctx context.Context, quizID string) ([]model.QuizQuestion, error) {
	query := `
		SELECT id, quiz_id, question_text, audio_sample_url, explanation, order_index
		FROM quiz_questions
		WHERE quiz_id = $1
		ORDER BY order_index ASC
	`
	rows, err := r.db.Query(ctx, query, quizID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []model.QuizQuestion
	for rows.Next() {
		var q model.QuizQuestion
		if err := rows.Scan(
			&q.ID, &q.QuizID, &q.QuestionText, &q.AudioSampleURL, &q.Explanation, &q.OrderIndex,
		); err != nil {
			return nil, err
		}

		// Options
		optQuery := `
			SELECT id, question_id, option_text, is_correct, option_explanation
			FROM quiz_options
			WHERE question_id = $1
		`
		optRows, err := r.db.Query(ctx, optQuery, q.ID)
		if err == nil {
			var options []model.QuizOption
			for optRows.Next() {
				var opt model.QuizOption
				if err := optRows.Scan(&opt.ID, &opt.QuestionID, &opt.OptionText, &opt.IsCorrect, &opt.OptionExplanation); err == nil {
					options = append(options, opt)
				}
			}
			optRows.Close()
			q.Options = options
		}

		questions = append(questions, q)
	}

	return questions, nil
}

func (r *tajwidRepository) SaveQuizAttempt(ctx context.Context, userID, quizID string, score float64, totalQuestions, correctAnswers int) error {
	if r.db == nil {
		return nil
	}

	query := `
		INSERT INTO user_quiz_attempts (user_id, quiz_id, score, total_questions, correct_answers)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query, userID, quizID, score, totalQuestions, correctAnswers)
	return err
}

func (r *tajwidRepository) CreateModule(ctx context.Context, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error) {
	now := time.Now()
	m := &model.TajwidModule{
		Title:          req.Title,
		Slug:           req.Slug,
		Summary:        req.Summary,
		ContentBody:    req.ContentBody,
		ThumbnailURL:   req.ThumbnailURL,
		PdfURL:         req.PdfURL,
		YoutubeVideoID: req.YoutubeVideoID,
		OrderIndex:     req.OrderIndex,
		IsActive:       req.IsActive,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if r.db == nil {
		m.ID = "mod-" + req.Slug
		return m, nil
	}

	queryWithMedia := `
		INSERT INTO tajwid_modules (title, slug, summary, content_body, youtube_video_id, order_index, is_active, thumbnail_url, pdf_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, queryWithMedia, req.Title, req.Slug, req.Summary, req.ContentBody, req.YoutubeVideoID, req.OrderIndex, req.IsActive, req.ThumbnailURL, req.PdfURL).
		Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		// Fallback jika database belum memiliki kolom thumbnail_url / pdf_url
		queryLegacy := `
			INSERT INTO tajwid_modules (title, slug, summary, content_body, youtube_video_id, order_index, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, created_at, updated_at
		`
		errLegacy := r.db.QueryRow(ctx, queryLegacy, req.Title, req.Slug, req.Summary, req.ContentBody, req.YoutubeVideoID, req.OrderIndex, req.IsActive).
			Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
		if errLegacy != nil {
			return nil, errLegacy
		}
	}
	return m, nil
}

func (r *tajwidRepository) UpdateModule(ctx context.Context, id string, req model.CreateOrUpdateModuleRequest) (*model.TajwidModule, error) {
	now := time.Now()
	m := &model.TajwidModule{
		ID:             id,
		Title:          req.Title,
		Slug:           req.Slug,
		Summary:        req.Summary,
		ContentBody:    req.ContentBody,
		ThumbnailURL:   req.ThumbnailURL,
		PdfURL:         req.PdfURL,
		YoutubeVideoID: req.YoutubeVideoID,
		OrderIndex:     req.OrderIndex,
		IsActive:       req.IsActive,
		UpdatedAt:      now,
	}

	if r.db == nil {
		return m, nil
	}

	queryWithMedia := `
		UPDATE tajwid_modules
		SET title = $1, slug = $2, summary = $3, content_body = $4, youtube_video_id = $5, order_index = $6, is_active = $7, thumbnail_url = $8, pdf_url = $9, updated_at = CURRENT_TIMESTAMP
		WHERE id = $10
		RETURNING created_at, updated_at
	`
	err := r.db.QueryRow(ctx, queryWithMedia, req.Title, req.Slug, req.Summary, req.ContentBody, req.YoutubeVideoID, req.OrderIndex, req.IsActive, req.ThumbnailURL, req.PdfURL, id).
		Scan(&m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		// Fallback jika belum memiliki kolom thumbnail_url / pdf_url
		queryLegacy := `
			UPDATE tajwid_modules
			SET title = $1, slug = $2, summary = $3, content_body = $4, youtube_video_id = $5, order_index = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
			WHERE id = $8
			RETURNING created_at, updated_at
		`
		errLegacy := r.db.QueryRow(ctx, queryLegacy, req.Title, req.Slug, req.Summary, req.ContentBody, req.YoutubeVideoID, req.OrderIndex, req.IsActive, id).
			Scan(&m.CreatedAt, &m.UpdatedAt)
		if errLegacy != nil {
			return nil, errLegacy
		}
	}
	return m, nil
}

func (r *tajwidRepository) DeleteModule(ctx context.Context, id string) error {
	if r.db == nil {
		return nil
	}
	query := `DELETE FROM tajwid_modules WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *tajwidRepository) UpsertQuizWithQuestions(ctx context.Context, moduleID string, req model.CreateOrUpdateQuizRequest) (*model.TajwidQuiz, error) {
	quiz := &model.TajwidQuiz{
		ModuleID:     moduleID,
		Title:        req.Title,
		Description:  req.Description,
		PassingScore: req.PassingScore,
	}

	if r.db == nil {
		quiz.ID = "quiz-" + moduleID
		return quiz, nil
	}

	// 1. Upsert tajwid_quizzes
	queryQuiz := `
		INSERT INTO tajwid_quizzes (module_id, title, description, passing_score)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (module_id) DO UPDATE
		SET title = EXCLUDED.title, description = EXCLUDED.description, passing_score = EXCLUDED.passing_score, updated_at = CURRENT_TIMESTAMP
		RETURNING id
	`
	err := r.db.QueryRow(ctx, queryQuiz, moduleID, req.Title, req.Description, req.PassingScore).Scan(&quiz.ID)
	if err != nil {
		return nil, err
	}

	// 2. Hapus soal-soal lama untuk modul ini lalu masukkan yang baru
	deleteOld := `DELETE FROM quiz_questions WHERE quiz_id = $1`
	_, _ = r.db.Exec(ctx, deleteOld, quiz.ID)

	// 3. Masukkan questions dan options baru
	for _, qReq := range req.Questions {
		var qID string
		insertQ := `
			INSERT INTO quiz_questions (quiz_id, question_text, audio_sample_url, explanation, order_index)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id
		`
		err := r.db.QueryRow(ctx, insertQ, quiz.ID, qReq.QuestionText, qReq.AudioSampleURL, qReq.Explanation, qReq.OrderIndex).Scan(&qID)
		if err != nil {
			continue
		}

		for _, optReq := range qReq.Options {
			insertOpt := `
				INSERT INTO quiz_options (question_id, option_text, is_correct, option_explanation)
				VALUES ($1, $2, $3, $4)
			`
			_, _ = r.db.Exec(ctx, insertOpt, qID, optReq.OptionText, optReq.IsCorrect, optReq.OptionExplanation)
		}
	}

	return quiz, nil
}

// Fallback seed modules jika DB belum terisi
func (r *tajwidRepository) getFallbackModules() []model.TajwidModule {
	now := time.Now()
	return []model.TajwidModule{
		{
			ID:             "1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21",
			Title:          "Hukum Nun Sukun dan Tanwin",
			Slug:           "hukum-nun-sukun-dan-tanwin",
			Summary:        "Mempelajari 4 kaidah hukum utama: Idzhar Halqi, Idgham (Bighunnah & Bilaghunnah), Ikhfa Haqiqi, dan Iqlab.",
			ContentBody:    "# Hukum Nun Sukun (نْ) dan Tanwin (ـًـٍـٌ)\n\nNun sukun atau tanwin apabila bertemu dengan huruf hijaiyah memiliki 4 hukum bacaan utama yang wajib dikuasai saat membaca Al-Qur'an:\n\n1. **Idzhar Halqi**: Dibaca jelas tanpa dengung jika bertemu 6 huruf tenggorokan (ء, هـ, ع, ح, غ, خ).\n2. **Idgham**: Memasukkan bunyi nun ke huruf berikutnya. Terbagi dua: **Bighunnah** (disertai dengung: ي, ن, م, و) dan **Bilaghunnah** (tanpa dengung: ل, ر).\n3. **Iqlab**: Mengubah bunyi nun menjadi mim (م) disertai dengung ketika bertemu huruf Ba (ب).\n4. **Ikhfa Haqiqi**: Menyamarkan bunyi nun antara idzhar dan idgham disertai ghunnah pada 15 huruf sisa.",
			YoutubeVideoID: "7kK84x4_uY8",
			OrderIndex:     1,
			IsActive:       true,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
		{
			ID:             "2e9c6b15-0537-58c9-c5c4-e3b04aa8fa32",
			Title:          "Hukum Mim Sukun",
			Slug:           "hukum-mim-sukun",
			Summary:        "Mempelajari 3 kaidah hukum: Ikhfa Syafawi, Idgham Mimi (Mutamatsilain), dan Idzhar Syafawi.",
			ContentBody:    "# Hukum Mim Sukun (مْ)\n\nMim sukun apabila bertemu dengan huruf hijaiyah terbagi menjadi 3 kaidah hukum bacaan:\n\n1. **Ikhfa Syafawi**: Mim sukun bertemu huruf Ba (ب), dibaca samar di bibir dengan ghunnah 2 harakat.\n2. **Idgham Mimi / Mitslain**: Mim sukun bertemu huruf Mim (م), dibaca melebur sempurna disertai dengung.\n3. **Idzhar Syafawi**: Mim sukun bertemu huruf selain Mim dan Ba, dibaca jelas tanpa dengung.",
			YoutubeVideoID: "W2b8G4kK9x1",
			OrderIndex:     2,
			IsActive:       true,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
		{
			ID:             "3f0d7c26-1648-69da-d6d5-f4c15bb9fb43",
			Title:          "Hukum Mad (Panjang Bacaan)",
			Slug:           "hukum-mad",
			Summary:        "Mengenal kaidah Mad Thabi'i (Asli) dan ragam Mad Far'i (Wajib Muttashil, Jaiz Munfashil, Lazim).",
			ContentBody:    "# Hukum Mad (Panjang Bacaan)\n\nMad secara bahasa berarti memanjangkan bunyi suara huruf alif, wawu, dan ya mati.\n\n1. **Mad Thabi'i (Asli)**: Panjang 2 harakat (1 alif).\n2. **Mad Wajib Muttashil**: Mad bertemu hamzah dalam satu kata bersambung, dibaca panjang 4-5 harakat.\n3. **Mad Jaiz Munfashil**: Mad bertemu hamzah di kata terpisah, dibaca 4-5 harakat (atau 2 harakat via jalur thoriq tertentu).",
			YoutubeVideoID: "P6a8V9kL2y0",
			OrderIndex:     3,
			IsActive:       true,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}
}

func (r *tajwidRepository) getFallbackQuiz(moduleID string) *model.TajwidQuiz {
	if moduleID == "1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21" {
		return &model.TajwidQuiz{
			ID:           "q1-nun-sukun",
			ModuleID:     "1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21",
			Title:        "Kuis Evaluasi Nun Sukun & Tanwin",
			Description:  "Uji pemahaman kaidah Idzhar, Idgham, Ikhfa, dan Iqlab untuk memastikan tajwid bacaanmu tepat.",
			PassingScore: 70,
			Questions: []model.QuizQuestion{
				{
					ID:           "q1-1",
					QuizID:       "q1-nun-sukun",
					QuestionText: "Berapakah jumlah huruf Idzhar Halqi dan sebutkan di antaranya?",
					Explanation:  "Huruf Idzhar Halqi berjumlah 6 huruf yang keluar dari tenggorokan (halq): Hamzah (ء), Ha (هـ), 'Ain (ع), Ha (ح), Ghain (غ), dan Kha (خ).",
					OrderIndex:   1,
					Options: []model.QuizOption{
						{ID: "opt-1-a", QuestionID: "q1-1", OptionText: "6 huruf: ء, هـ, ع, ح, غ, خ", IsCorrect: true, OptionExplanation: "Tepat! Keenam huruf ini keluar dari makhraj tenggorokan."},
						{ID: "opt-1-b", QuestionID: "q1-1", OptionText: "4 huruf: ي, ن, م, و", IsCorrect: false, OptionExplanation: "Salah, ini adalah huruf Idgham Bighunnah."},
						{ID: "opt-1-c", QuestionID: "q1-1", OptionText: "2 huruf: ل, ر", IsCorrect: false, OptionExplanation: "Salah, ini adalah huruf Idgham Bilaghunnah."},
						{ID: "opt-1-d", QuestionID: "q1-1", OptionText: "1 huruf: ب", IsCorrect: false, OptionExplanation: "Salah, huruf Ba adalah hukum Iqlab."},
					},
				},
				{
					ID:           "q1-2",
					QuizID:       "q1-nun-sukun",
					QuestionText: "Kaidah membaca nun sukun atau tanwin ketika bertemu huruf Ba (ب) dengan menukar bunyi nun menjadi mim disertai dengung disebut...",
					Explanation:  "Iqlab secara bahasa berarti membalik atau menukar. Hukum bacaan ini mengganti bunyi nun mati/tanwin menjadi bunyi mim sukun disertai ghunnah 2 harakat.",
					OrderIndex:   2,
					Options: []model.QuizOption{
						{ID: "opt-2-a", QuestionID: "q1-2", OptionText: "Iqlab", IsCorrect: true, OptionExplanation: "Benar! Iqlab menukar bunyi nun menjadi mim."},
						{ID: "opt-2-b", QuestionID: "q1-2", OptionText: "Idzhar Halqi", IsCorrect: false, OptionExplanation: "Salah, Idzhar dibaca jelas tanpa menukar bunyi."},
						{ID: "opt-2-c", QuestionID: "q1-2", OptionText: "Idgham Bighunnah", IsCorrect: false, OptionExplanation: "Salah, Idgham memasukkan nun ke huruf yanmu."},
						{ID: "opt-2-d", QuestionID: "q1-2", OptionText: "Ikhfa Haqiqi", IsCorrect: false, OptionExplanation: "Salah, Ikhfa menyamarkan bunyi nun ke 15 huruf."},
					},
				},
			},
		}
	}
	return nil
}

func (r *tajwidRepository) getFallbackQuizByID(quizID string) *model.TajwidQuiz {
	return r.getFallbackQuiz("1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21")
}

