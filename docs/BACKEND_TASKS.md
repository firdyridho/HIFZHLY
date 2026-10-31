# Roadmap dan Histori Tugas Backend & AI (Backend Tasks)

| Atribut | Keterangan |
| :--- | :--- |
| **Penanggung Jawab** | **Firdy Ridho Fillah** (Ketua Tim, Backend & Integrasi AI) |
| **Stack Teknologi** | Go (REST API), PostgreSQL 16, Redis 7.2, Python 3.11 (Whisper ASR & Levenshtein) |
| **Status Roadmap** | Aktif / Hackathon FIFA 24 Jam |
| **Dokumen Terkait** | [`BACKEND_REQUESTS.md`](./BACKEND_REQUESTS.md) / [`API.md`](./API.md) / [`ERD.md`](./ERD.md) |

---

## 1. Roadmap Tahapan 24 Jam (Checklist Kerja)

### Tahap 1: Fondasi Arsitektur, Kontrak & Database (Jam 00:00 – 02:00)
- [x] Menyepakati kontrak data JSON (`camelCase`), representasi waktu ISO 8601 UTC, dan batas tanggung jawab di [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md).
- [ ] Inisialisasi modul Go (`go mod init hifzhly-backend`) dan setup struktur folder Clean Architecture (`cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`, `pkg/`).
- [ ] Menulis file migrasi SQL untuk 10 tabel inti PostgreSQL (`users`, `murojaah_sessions`, `murojaah_evaluations`, `ayah_memory_states`, `mutabaah_logs`, `tajwid_modules`, `tajwid_quizzes`, `quiz_questions`, `quiz_options`, `user_quiz_attempts`).
- [ ] Menyiapkan koneksi pool database PostgreSQL dengan driver `pgx/v5` dan koneksi Redis client `go-redis/v9`.
- [ ] Membuat file `docker-compose.yml` untuk PostgreSQL 16 dan Redis 7.2 pada port default.

### Tahap 2: Layanan Inti, Auth, Caching & Tajwid API (Jam 02:00 – 10:00)
- [ ] Implementasi autentikasi JWT:
  - [ ] Endpoint `POST /api/v1/auth/register` (hashing Bcrypt salt 12).
  - [ ] Endpoint `POST /api/v1/auth/login` (penerbitan token JWT access & refresh).
  - [ ] Endpoint `GET /api/v1/auth/me` (middleware verifikasi Bearer token).
- [ ] Integrasi EQuran.id API v2 Proxy dengan Cache Redis:
  - [ ] Endpoint `GET /api/v1/quran/surahs` (cache TTL 7 hari).
  - [ ] Endpoint `GET /api/v1/quran/surahs/{number}` (cache surah & audio qari).
- [ ] Modul Tajwid Academy & Kuis:
  - [ ] Endpoint `GET /api/v1/tajwid/modules` (daftar materi berurutan).
  - [ ] Endpoint `GET /api/v1/tajwid/modules/{slug}` (materi markdown & YouTube ID).
  - [ ] Endpoint `POST /api/v1/tajwid/quizzes/{quizId}/submit` (validasi jawaban & generate review penjelasan).
  - [ ] Menyiapkan *seed data* materi Tajwid (Nun Sukun & Tanwin, Mim Sukun, Mad Asli/Thabi'i) lengkap beserta soal & pembahasan.

### Tahap 3: Integrasi Whisper AI Voice & Algoritma SRS (Jam 10:00 – 17:00)
- [ ] Membangun mikroservis Python AI Worker (`services/ai-worker/`):
  - [ ] Setup virtual environment dan download model `whisper-base-ar-quran` (atau quantised INT8).
  - [ ] Implementasi fungsi Voice Activity Detection (VAD) menggunakan `webrtcvad` / `silero-vad` untuk pemangkasan jeda hening.
  - [ ] Implementasi normalisasi teks Arab (penghapusan harakat, tanda waqaf, penyelarasan alif/hamzah).
  - [ ] Implementasi fungsi Levenshtein distance tingkat kata (`word_alignment`) untuk mendeteksi substitusi, delesi, dan insersi kata.
- [ ] Integrasi Audio Endpoint di Go:
  - [ ] Endpoint `POST /api/v1/murojaah/session/start`.
  - [ ] Endpoint `POST /api/v1/murojaah/evaluate` menerima `multipart/form-data` audio 16 kHz WAV mono, meneruskan ke Python worker via internal HTTP/gRPC, dan mengembalikan skor $1 - (S+D+I)/N$.
  - [ ] Memastikan audio biner dihapus dari memory/disk setelah proses inferensi selesai (prinsip privasi & efisiensi disk).
- [ ] Implementasi Spaced Repetition System (SRS SuperMemo-2):
  - [ ] Logika pemetaan skor AI (0-100) ke skala kualitas ingatan (0-5).
  - [ ] Penghitungan Ease Factor ($EF$) dan interval hari ($1 \rightarrow 3 \rightarrow 7 \rightarrow 14 \rightarrow 30$ hari).
  - [ ] Endpoint `GET /api/v1/srs/today` (daftar ayat yang jatuh tempo review hari ini).

### Tahap 4: Mutabaah Analytics & Stabilisasi Docker (Jam 17:00 – 21:00)
- [ ] Modul Mutabaah & Analitik:
  - [ ] Endpoint `GET /api/v1/mutabaah/summary` (streak harian, capaian target ayat, riwayat mingguan).
  - [ ] Endpoint `GET /api/v1/mutabaah/heatmap/{surahNumber}` (status kekuatan hafalan per ayat).
- [ ] Menghubungkan seluruh kontainer (Go Backend, Python AI, PostgreSQL, Redis) dalam satu jaringan `docker-compose`.
- [ ] Kalibrasi ambang batas skor suara (WER toleransi aksen santri pemula).
- [ ] Pengujian beban performa endpoint evaluasi suara (target latensi $\le 3$ detik per ayat).

### Tahap 5: Dokumentasi Final, Data Uji & Live Demo (Jam 21:00 – 24:00)
- [ ] Pengecekan akhir seluruh respon HTTP status code dan penanganan error Bahasa Indonesia.
- [ ] Menyiapkan akun demo juri dengan histori streak 5 hari dan data murojaah realistis.
- [ ] Pembuatan berkas pengujian API (Postman / Bruno Collection / cURL script).
- [ ] Standby mendukung live pitching dan demonstrasi bersama tim Frontend.

---

## 2. Riwayat Tugas Selesai (Completed Log)

* [x] **2026-10-31**: Finalisasi arsitektur sistem, skema database ERD PostgreSQL, struktur Redis Caching, dan penandatanganan kontrak API bersama tim Frontend di [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md).

