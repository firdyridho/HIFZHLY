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
  - [x] Rute Landing Page Publik (`/` di [`LandingPage.tsx`](../frontend/src/pages/LandingPage.tsx)) dengan `TubelightNavbar` terisolasi dan in-page section smooth scrolling (`#simulasi`, `#fitur`, `#arsitektur`, `#alur`, `#faq`)
  - [x] Rute Beranda Murojaah Santri (`/app` di [`MurojaahPage.tsx`](../frontend/src/pages/MurojaahPage.tsx))
  - [x] Rute Mushaf Al-Qur'an (`/app/mushaf` di [`MushafPage.tsx`](../frontend/src/pages/MushafPage.tsx))
  - [x] Rute Tajwid Academy (`/app/tajwid` di [`TajwidPage.tsx`](../frontend/src/pages/TajwidPage.tsx))
  - [x] Rute Mutabaah Analytics (`/app/mutabaah` di [`MutabaahPage.tsx`](../frontend/src/pages/MutabaahPage.tsx))
  - [x] Rute Login Terpadu Santri/Admin (`/login` di [`LoginPage.tsx`](../frontend/src/pages/LoginPage.tsx))
  - [x] Rute Registrasi Santri/Admin (`/register` di [`RegisterPage.tsx`](../frontend/src/pages/RegisterPage.tsx))
  - [x] Rute Ketentuan Layanan & Privasi Suara (`/terms` di [`TermsPage.tsx`](../frontend/src/pages/TermsPage.tsx))
  - [x] Rute Panel Pengawasan Musyrif/Admin (`/admin` di [`AdminDashboardPage.tsx`](../frontend/src/pages/AdminDashboardPage.tsx))
  - [x] Halaman 404 Kustom Islami ([`NotFoundPage.tsx`](../frontend/src/pages/NotFoundPage.tsx))
- [x] Komponen Tata Letak Terpusat ([`MainLayout.tsx`](../frontend/src/components/layout/MainLayout.tsx)):
  - [x] Pemisahan total dari navbar landing page
  - [x] Header dinamis menampilkan profil santri (`fullName`), target hafalan harian (`dailyTargetAyahs`), streak api konsistensi (`Flame` Lucide), dan logout
  - [x] `NavLink` Active Tab Highlighting dengan icon Lucide
- [x] Halaman Autentikasi: Form Login & Register dengan tab switcher Santri / Ustaz, validasi input, dan token storage (`REQ-FE-02`).
- [x] Komponen Mushaf Al-Qur'an (`REQ-FE-03`):
  - [x] Fetch data surah Juz 'Amma dari API backend `/api/v1/quran/surahs` dan surah detail `/api/v1/quran/surahs/{number}`.
  - [x] Rendering tipografi huruf Arab berukuran besar dan lega (font *Amiri Quran*).
  - [x] Integrasi Tombol Indikator Peringatan Ayat Mutasyabihat (Tarteel QUL Standard) pada ayat dengan `mutashabihat.length > 0` (`AlertTriangle` icon, tanpa emoji).
  - [x] Modal perbandingan ayat mutasyabihat: menampilkan ayat aktif, ayat pembanding di surah lain, wazan kemiripan, dan catatan tajwid pembeda.
  - [x] Pemutar audio qari resmi per ayat (audio element dengan play/pause toggle).
- [x] Modul Perekaman Suara (Web Audio API Recorder):
  - [x] Mengambil izin mikrofon peramban pengguna (`navigator.mediaDevices.getUserMedia`).
  - [x] Konversi audio ke sample rate **16 kHz Mono WAV/PCM**.
  - [x] Visualizer animasi gelombang suara (*waveform canvas/bars*) saat pengguna melafalkan ayat.
- [x] Layar Pembelajaran Tajwid & Kuis (`REQ-FE-01`):
  - [x] Fetch data modul dari `/api/v1/tajwid/modules`.
  - [x] Integrasi video YouTube embed player.
  - [x] Form interaktif pengerjaan kuis pilihan ganda.
  - [x] Layar Review Pembahasan Kuis Pasca Submit: Skor numerik besar, status Lulus / Coba Lagi, perbandingan pilihan santri vs kunci jawaban, dan kotak penjelasan kaidah toska lembut.

### Tahap 3: Visualisasi Hasil AI Voice & Layar Review Pembahasan (Jam 10:00 – 17:00)
- [x] Integrasi Endpoint Evaluasi Suara `/api/v1/murojaah/evaluate`:
  - [x] Pengiriman payload `multipart/form-data` audio suara ke backend.
  - [x] Indikator loading evaluasi AI yang responsif (< 3 detik).
- [x] Komponen Penyorotan Kata (*Word-Level Highlighting*):
  - [x] Kata berstatus `correct`: warna teks hijau tua lembut dan border emerald.
  - [x] Kata berstatus `substituted`: warna latar merah muda dan teks merah tebal, dengan tooltip koreksi detail.
  - [x] Kata berstatus `deleted`: penanda tanda panah/kata terlewat.
- [x] Layar Review Pembahasan Kuis Tajwid (`REQ-FE-01` selesai diimplementasikan di `TajwidPage.tsx`).
- [x] Mengonsumsi data antrean murojaah harian dari `/api/v1/srs/today`.

### Tahap 4: Dashboard Mutabaah, Responsivitas Mobile & Polish (Jam 17:00 – 21:00)
- [x] Dashboard Mutabaah Digital ([`MutabaahPage.tsx`](../frontend/src/pages/MutabaahPage.tsx)):
  - [x] Indikator Streak Api Murojaah (`currentStreak` & `maxStreak` dengan ikon `Flame` Lucide SVG).
  - [x] Visualisasi Heatmap Hafalan 37 Surah Juz 'Amma (kode warna: Kuat/Hijau, Sedang/Kuning, Lemah/Merah) beserta modal interaktif perincian ayat per surah.
  - [x] Grafik aktivitas mingguan konsistensi murojaah dari `/api/v1/mutabaah/summary`.
- [x] Uji responsivitas pada layar smartphone (resolusi 360 px, 390 px iPhone, 412 px Android) memastikan tidak ada horizontal scrollbar.
- [x] State caching di LocalStorage untuk preferensi font, profil user, dan token JWT.
- [x] Real-time Live Recitation & Mushaf Hafalan Ghaib di `MurojaahPage.tsx` (Tarteel Style):
  - [x] Web Speech API (`ar-SA`) continuous live voice recognition tanpa latensi.
  - [x] Mushaf View dengan kata tersembunyi `------` (Mode Ghaib) yang terbuka seketika saat dilafalkan.
  - [x] Status bar real-time `...Menunggu suara` & live spoken transcript.
  - [x] Toggle Mode Bantuan Mata (Eye Button) & otomatisasi sinkronisasi ke PostgreSQL SRS.

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
* [x] **2026-10-31 (15:00)**: Implementasi 3D Scroll-Driven Deck Carousel (kartu maju/mundur mengikuti scroll atas-bawah menggunakan InteractiveCard) & integrasi Lightswind ScrollTimeline pada seksi arsitektur evaluasi Hifzhly.
* [x] **2026-10-31 (15:35)**: Pembersihan menyeluruh badge pill pada Landing Page (Zero Badge Slop), integrasi `TubelightNavbar` terisolasi di landing page, pemisahan header aplikasi pasca-login dengan profil santri dinamis (`REQ-FE-02`), peringatan ayat Mutasyabihat Tarteel QUL di `MushafPage.tsx` (`REQ-FE-03`), dan layar review pembahasan kuis pasca submit di `TajwidPage.tsx` (`REQ-FE-01`).
* [x] **2026-10-31 (16:20)**: Penyesuaian tautan navbar landing page eksklusif ke anchor section in-page (`#simulasi`, `#fitur`, `#arsitektur`, `#alur`, `#faq`) dengan animasi smooth scroll & scrollspy aktif. Seluruh fitur utama dialokasikan penuh ke area pasca-login.
* [x] **2026-10-31 (16:26)**: Implementasi penuh modul perekaman suara Web Audio API dengan visualizer waveform canvas real-time, evaluasi suara AI Levenshtein kata demi kata (`MurojaahPage.tsx`), dan dashboard mutabaah digital dengan heatmap interaktif 37 surah Juz 'Amma serta grafik aktivitas mingguan (`MutabaahPage.tsx`).
* [x] **2026-10-31 (16:40)**: Optimalisasi responsivitas mobile menyeluruh (anti-offside & anti-clutter): implementasi Hamburger Menu interaktif pada TubelightNavbar landing page dengan animated drawer, perbaikan offside width horizontal pada ScrollTimeline, Scroll3DCarousel, HeroSandbox, dan header aplikasi pasca-login.
* [x] **2026-10-31 (17:20)**: Penyempurnaan Form Autentikasi & Target Hafalan Dashboard: (1) Form Login Terpadu: Penyatuan form login tanpa tab santri/admin, otomatis deteksi role via response backend, penghapusan container card tebal di belakang form, dan toggle tampil/sembunyi kata sandi (Eye/EyeOff Lucide). (2) Form Registrasi Akun: Penghapusan input target ayat dari pendaftaran, penghapusan container card tebal di belakang form, checklist ketentuan kata sandi interaktif (minimal 6 karakter, huruf besar & kecil, mengandung angka, karakter spesial), penambahan input Konfirmasi Kata Sandi dengan validasi kecocokan, dan toggle Eye/EyeOff pada kedua input kata sandi. (3) Target Hafalan Dashboard: Pemindahan pengaturan target ayat/hari ke kartu 'Target Hari Ini' di Mutabaah Dashboard dengan kontrol interaktif (preset 5, 10, 15, 20 & custom stepper) yang tersinkronisasi dinamis ke header aplikasi via profile state.
* [x] **2026-10-31 (17:40)**: Implementasi Desain Dashboard Islami Modern & Mobile Bottom Footer Nav: (1) Form Registrasi: Penghapusan total opsi 'Tipe Akun' sehingga pendaftaran lebih ringkas dan otomatis sebagai santri. (2) Dashboard Santri Baru (DashboardPage.tsx): Banner emerald waktu sholat dengan jam digital real-time, hitung mundur waktu sholat berikutnya, jadwal 5 waktu sholat fardhu, grid Menu Utama 8 fitur (Qur'an, Hafalan SRS, Murojaah AI, Mutabaah, Belajar Tajwid, Doa Murojaah, Kuis Tajwid, Target), dan seksi Aktivitas Santri mencakup modul Belajar Tajwid Academy, antrean murojaah harian, serta streak konsistensi. (3) Mobile Bottom Footer: Navigasi bawah khusus HP dengan center elevated green FAB beranda (Qur'an, Mutabaah, Beranda FAB, Tajwid, Keluar) yang responsif, native-feel, dan anti-clutter.
* [x] **2026-10-31 (18:10)**: Redesain Mushaf Digital, Pemindahan Menu Navigasi Desktop ke Navbar, & Eliminasi Footer Dashboard: (1) Mushaf Digital: Redesain katalog Mushaf Al-Qur'an sesuai gambar referensi: banner 'TERAKHIR BACA' dinamis (Surah ke-14 / surah aktif berhenti di ayat tertentu), tab switcher interaktif [Surah] vs [Juz] (30 Juz lengkap), search bar pencarian nama surah/nomor, dan filter pills [Semua], [Makiyyah], [Madaniyyah]. Tampilan list surah elegan dengan nomor kotak, nama latin, metadata ayat, dan kaligrafi Arab hijau, serta tampilan bacaan ayat lengkap dengan audio dan deteksi Mutasyabihat. (2) Navbar Desktop: Memindahkan menu pilihan navigasi (Beranda, Mushaf, Murojaah, Tajwid, Mutabaah) langsung ke dalam navbar header atas desktop, menghapus bar tab duplikat di dalam konten main. (3) Eliminasi Footer: Menghapus footer akademik di dashboard/app sehingga tampilan dashboard menjadi bersih, lapang, dan bebas distraksi.
