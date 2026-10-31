-- Skema Database PostgreSQL Hifzhly App
-- Versi: 1.0 (Hackathon FIFA)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user' (santri) atau 'admin' (ustaz)
    daily_target_ayahs INT NOT NULL DEFAULT 10,
    current_streak INT NOT NULL DEFAULT 0,
    max_streak INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Tabel Murojaah Sessions
CREATE TABLE IF NOT EXISTS murojaah_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    total_ayahs INT NOT NULL DEFAULT 0,
    avg_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_murojaah_sessions_user_id ON murojaah_sessions(user_id);

-- 3. Tabel Murojaah Evaluations
CREATE TABLE IF NOT EXISTS murojaah_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES murojaah_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number > 0),
    audio_duration_ms INT NOT NULL DEFAULT 0,
    transcribed_text TEXT NOT NULL,
    reference_text TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0.00 AND 100.00),
    substitutions INT NOT NULL DEFAULT 0,
    deletions INT NOT NULL DEFAULT 0,
    insertions INT NOT NULL DEFAULT 0,
    word_diff_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_murojaah_evaluations_session ON murojaah_evaluations(session_id);

-- 4. Tabel Ayah Memory States (Spaced Repetition Engine)
CREATE TABLE IF NOT EXISTS ayah_memory_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number > 0),
    repetition_count INT NOT NULL DEFAULT 0,
    interval_days INT NOT NULL DEFAULT 1,
    ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
    last_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    quality_rating INT NOT NULL DEFAULT 0 CHECK (quality_rating BETWEEN 0 AND 5),
    next_review_at DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_surah_ayah UNIQUE (user_id, surah_number, ayah_number)
);

CREATE INDEX IF NOT EXISTS idx_ayah_memory_states_review ON ayah_memory_states(user_id, next_review_at);

-- 5. Tabel Mutabaah Logs
CREATE TABLE IF NOT EXISTS mutabaah_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    ayahs_reviewed INT NOT NULL DEFAULT 0,
    total_duration_minutes INT NOT NULL DEFAULT 0,
    average_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    target_achieved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_log_date UNIQUE (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_mutabaah_logs_user_date ON mutabaah_logs(user_id, log_date DESC);

-- 6. Tabel Modul & Kuis Tajwid Academy
CREATE TABLE IF NOT EXISTS tajwid_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content_body TEXT NOT NULL,
    youtube_video_id VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tajwid_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL UNIQUE REFERENCES tajwid_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INT NOT NULL DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES tajwid_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    audio_sample_url VARCHAR(500),
    explanation TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    option_explanation TEXT
);

CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES tajwid_quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    answers_payload JSONB NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Awal Modul Tajwid
INSERT INTO tajwid_modules (id, title, slug, summary, content_body, youtube_video_id, order_index)
VALUES 
(
    '1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21',
    'Hukum Nun Sukun dan Tanwin',
    'hukum-nun-sukun-dan-tanwin',
    'Mempelajari 4 kaidah hukum: Idzhar Halqi, Idgham (Bighunnah & Bilaghunnah), Ikhfa Haqiqi, dan Iqlab.',
    '# Hukum Nun Sukun (نْ) dan Tanwin (ـًـٍـٌ)\n\nNun sukun atau tanwin apabila bertemu dengan huruf hijaiyah memiliki 4 hukum bacaan utama yang wajib dikuasai saat membaca Al-Qur''an.',
    '7kK84x4_uY8',
    1
),
(
    '2e9c6b15-0537-58c9-c5c4-e3b04aa8fa32',
    'Hukum Mim Sukun',
    'hukum-mim-sukun',
    'Mempelajari kaidah Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.',
    '# Hukum Mim Sukun (مْ)\n\nMim sukun apabila bertemu dengan huruf hijaiyah terbagi menjadi 3 hukum bacaan: Ikhfa Syafawi (bertemu Ba), Idgham Mimi (bertemu Mim), dan Idzhar Syafawi (bertemu huruf selain Mim dan Ba).',
    'W2b8G4kK9x1',
    2
)
ON CONFLICT (slug) DO NOTHING;
