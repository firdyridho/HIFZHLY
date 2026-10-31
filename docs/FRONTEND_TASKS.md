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
- [ ] Inisialisasi proyek React 19 + Vite (`pnpm create vite frontend --template react-ts`).
- [ ] Konfigurasi Tailwind CSS v4, konfigurasi palet warna Hifzhly (Islamic Emerald Green `#0F766E` / `#059669`, background tenang `#F8FAFC`, aksen ayat `#1E293B`).
- [ ] Pembuatan Wireframe / Mockup 4 layar utama:
  - [ ] Layar Beranda (Target hari ini, SRS due ayahs, streak mutabaah).
  - [ ] Layar Smart Murojaah (Mushaf interaktif, tombol rekam suara, live waveform, word highlighting).
  - [ ] Layar Tajwid Academy (Daftar materi, embed player YouTube, form kuis).
  - [ ] Layar Review Pembahasan Kuis (Rekap skor, kartu soal interaktif, penjelasan kaidah tajwid).

### Tahap 2: Layanan UI Inti, Mushaf & Web Audio Recorder (Jam 02:00 – 10:00)
- [ ] Setup Routing (React Router v7): `/`, `/login`, `/register`, `/murojaah`, `/tajwid`, `/tajwid/:slug`, `/mutabaah`.
- [ ] Halaman Autentikasi: Form Login & Register dengan validasi input ramah pengguna.
- [ ] Komponen Mushaf Al-Qur'an:
  - [ ] Fetch data surah dari API backend `/api/v1/quran/surahs`.
  - [ ] Rendering tipografi huruf Arab berukuran besar dan lega (font *LPMQ Isep Misbah* / *Amiri Quran*).
  - [ ] Pemutar audio qari resmi per ayat (audio element dengan progress bar interaktif).
- [ ] Modul Perekaman Suara (Web Audio API Recorder):
  - [ ] Mengambil izin mikrofon peramban pengguna (`navigator.mediaDevices.getUserMedia`).
  - [ ] Konversi audio ke sample rate **16 kHz Mono WAV/PCM**.
  - [ ] Visualizer animasi gelombang suara (*waveform canvas/bars*) saat pengguna melafalkan ayat.
- [ ] Layar Pembelajaran Tajwid:
  - [ ] Integrasi video YouTube embed player (`react-youtube` / responsive iframe).
  - [ ] Renderer konten artikel ringkasan materi tajwid berformat markdown.
  - [ ] Komponen form pengerjaan kuis pilihan ganda.

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

* [x] **2026-10-31**: Penandatanganan kontrak kerja antarmuka API, penetapan struktur warna UI, dan pembagian tugas tahap 1 di [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md).

