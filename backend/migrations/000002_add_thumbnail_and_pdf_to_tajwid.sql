-- Migration 000002: Add thumbnail_url and pdf_url as TEXT to tajwid_modules
ALTER TABLE tajwid_modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE tajwid_modules ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE tajwid_modules ALTER COLUMN thumbnail_url TYPE TEXT;
ALTER TABLE tajwid_modules ALTER COLUMN pdf_url TYPE TEXT;
