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
- [x] Inisialisasi modul Go (`go mod init hifzhly-backend`) dan setup struktur folder Clean Architecture (`cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`, `pkg/`).
- [x] Menulis file migrasi SQL untuk 10 tabel inti PostgreSQL (`users`, `murojaah_sessions`, `murojaah_evaluations`, `ayah_memory_states`, `mutabaah_logs`, `tajwid_modules`, `tajwid_quizzes`, `quiz_questions`, `quiz_options`, `user_quiz_attempts`).
- [x] Menyiapkan koneksi pool database PostgreSQL dengan driver `pgx/v5` dan koneksi Redis client `go-redis/v9`.
- [x] Membuat file `docker-compose.yml` untuk PostgreSQL 16 dan Redis 7.2 pada port default.

### Tahap 2: Layanan Inti, Auth, Caching & Tajwid API (Jam 02:00 – 10:00)
- [x] Implementasi autentikasi JWT:
  - [x] Endpoint `POST /api/v1/auth/register` (hashing Bcrypt salt 12).
  - [x] Endpoint `POST /api/v1/auth/login` (penerbitan token JWT access & refresh).
  - [x] Endpoint `GET /api/v1/auth/me` (middleware verifikasi Bearer token).
- [x] Integrasi EQuran.id API v2 Proxy dengan Cache Redis:
  - [x] Endpoint `GET /api/v1/quran/surahs` (cache TTL 7 hari).
  - [x] Endpoint `GET /api/v1/quran/surahs/{number}` (cache surah & audio qari).
- [x] Integrasi Data Mutasyabihat (Standar Tarteel QUL - Quranic Universal Library):
  - [x] Endpoint `GET /api/v1/quran/mutashabihat/{surah}/{ayah}` (pemetaan ayat-ayat serupa & catatan perbedaan).
- [x] Modul Tajwid Academy & Kuis:
  - [x] Endpoint `GET /api/v1/tajwid/modules` (daftar materi berurutan).
  - [x] Endpoint `GET /api/v1/tajwid/modules/{slug}` (materi markdown & YouTube ID).
  - [x] Endpoint `POST /api/v1/tajwid/quizzes/{quizId}/submit` (validasi jawaban & generate review penjelasan).
  - [x] Menyiapkan *seed data* migrasi SQL materi Tajwid (Nun Sukun & Tanwin, Mim Sukun).

### Tahap 3: Integrasi Whisper AI Voice & Algoritma SRS (Jam 10:00 – 17:00)
- [x] Implementasi Normalisasi Teks Arab di Go:
  - [x] Penghapusan harakat/tashkeel, tanda waqaf, dan penyelarasan alif/hamzah (أ, إ, آ, ٱ $\rightarrow$ ا) serta ta marbuthah.
- [x] Implementasi Algoritma Penyejajaran Kata Levenshtein di Go:
  - [x] Deteksi substitusi, delesi, dan insersi kata ($S, D, I$).
  - [x] Formula penskoran proposal: $\text{Skor} = \max(0, 1 - (S+D+I)/N) \times 100$.
  - [x] Lulus pengujian unit test di `internal/evaluator/levenshtein_test.go`.
- [x] Implementasi Spaced Repetition System (SRS SuperMemo-2) di Go:
  - [x] Logika pemetaan skor AI (0-100) ke skala kualitas ingatan (0-5).
  - [x] Penghitungan Ease Factor ($EF$) adaptif dan interval hari ($1 \rightarrow 3 \rightarrow 7 \rightarrow 14 \rightarrow 30$ hari).
  - [x] Endpoint `GET /api/v1/srs/today` (daftar ayat yang jatuh tempo review hari ini).
- [x] Endpoint Evaluasi Murojaah Aktif:
  - [x] Endpoint `POST /api/v1/murojaah/evaluate` (menerima teks/audio, melakukan pencocokan Levenshtein terhadap ayat resmi, dan memperbarui SRS).
- [ ] Integrasi model audio speech-to-text (Whisper/Hugging Face/Groq API) untuk pipeline input suara langsung.

---

## 2. Riwayat Tugas Selesai (Completed Log)

* [x] **2026-10-31 (01:00)**: Finalisasi arsitektur sistem, skema database ERD PostgreSQL, struktur Redis Caching, dan penandatanganan kontrak API bersama tim Frontend di [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md).
* [x] **2026-10-31 (02:30)**: Pembangunan modul database PostgreSQL pool (`pgxpool`) dan Redis client dengan mekanisme fallback offline.
* [x] **2026-10-31 (03:15)**: Implementasi lengkap autentikasi pengguna (Bcrypt + JWT) dengan middleware proteksi rute di Go.
* [x] **2026-10-31 (04:00)**: Implementasi mesin normalisasi Arab dan penyejajaran kata Levenshtein (lulus unit test 100%).
* [x] **2026-10-31 (04:30)**: Integrasi algoritma Spaced Repetition (SRS SuperMemo-2) dan endpoint `POST /api/v1/murojaah/evaluate`.
* [x] **2026-10-31 (05:00)**: Integrasi pengayaan data Ayat Mutasyabihat mengadopsi standar Tarteel QUL (Quranic Universal Library) pada endpoint `/api/v1/quran/mutashabihat/{surah}/{ayah}`.

