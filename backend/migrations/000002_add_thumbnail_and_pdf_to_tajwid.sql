-- Migration 000002: Add thumbnail_url and pdf_url to tajwid_modules
ALTER TABLE tajwid_modules ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);
ALTER TABLE tajwid_modules ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);
