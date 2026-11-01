-- Migrasi 000003: Alur Progresi & Satuan Target Murojaah Mandiri Santri
-- Mendukung kustomisasi unit target (surah/ayat/halaman) dan alur progresi (Juz 30, Juz 1, custom)

ALTER TABLE user_commitments ADD COLUMN IF NOT EXISTS progression_order VARCHAR(50) DEFAULT 'juz_30';
ALTER TABLE user_commitments ADD COLUMN IF NOT EXISTS murojaah_target_unit VARCHAR(30) DEFAULT 'surah';
ALTER TABLE user_commitments ADD COLUMN IF NOT EXISTS daily_target_murojaah_count INT DEFAULT 1;
ALTER TABLE user_commitments ADD COLUMN IF NOT EXISTS target_juz_number INT DEFAULT 30;

