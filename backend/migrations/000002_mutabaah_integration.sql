-- Migrasi 000002: Sistem Mutabaah Terpadu & Komitmen Target Santri
-- Mendukung auto-logging dari Tilawah, Hafalan Baru, Murojaah, serta Evaluasi Musyrif

-- 1. Penambahan Kolom pada Tabel mutabaah_logs
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS activity_type VARCHAR(30) DEFAULT 'murojaah';
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS surah_number INT DEFAULT 1;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS surah_name VARCHAR(100) DEFAULT '';
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS start_ayah INT DEFAULT 1;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS end_ayah INT DEFAULT 1;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS total_ayahs INT DEFAULT 1;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS pages_count INT DEFAULT 1;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS duration_seconds INT DEFAULT 0;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS score NUMERIC(5,2) DEFAULT NULL;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS santri_notes TEXT DEFAULT NULL;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS ustadz_notes TEXT DEFAULT NULL;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS ustadz_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE mutabaah_logs ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'completed';

-- Hapus konstrain unik (user_id, log_date) agar santri dapat mencatat beberapa sesi per hari
ALTER TABLE mutabaah_logs DROP CONSTRAINT IF EXISTS uq_user_log_date;

-- Buat indeks untuk performa query riwayat mutabaah
CREATE INDEX IF NOT EXISTS idx_mutabaah_logs_user_activity ON mutabaah_logs(user_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mutabaah_logs_status ON mutabaah_logs(status);

-- 2. Tabel Target & Komitmen Mandiri Santri
CREATE TABLE IF NOT EXISTS user_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_target_ayahs_tilawah INT DEFAULT 20,
    daily_target_pages_tilawah INT DEFAULT 2,
    daily_target_ayahs_hafalan INT DEFAULT 5,
    target_surah_number INT DEFAULT NULL,
    target_surah_name VARCHAR(100) DEFAULT NULL,
    target_start_ayah INT DEFAULT 1,
    target_end_ayah INT DEFAULT NULL,
    target_deadline DATE DEFAULT NULL,
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_commitment UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_commitments_user ON user_commitments(user_id);

