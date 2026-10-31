# ERD - Model Data Relasional dan In-Memory Storage

| Atribut | Keterangan |
| :--- | :--- |
| **Nama Sistem** | Hifzhly Multi-Tier Storage Architecture |
| **Versi Dokumen** | 1.0 (Arsitektur Database Relasional, Cache & Local Storage) |
| **Status** | Aktif / Hackathon FIFA 24 Jam |
| **Tanggal Pembaruan** | 2026-10-31 |
| **Dokumen Terkait** | [`PRD.md`](./PRD.md) / [`API.md`](./API.md) / [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md) |

---

## 1. Diagram Relasi Entitas (ERD Mermaid)

Sistem penyimpanan data Hifzhly mengadopsi model **Hybrid Multi-Tier Storage**:
1. **Tier Relasional (PostgreSQL 16)**: Menjamin integritas ACID untuk identitas pengguna, status ingatan kurva lupa (SRS), riwayat evaluasi kata demi kata, serta bank soal modul tajwid.
2. **Tier In-Memory (Redis 7.2)**: Mengakselerasi pembacaan teks Al-Qur'an (caching ayat & surah EQuran.id), pengelolaan JWT blacklist/token sesi, serta antrean pemrosesan komputasi AI suara.
3. **Tier Klien (Browser LocalStorage)**: Caching sementara preferensi antarmuka (qari favorit, ukuran font mushaf, draft audio perekaman offline).

```mermaid
erDiagram
    USERS ||--o{ MUROJAAH_SESSIONS : "melakukan"
    USERS ||--o{ AYAH_MEMORY_STATES : "memiliki status retensi"
    USERS ||--o{ USER_QUIZ_ATTEMPTS : "mengerjakan kuis"
    USERS ||--o{ MUTABAAH_LOGS : "mencatat konsistensi"

    MUROJAAH_SESSIONS ||--o{ MUROJAAH_EVALUATIONS : "terdiri dari evaluasi ayat"

    TAJWID_MODULES ||--o| TAJWID_QUIZZES : "memiliki evaluasi akhir"
    TAJWID_QUIZZES ||--o{ QUIZ_QUESTIONS : "memiliki butir pertanyaan"
    QUIZ_QUESTIONS ||--o{ QUIZ_OPTIONS : "memiliki pilihan jawaban"
    TAJWID_QUIZZES ||--o{ USER_QUIZ_ATTEMPTS : "dievaluasi melalui"

    USERS {
        uuid id PK "Identitas unik pengguna (UUID v4)"
        string email UK "Alamat email unik akun"
        string username UK "Username unik pengguna"
        string full_name "Nama lengkap pengguna"
        string password_hash "Bcrypt hash password aman"
        string role "Peran akun (user / admin)"
        int daily_target_ayahs "Target murojaah ayat per hari (default: 10)"
        int current_streak "Jumlah hari berturut-turut murojaah"
        int max_streak "Rekor streak tertinggi"
        datetime created_at "Waktu pendaftaran akun"
        datetime updated_at "Waktu pembaruan akun"
    }

    MUROJAAH_SESSIONS {
        uuid id PK "Identitas unik sesi murojaah"
        uuid user_id FK "Relasi ke tabel users"
        int surah_number "Nomor surah yang dimurojaah (1-114)"
        int total_ayahs "Jumlah ayat yang dilafalkan dalam sesi"
        float avg_score "Rata-rata skor kelancaran sesi (0-100)"
        string status "Status sesi (in_progress, completed, abandoned)"
        datetime started_at "Waktu mulai sesi murojaah"
        datetime finished_at "Waktu penyelesaian sesi"
    }

    MUROJAAH_EVALUATIONS {
        uuid id PK "Identitas unik rekaman evaluasi ayat"
        uuid session_id FK "Relasi ke tabel murojaah_sessions"
        uuid user_id FK "Relasi ke tabel users"
        int surah_number "Nomor surah Al-Qur'an (1-114)"
        int ayah_number "Nomor ayat pada surah tersebut"
        int audio_duration_ms "Durasi audio suara dalam milidetik"
        text transcribed_text "Hasil transkripsi teks Arab dari Whisper"
        text reference_text "Teks ayat resmi referensi dari Kemenag"
        float score "Skor ketepatan bacaan (0.00 - 100.00)"
        int substitutions "Jumlah kata tertukar/salah dilafalkan"
        int deletions "Jumlah kata yang terlewat/hilang"
        int insertions "Jumlah kata berlebih/pengulangan liar"
        jsonb word_diff_json "Array detail status tiap kata dan posisi"
        datetime created_at "Waktu rekaman dievaluasi"
    }

    AYAH_MEMORY_STATES {
        uuid id PK "Identitas status ingatan per ayat"
        uuid user_id FK "Relasi ke tabel users"
        int surah_number "Nomor surah (1-114)"
        int ayah_number "Nomor ayat"
        int repetition_count "Frekuensi pengulangan sukses (n)"
        int interval_days "Interval jeda hari berikutnya (I)"
        float ease_factor "Faktor kemudahan mengingat (EF, default 2.5)"
        float last_score "Nilai evaluasi AI terakhir (0-100)"
        int quality_rating "Peringkat kualitas memori SuperMemo (0-5)"
        date next_review_at "Tanggal ayat harus dimurojaah berikutnya"
        datetime last_reviewed_at "Waktu terakhir ayat ini dilafalkan"
    }

    MUTABAAH_LOGS {
        uuid id PK "Identitas log mutabaah harian"
        uuid user_id FK "Relasi ke tabel users"
        date log_date "Tanggal kalender aktivitas mutabaah"
        int ayahs_reviewed "Total ayat yang diselesaikan pada hari itu"
        int total_duration_minutes "Estimasi menit waktu murojaah"
        float average_score "Rata-rata skor harian"
        boolean target_achieved "Apakah mencapai target harian"
        datetime created_at "Waktu pencatatan mutabaah"
    }

    TAJWID_MODULES {
        uuid id PK "Identitas unik modul tajwid"
        string title "Judul bab materi (contoh: Hukum Nun Sukun)"
        string slug UK "URL slug unik materi tajwid"
        string summary "Ringkasan kaidah tajwid secara singkat"
        text content_body "Artikel penjelasan lengkap berformat Markdown"
        string youtube_video_id "ID video YouTube edukatif (contoh: dQw4w9WgXcQ)"
        int order_index "Urutan materi pada silabus kurikulum"
        boolean is_active "Status ketersediaan modul untuk dipelajari"
        datetime created_at "Waktu materi dipublikasikan"
        datetime updated_at "Waktu pembaruan materi"
    }

    TAJWID_QUIZZES {
        uuid id PK "Identitas kuis evaluasi materi"
        uuid module_id FK UK "Relasi satu-ke-satu ke tabel tajwid_modules"
        string title "Judul kuis (contoh: Uji Pemahaman Nun Sukun)"
        string description "Petunjuk pengerjaan dan lingkup soal"
        int passing_score "Skor kelulusan minimum (contoh: 70)"
        datetime created_at "Waktu pembuatan kuis"
        datetime updated_at "Waktu modifikasi kuis"
    }

    QUIZ_QUESTIONS {
        uuid id PK "Identitas butir pertanyaan kuis"
        uuid quiz_id FK "Relasi ke tabel tajwid_quizzes"
        text question_text "Teks pertanyaan soal kuis"
        string audio_sample_url "URL audio contoh pelafalan (opsional)"
        text explanation "Pembahasan komprehensif jawaban yang benar"
        int order_index "Nomor urut pertanyaan dalam kuis"
    }

    QUIZ_OPTIONS {
        uuid id PK "Identitas opsi pilihan ganda"
        uuid question_id FK "Relasi ke tabel quiz_questions"
        string option_text "Teks opsi jawaban"
        boolean is_correct "Indikator apakah opsi ini adalah kunci jawaban"
        string option_explanation "Penjelasan spesifik mengapa opsi ini benar/salah"
    }

    USER_QUIZ_ATTEMPTS {
        uuid id PK "Identitas riwayat pengerjaan kuis"
        uuid user_id FK "Relasi ke tabel users"
        uuid quiz_id FK "Relasi ke tabel tajwid_quizzes"
        float score "Skor akhir yang diperoleh pengguna (0-100)"
        int total_questions "Jumlah seluruh soal pada kuis"
        int correct_answers "Jumlah soal yang dijawab dengan tepat"
        jsonb answers_payload "Log rekaman jawaban pengguna per pertanyaan"
        boolean passed "Status kelulusan (skor >= passing_score)"
        datetime completed_at "Waktu selesai pengerjaan kuis"
    }
```

---

## 2. Definisi Skema Tabel Relasional (PostgreSQL DDL)

### 2.1 Tabel `users`
Menyimpan kredensial pengguna, profil, dan agregat streak murojaah.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    daily_target_ayahs INT NOT NULL DEFAULT 10,
    current_streak INT NOT NULL DEFAULT 0,
    max_streak INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### 2.2 Tabel `murojaah_sessions`
Mencatat sesi latihan murojaah pengguna per surah.

```sql
CREATE TABLE murojaah_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    total_ayahs INT NOT NULL DEFAULT 0,
    avg_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_murojaah_sessions_user_id ON murojaah_sessions(user_id);
CREATE INDEX idx_murojaah_sessions_created ON murojaah_sessions(started_at DESC);
```

### 2.3 Tabel `murojaah_evaluations`
Menyimpan hasil inferensi AI per ayat, termasuk detail error Levenshtein kata demi kata.

```sql
CREATE TABLE murojaah_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES murojaah_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number > 0),
    audio_duration_ms INT NOT NULL DEFAULT 0,
    transcribed_text TEXT NOT NULL,
    reference_text TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0.00 AND 100.00),
    substitutions INT NOT NULL DEFAULT 0,
    deletions INT NOT NULL DEFAULT 0,
    insertions INT NOT NULL DEFAULT 0,
    word_diff_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_murojaah_evaluations_session ON murojaah_evaluations(session_id);
CREATE INDEX idx_murojaah_evaluations_user_ayah ON murojaah_evaluations(user_id, surah_number, ayah_number);
```

#### Struktur Objek JSONB `word_diff_json`:
```json
[
  {
    "index": 0,
    "word": "عَمَّ",
    "status": "correct",
    "userSaid": "عَمَّ"
  },
  {
    "index": 1,
    "word": "يَتَسَآءَلُونَ",
    "status": "substituted",
    "userSaid": "يَتَسَاءَلُ",
    "mistakeType": "mad_or_ending"
  }
]
```

### 2.4 Tabel `ayah_memory_states`
Menyimpan data memori jangka panjang per ayat berdasarkan algoritma adaptif Spaced Repetition (SRS).

```sql
CREATE TABLE ayah_memory_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number > 0),
    repetition_count INT NOT NULL DEFAULT 0,
    interval_days INT NOT NULL DEFAULT 1,
    ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
    last_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    quality_rating INT NOT NULL DEFAULT 0 CHECK (quality_rating BETWEEN 0 AND 5),
    next_review_at DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_surah_ayah UNIQUE (user_id, surah_number, ayah_number)
);

CREATE INDEX idx_ayah_memory_states_review ON ayah_memory_states(user_id, next_review_at);
```

### 2.5 Tabel `mutabaah_logs`
Mencatat rekapitulasi harian konsistensi murojaah pengguna.

```sql
CREATE TABLE mutabaah_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    ayahs_reviewed INT NOT NULL DEFAULT 0,
    total_duration_minutes INT NOT NULL DEFAULT 0,
    average_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    target_achieved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_log_date UNIQUE (user_id, log_date)
);

CREATE INDEX idx_mutabaah_logs_user_date ON mutabaah_logs(user_id, log_date DESC);
```

### 2.6 Tabel `tajwid_modules` & `tajwid_quizzes`
Menyimpan materi pelajaran teori tajwid dan metadata evaluasi.

```sql
CREATE TABLE tajwid_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content_body TEXT NOT NULL,
    youtube_video_id VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tajwid_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL UNIQUE REFERENCES tajwid_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INT NOT NULL DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 Tabel `quiz_questions` & `quiz_options`
Menyimpan butir soal kuis, opsi pilihan ganda, kunci jawaban, dan pembahasan rinci.

```sql
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES tajwid_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    audio_sample_url VARCHAR(500),
    explanation TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    option_explanation TEXT
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);
```

### 2.8 Tabel `user_quiz_attempts`
Merekam hasil pengerjaan kuis pengguna beserta seluruh opsi yang dipilih untuk layar review pembahasan.

```sql
CREATE TABLE user_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES tajwid_quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    answers_payload JSONB NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_quiz_attempts_user ON user_quiz_attempts(user_id, quiz_id);
```

---

## 3. Desain Penyimpanan In-Memory (Redis 7.2)

Redis digunakan sebagai lapisan caching berperforma tinggi untuk memangkas latensi pembacaan data eksternal dan antrean tugas:

| Pola Kunci Redis | Tipe Data | TTL (Time-To-Live) | Deskripsi & Fungsi |
| :--- | :--- | :--- | :--- |
| `quran:surah:{number}` | String (JSON) | 7 Hari | Cache respons surah lengkap beserta daftar ayat dari EQuran.id. |
| `quran:surah:list` | String (JSON) | 7 Hari | Cache daftar 114 surah (nomor, nama Arab, nama Latin, jumlah ayat). |
| `auth:token:blacklist:{jti}` | String ("1") | Sesuai expired JWT | Menyimpan token JWT yang telah di-logout sebelum masa aktif habis. |
| `murojaah:eval_queue` | List (FIFO) | N/A | Antrean pemrosesan tugas audio dari Backend Go ke Python AI Worker. |
| `srs:due_today:{userId}` | Set (AyahIDs) | 1 Jam | Cache daftar ID ayat yang jatuh tempo murojaah hari ini untuk pengguna. |

---

## 4. Desain Penyimpanan Sisi Klien (Browser LocalStorage)

Untuk memastikan pengalaman pengguna tetap mulus (*smooth UX*) bahkan saat sinyal internet berfluktuasi:

| Kunci LocalStorage | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `hifzhly_auth_token` | String | JWT access token untuk otorisasi header `Authorization: Bearer <token>`. |
| `hifzhly_user_profile`| Object (JSON) | Cache ringkas data pengguna (`id`, `username`, `fullName`, `streak`). |
| `hifzhly_settings` | Object (JSON) | Pengaturan pembaca: font size mushaf, terjemahan aktif, audio speed qari. |
| `hifzhly_quiz_draft` | Object (JSON) | State sementara jawaban kuis pengguna agar tidak hilang bila tab tertutup tidak sengaja. |

