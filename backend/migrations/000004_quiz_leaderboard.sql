-- 000004_quiz_leaderboard.sql: Tabel skor dan klasemen kuis bulanan santri

CREATE TABLE IF NOT EXISTS quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL, -- 'guess_surah_ayah' | 'continue_verse'
    juz_start INT NOT NULL DEFAULT 1,
    juz_end INT NOT NULL DEFAULT 30,
    total_questions INT NOT NULL DEFAULT 10,
    correct_answers INT NOT NULL DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    month_key VARCHAR(7) NOT NULL, -- Format YYYY-MM (misal '2026-11')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_scores_month ON quiz_scores(month_key, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON quiz_scores(user_id, month_key);

