# Tajwid 3-Step Word-like Document Editor & Gemini AI Quiz Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti modal pop-up tambah materi tajwid yang sempit menjadi lembar kerja editor penuh 3-langkah (*Full-Screen 3-Step Tajwid Curriculum Builder*) dengan tampilan dokumen ala Microsoft Word dan generator kuis otomatis berbasis Gemini AI.

**Architecture:**
- Frontend: Komponen mandiri `TajwidCurriculumEditor.tsx` dengan Stepper (1: Info & Media Dasar, 2: Lembar Kerja Dokumen Word, 3: Kuis & Gemini AI Generator). Menggantikan popup modal sempit di `AdminDashboardPage.tsx`.
- Media Integration: YouTube player preview, PDF attachment/link, dan thumbnail visual uploader/URL.
- Document Editor: Tampilan kertas A4 berbayang dengan toolbar WYSIWYG/markdown (Heading, Bold, Italic, Underline, Bullet/Numbered List, Sisip Lafal Arab Quran, Kotak Dalil/Catatan Tajwid).
- AI Engine: Integrasi seamless ke backend `POST /api/v1/admin/tajwid/generate-quiz` yang menyerap topik dan isi lembar kerja dokumen Word untuk menyusun soal pilihan ganda tajwid lengkap dengan pembahasan.
- Backend: Dukungan field `thumbnailUrl` dan `pdfUrl` pada `TajwidModule` dan DTO `CreateOrUpdateModuleRequest`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React (no Unicode emojis), Go 1.24, PostgreSQL.

## Global Constraints
- **Zero Emojis in UI**: Never use Unicode emojis in components, buttons, navigation, headers, cards, or messages. Always use clean, professional SVG icons from `lucide-react`.
- **Aesthetic**: Scholarly, serious, clean typography with high-contrast Arabic script (`font-quran text-2xl`+).
- **No Popup Dialogs for Curriculum**: The editor must occupy the main dashboard area as a full-screen canvas, not a cramped overlay modal.

---

### Task 1: Backend DTO & Repository Extension for Thumbnail & PDF
**Files:**
- Modify: `backend/internal/model/tajwid.go`
- Modify: `backend/internal/repository/tajwid_repository.go`
- Create: `backend/migrations/000002_add_thumbnail_and_pdf_to_tajwid.sql`
- Modify: `frontend/src/types/index.ts`

- [ ] Tambahkan field `ThumbnailURL` dan `PdfURL` pada struct `TajwidModule` dan `CreateOrUpdateModuleRequest` di `backend/internal/model/tajwid.go`.
- [ ] Buat file migrasi `backend/migrations/000002_add_thumbnail_and_pdf_to_tajwid.sql` dengan `ALTER TABLE tajwid_modules ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500); ALTER TABLE tajwid_modules ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);`.
- [ ] Perbarui `backend/internal/repository/tajwid_repository.go` untuk membaca dan menyimpan kolom `thumbnail_url` dan `pdf_url`.
- [ ] Perbarui tipe frontend `TajwidModule` di `frontend/src/types/index.ts` dengan `thumbnailUrl?: string` dan `pdfUrl?: string`.
- [ ] Verifikasi build backend dengan `go build ./...` di folder `backend`.

---

### Task 2: Build `TajwidCurriculumEditor.tsx` Component (3-Step Word Canvas)
**Files:**
- Create: `frontend/src/components/admin/TajwidCurriculumEditor.tsx`

- [ ] Buat stepper header 3 langkah (1. Info & Media, 2. Lembar Dokumen Word, 3. Kuis & Evaluasi AI).
- [ ] Implementasikan **Step 1 (Info & Media)**:
  - Input Judul Modul & Auto-Slug generator.
  - Ringkasan / Deskripsi Modul.
  - Thumbnail Selector (Preview gambar + upload/link).
  - Link Video YouTube dengan ekstraksi ID otomatis dan pemutar preview embed video.
  - PDF Materi Attachment (upload/link berkas PDF dengan icon badge dan preview status).
  - Target Urutan & Kategori Bab Tajwid.
- [ ] Implementasikan **Step 2 (Lembar Kerja Materi ala Word)**:
  - Toolbar dokumen di bagian atas: Font Style, Heading 1, Heading 2, Heading 3, Paragraf, Bold, Italic, Underline, Strikethrough, Bullet List, Numbered List, Alignments.
  - Tombol aksi Islami: "Sisip Ayat/Lafal Arab" (dengan font Uthmani) dan "Kotak Dalil/Catatan Tajwid" (syarah box dengan border aksen emerald).
  - Lembar kertas dokumen di tengah (canvas putih A4 dengan shadow elegan, margin rapi, dan responsif).
  - Penghitung kata (Word count), estimasi menit baca, dan indikator status dokumen.
- [ ] Implementasikan **Step 3 (Evaluasi Kuis & Gemini AI Generator)**:
  - Form Judul Kuis, Passing Grade (KKM), dan Waktu.
  - Kotak "Generator Kuis Otomatis (Gemini AI)" dengan tombol interaktif, selector tingkat kesulitan (Mudah, Sedang, Sulit), dan jumlah soal.
  - Pemanggilan API `/api/v1/admin/tajwid/generate-quiz` dengan mengirimkan topik dari Step 1 dan isi lembar kerja dokumen dari Step 2.
  - Editor daftar soal (pertanyaan, lafal Arab, 4 pilihan A-D, radio button kunci jawaban benar, dan syarah penjelasan kaidah).
  - Tombol tambah soal manual dan hapus butir soal.
- [ ] Navigation controls: Back, Next Step, Batal / Kembali ke Daftar, dan "Simpan & Terbitkan Modul".

---

### Task 3: Seamless Integration into `AdminDashboardPage.tsx`
**Files:**
- Modify: `frontend/src/pages/AdminDashboardPage.tsx`

- [ ] Hapus popup modal sempit (`isModalOpen` overlay dialog) dan ganti dengan tampilan kanvas penuh `TajwidCurriculumEditor`.
- [ ] Sambungkan tombol "Tambah Modul Tajwid Baru" di tab Kurikulum Tajwid agar mengaktifkan mode editor penuh (`isEditingTajwid: true`, `activeEditingModule: null`).
- [ ] Sambungkan tombol "Edit" pada tiap kartu modul agar memuat data modul ke dalam editor (`activeEditingModule: module`).
- [ ] Tambahkan handler simpan data modul dan kuis ke backend `/api/v1/admin/tajwid/modules` dengan pesan toast konfirmasi sukses.
- [ ] Uji alur tombol "Batal / Kembali" agar kembali ke tabel daftar modul tanpa kehilangan data santri.

---

### Task 4: Verification & Build
**Files:**
- Test & Build: Frontend & Backend

- [ ] Jalankan `npm --prefix frontend run build` untuk memverifikasi 0 TypeScript errors dan bundle ter-generate sukses.
- [ ] Jalankan `go build ./...` di folder `backend`.
- [ ] Commit perubahan dan push ke GitHub repository (`staging` dan `main`).
- [ ] Uji coba langsung di browser untuk memastikan tampilan lembar dokumen Word, preview YouTube, PDF, dan generator kuis Gemini AI berjalan mulus.
