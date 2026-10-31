# Roadmap dan Histori Tugas Frontend & UI/UX (Frontend Tasks)

| Atribut | Keterangan |
| :--- | :--- |
| **Penanggung Jawab** | **Faeyza Ardellein Yaradhitya** (Frontend Engineer & UI/UX Designer) |
| **Stack Teknologi** | React 19, Vite, Tailwind CSS v4, Web Audio API, React Icons / Lucide |
| **Status Roadmap** | Aktif / Hackathon FIFA 24 Jam |
| **Dokumen Terkait** | [`FRONTEND_REQUESTS.md`](./FRONTEND_REQUESTS.md) / [`API.md`](./API.md) / [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md) |

---

## 1. Roadmap Tahapan 24 Jam (Checklist Kerja)

### Tahap 1: Setup Proyek, Desain Antarmuka & Wireframing (Jam 00:00 – 02:00)
- [x] Menyepakati kontrak interface, tipe audio, dan konvensi `camelCase` di [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md).
- [x] Inisialisasi proyek React 19 + Vite + TypeScript (`frontend/package.json`).
- [x] Konfigurasi Tailwind CSS v4, konfigurasi palet warna Hifzhly (Islamic Emerald Green `#0F766E` / `#059669`, background tenang `#F8FAFC`, font *Amiri Quran* & *Plus Jakarta Sans*).
- [x] Pemasangan Branding Resmi Hifzhly: Favicon (`icon_favicon.png`), Navbar Logo (`logo saja.png`), dan Footer Banner (`hafizhly_panjang.png`).
- [x] Konfigurasi SPA Anti-404 Vercel ([`vercel.json`](../frontend/vercel.json)) dan Nginx ([`nginx.conf`](../frontend/nginx.conf)).
- [x] Penerapan Aturan Desain Anti-AI-Slop & Zero Emojis ([`.agent/rules/design-rules.md`](../.agent/rules/design-rules.md) & [`AGENTS.md`](../AGENTS.md)): penggantian seluruh emoji dengan SVG Lucide/shadcn icons dan eliminasi badge pill berlebih.

### Tahap 2: Layanan UI Inti, Mushaf & Routing Modular (Jam 02:00 – 10:00)
- [x] Setup Modular Routing (`react-router-dom` v7) di [`src/routes/index.tsx`](../frontend/src/routes/index.tsx):
  - [x] Rute Landing Page Publik (`/` di [`LandingPage.tsx`](../frontend/src/pages/LandingPage.tsx))
  - [x] Rute Beranda Murojaah Santri (`/app` di [`MurojaahPage.tsx`](../frontend/src/pages/MurojaahPage.tsx))
  - [x] Rute Mushaf Al-Qur'an (`/app/mushaf` di [`MushafPage.tsx`](../frontend/src/pages/MushafPage.tsx))
  - [x] Rute Tajwid Academy (`/app/tajwid` di [`TajwidPage.tsx`](../frontend/src/pages/TajwidPage.tsx))
  - [x] Rute Mutabaah Analytics (`/app/mutabaah` di [`MutabaahPage.tsx`](../frontend/src/pages/MutabaahPage.tsx))
  - [x] Rute Login Terpadu Santri/Admin (`/login` di [`LoginPage.tsx`](../frontend/src/pages/LoginPage.tsx))
  - [x] Rute Registrasi Santri/Admin (`/register` di [`RegisterPage.tsx`](../frontend/src/pages/RegisterPage.tsx))
  - [x] Rute Ketentuan Layanan & Privasi Suara (`/terms` di [`TermsPage.tsx`](../frontend/src/pages/TermsPage.tsx))
  - [x] Rute Panel Pengawasan Musyrif/Admin (`/admin` di [`AdminDashboardPage.tsx`](../frontend/src/pages/AdminDashboardPage.tsx))
  - [x] Halaman 404 Kustom Islami ([`NotFoundPage.tsx`](../frontend/src/pages/NotFoundPage.tsx))
- [x] Komponen Tata Letak Terpusat ([`MainLayout.tsx`](../frontend/src/components/layout/MainLayout.tsx)) dengan `NavLink` Active Tab Highlighting dan icon Lucide (`Flame`, `Home`, `LogOut`).
- [x] Halaman Autentikasi: Form Login & Register dengan tab switcher Santri / Ustaz, validasi input, dan token storage.
- [x] Komponen Mushaf Al-Qur'an:
  - [x] Fetch data surah Juz 'Amma dari API backend `/api/v1/quran/surahs`.
  - [x] Rendering tipografi huruf Arab berukuran besar dan lega (font *Amiri Quran*).
  - [x] Integrasi Badge Peringatan Ayat Mutasyabihat (Tarteel QUL Standard) pada Surah An-Naba' (sesuai `REQ-FE-03`).
  - [ ] Pemutar audio qari resmi per ayat (audio element dengan progress bar interaktif).
- [ ] Modul Perekaman Suara (Web Audio API Recorder):
  - [ ] Mengambil izin mikrofon peramban pengguna (`navigator.mediaDevices.getUserMedia`).
  - [ ] Konversi audio ke sample rate **16 kHz Mono WAV/PCM**.
  - [ ] Visualizer animasi gelombang suara (*waveform canvas/bars*) saat pengguna melafalkan ayat.
- [ ] Layar Pembelajaran Tajwid & Kuis:
  - [x] Fetch data modul dari `/api/v1/tajwid/modules`.
  - [ ] Integrasi video YouTube embed player (`react-youtube` / responsive iframe).
  - [ ] Layar Review Pembahasan Kuis dengan Accordion penjelasan kaidah tajwid (sesuai `REQ-FE-01`).

### Tahap 3: Visualisasi Hasil AI Voice & Layar Review Pembahasan (Jam 10:00 – 17:00)
- [ ] Integrasi Endpoint Evaluasi Suara `/api/v1/murojaah/evaluate`:
  - [ ] Pengiriman payload `multipart/form-data` audio suara ke backend.
  - [ ] Indikator loading evaluasi AI yang responsif (< 3 detik).
- [ ] Komponen Penyorotan Kata (*Word-Level Highlighting*):
  - [ ] Kata berstatus `correct`: warna teks hijau tua lembut.
  - [ ] Kata berstatus `substituted`: warna latar merah muda dan teks merah tebal, dengan tooltip koreksi.
  - [ ] Kata berstatus `deleted`: penanda tanda panah/kata terlewat.
- [ ] Layar Review Pembahasan Kuis Tajwid:
  - [ ] Menampilkan nilai akhir, lencana kelulusan (*Passed / Try Again*).
  - [ ] Accordion / Card pembahasan per butir soal: memperlihatkan opsi yang dipilih pengguna, kunci jawaban benar, dan box penjelasan edukatif warna hijau toska.
- [ ] Mengonsumsi data antrean murojaah harian dari `/api/v1/srs/today`.

### Tahap 4: Dashboard Mutabaah, Responsivitas Mobile & Polish (Jam 17:00 – 21:00)
- [ ] Dashboard Mutabaah Digital:
  - [ ] Indikator Streak Api Murojaah (`currentStreak` & `maxStreak`).
  - [ ] Visualisasi Heatmap Hafalan Surah (kode warna: Kuat/Hijau, Sedang/Kuning, Lemah/Merah).
  - [ ] Grafik aktivitas mingguan konsistensi murojaah.
- [ ] Uji responsivitas pada layar smartphone (resolusi 360 px, 390 px iPhone, 412 px Android) memastikan tidak ada horizontal scrollbar.
- [ ] State caching di LocalStorage untuk preferensi font dan token JWT.

### Tahap 5: Video Demo, Bahan Presentasi & Pitch Deck (Jam 21:00 – 24:00)
- [ ] Perekaman video demo produk berdurasi 3 menit yang menonjolkan fitur unggulan:
  1. Pengguna membuka Hifzhly dan melihat rekomendasi ayat SRS hari ini.
  2. Merekam suara murojaah dan mendapatkan skor AI real-time beserta highlight kata yang keliru.
  3. Membuka Tajwid Academy, menonton penjelasan video, menjawab kuis, dan melihat layar review pembahasan.
  4. Melihat mutabaah otomatis dan peningkatan streak.
- [ ] Menyusun slide pitch deck presentasi Hackathon FIFA yang memukau juri.

---

## 2. Riwayat Tugas Selesai (Completed Log)

* [x] **2026-10-31 (01:00)**: Penandatanganan kontrak kerja antarmuka API, penetapan struktur warna UI, dan pembagian tugas tahap 1 di [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md).
* [x] **2026-10-31 (02:00)**: Inisialisasi boilerplate React 19 + TypeScript + Tailwind CSS v4, konfigurasi font Arab Amiri Quran.
* [x] **2026-10-31 (02:45)**: Pemasangan konfigurasi SPA rewrite di `vercel.json` dan `nginx.conf` untuk eliminasi resiko error 404 saat deployment.
* [x] **2026-10-31 (03:30)**: Pemasangan aset branding resmi Hifzhly (`icon_favicon.png`, `logo saja.png`, dan `hafizhly_panjang.png`).
* [x] **2026-10-31 (04:15)**: Implementasi arsitektur routing modular `react-router-dom` v7 di `src/routes/index.tsx`, `MainLayout.tsx`, dan pembuatan halaman 404 kustom islami di `src/pages/NotFoundPage.tsx`.
* [x] **2026-10-31 (05:00)**: Pemisahan seluruh halaman view ke dalam folder terisolasi `src/pages/` (MurojaahPage, MushafPage, TajwidPage, MutabaahPage, NotFoundPage).
* [x] **2026-10-31 (13:55)**: Refactor & upgrade Landing Page interaktif: integrasi Lenis smooth scroll, live Hero Sandbox 'Sedang Mendengarkan' (QS. An-Naba 1-2 dengan Levenshtein word diff), 3D Mushaf scrollytelling, Bento Grid interaktif dengan kuis mini langsung, dan timeline alur murojaah 4 tahap sesuai Zero Emojis Policy.
* [x] **2026-10-31 (14:45)**: Refactor Hero copywriting simpel & punchy, implementasi Lightswind InteractiveCard (3D tilt & cursor radial glow), dan animasi scroll-reveal viewport di seluruh card landing page.

