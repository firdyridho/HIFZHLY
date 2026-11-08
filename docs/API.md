# API - Kontrak Integrasi dan Spesifikasi Endpoint

| Atribut | Keterangan |
| :--- | :--- |
| **Nama Sistem** | Hifzhly REST API & AI Gateway |
| **Versi Dokumen** | 1.0 (Kontrak Terpadu REST API, AI Voice, SRS & Kuis) |
| **Status** | Aktif / Hackathon FIFA 24 Jam |
| **Tanggal Pembaruan** | 2026-10-31 |
| **Dokumen Terkait** | [`PRD.md`](./PRD.md) / [`ERD.md`](./ERD.md) / [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md) |

---

## 1. Lingkungan Endpoint dan Base URL

| Lingkungan | Protokol Base URL | Lokasi Hosting |
| :--- | :--- | :--- |
| **Lokal (Dev)** | `http://localhost:8080/api/v1` | Mesin Lokal Developer |
| **Staging / VPS** | `https://hifzhly-api.fifa.my.id/api/v1` | Server Linux VPS Docker Compose |
| **Produksi Demo** | `https://api.hifzhly.id/api/v1` | Domain Produksi Evaluasi Juri |

---

## 2. Modul Autentikasi Pengguna

### 2.1 Registrasi Pengguna Baru
* **Endpoint**: `POST /auth/register`
* **Deskripsi**: Mendaftarkan akun penghafal baru.
* **Autentikasi**: Tidak diperlukan (Publik).
* **Request Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "ahmad@example.com",
  "username": "ahmad_hifzh",
  "fullName": "Ahmad Al-Hafizh",
  "password": "PasswordKuat123!",
  "dailyTargetAyahs": 10
}
```
* **Response `201 Created`**:
```json
{
  "message": "Registrasi berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "7a3e78b2-5f61-419b-81d3-61b69e382d1c",
    "email": "ahmad@example.com",
    "username": "ahmad_hifzh",
    "fullName": "Ahmad Al-Hafizh",
    "dailyTargetAyahs": 10,
    "currentStreak": 0,
    "maxStreak": 0
  }
}
```

### 2.2 Login Akun
* **Endpoint**: `POST /auth/login`
* **Deskripsi**: Autentikasi akun dan penerbitan token JWT.
* **Autentikasi**: Tidak diperlukan.
* **Request Body**:
```json
{
  "usernameOrEmail": "ahmad_hifzh",
  "password": "PasswordKuat123!"
}
```
* **Response `200 OK`**:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "7a3e78b2-5f61-419b-81d3-61b69e382d1c",
    "email": "ahmad@example.com",
    "username": "ahmad_hifzh",
    "fullName": "Ahmad Al-Hafizh",
    "dailyTargetAyahs": 10,
    "currentStreak": 3,
    "maxStreak": 7
  }
}
```

### 2.3 Profil Pengguna Aktif
* **Endpoint**: `GET /auth/me`
* **Autentikasi**: Bearer Token JWT.
* **Response `200 OK`**:
```json
{
  "id": "7a3e78b2-5f61-419b-81d3-61b69e382d1c",
  "email": "ahmad@example.com",
  "username": "ahmad_hifzh",
  "fullName": "Ahmad Al-Hafizh",
  "dailyTargetAyahs": 10,
  "currentStreak": 3,
  "maxStreak": 7
}
```

---

## 3. Modul Al-Qur'an & Mushaf Proxy (EQuran.id Integration)

Backend Go melakukan caching otomatis terhadap respons API EQuran.id ke dalam Redis selama 7 hari guna memangkas latensi menjadi $< 50\text{ ms}$.

### 3.1 Daftar Seluruh Surah
* **Endpoint**: `GET /quran/surahs`
* **Autentikasi**: Opsional.
* **Response `200 OK`**:
```json
[
  {
    "number": 78,
    "nameArabic": "النبإ",
    "nameLatin": "An-Naba'",
    "numberOfAyahs": 40,
    "revelationType": "Makkiyyah",
    "translation": "Berita Besar"
  },
  {
    "number": 79,
    "nameArabic": "النازعات",
    "nameLatin": "An-Nazi'at",
    "numberOfAyahs": 46,
    "revelationType": "Makkiyyah",
    "translation": "Malaikat Yang Mencabut"
  }
]
```

### 3.2 Detail Surah Lengkap Beserta Teks Ayat
* **Endpoint**: `GET /quran/surahs/{number}`
* **Parameter**: `number` (integer 1-114).
* **Response `200 OK`**:
```json
{
  "number": 78,
  "nameArabic": "النبإ",
  "nameLatin": "An-Naba'",
  "numberOfAyahs": 40,
  "revelationType": "Makkiyyah",
  "translation": "Berita Besar",
  "audioFull": "https://equran.nos.wjv-1.neo.id/audio-full/Misyari-Rasyid-Al-Afasi/078.mp3",
  "ayahs": [
    {
      "ayahNumber": 1,
      "textArabic": "عَمَّ يَتَسَآءَلُونَ",
      "textLatin": "'Amma yatasaa'aluun",
      "translation": "Tentang apakah mereka saling bertanya-tanya?",
      "audioUrl": "https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078001.mp3",
      "mutashabihat": []
    },
    {
      "ayahNumber": 4,
      "textArabic": "كَلَّا سَيَعْلَمُونَ",
      "textLatin": "Kallaa saya'lamuun",
      "translation": "Sekali-kali tidak! Kelak mereka akan mengetahui,",
      "audioUrl": "https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/078004.mp3",
      "mutashabihat": [
        {
          "surahNumber": 78,
          "surahName": "An-Naba'",
          "ayahNumber": 5,
          "textArabic": "ثُمَّ كَلَّا سَيَعْلَمُونَ",
          "similarity": "Penekanan Berulang (Tawkid)",
          "note": "Ayat 4 diawali 'كَلَّا', sedangkan ayat 5 ada tambahan 'ثُمَّ'."
        }
      ]
    }
  ]
}
```

---

## 4. Modul Smart Murojaah & AI Voice Evaluator

### 4.1 Memulai Sesi Murojaah Baru
* **Endpoint**: `POST /murojaah/session/start`
* **Autentikasi**: Wajib (Bearer Token).
* **Request Body**:
```json
{
  "surahNumber": 78
}
```
* **Response `201 Created`**:
```json
{
  "sessionId": "4b92b6a8-2083-4927-b08e-5eb89e6da801",
  "surahNumber": 78,
  "status": "in_progress",
  "startedAt": "2026-10-31T09:15:00Z"
}
```

### 4.2 Evaluasi Suara Bacaan Per Ayat (AI Voice Inference)
* **Endpoint**: `POST /murojaah/evaluate`
* **Deskripsi**: Mengunggah rekaman suara audio per ayat. Backend meneruskan audio ke Python Whisper Worker, menghitung penyejajaran Levenshtein kata demi kata, memperbarui status kurva memori SRS, dan mengembalikan hasil analisis rinci.
* **Autentikasi**: Wajib (Bearer Token).
* **Content-Type**: `multipart/form-data`
* **Form Parameters**:
  - `audio`: Berkas audio biner (WAV/WebM, 16 kHz Mono).
  - `sessionId`: `4b92b6a8-2083-4927-b08e-5eb89e6da801` (string UUID).
  - `surahNumber`: `78` (integer).
  - `ayahNumber`: `1` (integer).
* **Response `200 OK`**:
```json
{
  "evaluationId": "c9a29e4d-7f12-4c28-910a-31a89b0d87fa",
  "surahNumber": 78,
  "ayahNumber": 1,
  "score": 85.0,
  "transcribedText": "عَمَّ يَتَسَاءَلُ",
  "referenceText": "عَمَّ يَتَسَآءَلُونَ",
  "audioDurationMs": 2850,
  "substitutions": 1,
  "deletions": 0,
  "insertions": 0,
  "wordDiff": [
    {
      "index": 0,
      "word": "عَمَّ",
      "status": "correct",
      "userSaid": "عَمَّ"
    },
    {
      "index": 1,
      "word": "يَتَسَآءَلُونَ",
      "status": "substituted",
      "userSaid": "يَتَسَاءَلُ",
      "mistakeType": "mad_or_ending"
    }
  ],
  "srsUpdate": {
    "qualityRating": 4,
    "repetitionCount": 2,
    "intervalDays": 3,
    "easeFactor": 2.5,
    "nextReviewAt": "2026-11-03"
  }
}
```

### 4.3 Menyelesaikan Sesi Murojaah
* **Endpoint**: `POST /murojaah/session/{sessionId}/finish`
* **Autentikasi**: Wajib (Bearer Token).
* **Response `200 OK`**:
```json
{
  "sessionId": "4b92b6a8-2083-4927-b08e-5eb89e6da801",
  "status": "completed",
  "totalAyahs": 10,
  "avgScore": 88.5,
  "durationSeconds": 310,
  "finishedAt": "2026-10-31T09:20:10Z"
}
```

---

## 5. Modul Adaptive Spaced Repetition (SRS)

### 5.1 Daftar Ayat Jatuh Tempo Hari Ini (Due Ayahs)
* **Endpoint**: `GET /srs/today`
* **Autentikasi**: Wajib (Bearer Token).
* **Deskripsi**: Mengambil daftar ayat yang jadwal pengulangannya jatuh pada hari ini atau hari sebelumnya yang terlewat.
* **Response `200 OK`**:
```json
{
  "totalDue": 2,
  "items": [
    {
      "surahNumber": 78,
      "surahName": "An-Naba'",
      "ayahNumber": 1,
      "repetitionCount": 1,
      "intervalDays": 1,
      "lastScore": 65.0,
      "qualityRating": 2,
      "nextReviewAt": "2026-10-31"
    },
    {
      "surahNumber": 78,
      "surahName": "An-Naba'",
      "ayahNumber": 5,
      "repetitionCount": 3,
      "intervalDays": 7,
      "lastScore": 90.0,
      "qualityRating": 4,
      "nextReviewAt": "2026-10-31"
    }
  ]
}
```

---

## 6. Modul Tajwid Academy & Kuis Evaluasi

### 6.1 Daftar Modul Belajar Tajwid
* **Endpoint**: `GET /tajwid/modules`
* **Autentikasi**: Opsional.
* **Response `200 OK`**:
```json
[
  {
    "id": "1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21",
    "title": "Hukum Nun Sukun dan Tanwin",
    "slug": "hukum-nun-sukun-dan-tanwin",
    "summary": "Mempelajari 4 kaidah hukum: Idzhar Halqi, Idgham, Ikhfa Haqiqi, dan Iqlab.",
    "youtubeVideoId": "7kK84x4_uY8",
    "orderIndex": 1
  },
  {
    "id": "2e9c6b15-0537-58c9-c5c4-e3b04aa8fa32",
    "title": "Hukum Mim Sukun",
    "slug": "hukum-mim-sukun",
    "summary": "Mempelajari kaidah Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.",
    "youtubeVideoId": "W2b8G4kK9x1",
    "orderIndex": 2
  }
]
```

### 6.2 Detail Materi Modul & Kuis
* **Endpoint**: `GET /tajwid/modules/{slug}`
* **Parameter**: `slug` (string slug materi).
* **Response `200 OK`**:
```json
{
  "id": "1d8b5a04-9426-47b8-b4b3-d2a93ff7ef21",
  "title": "Hukum Nun Sukun dan Tanwin",
  "slug": "hukum-nun-sukun-dan-tanwin",
  "summary": "Mempelajari 4 kaidah hukum: Idzhar Halqi, Idgham, Ikhfa Haqiqi, dan Iqlab.",
  "contentBody": "# Hukum Nun Sukun (نْ) dan Tanwin (ـًـٍـٌ)\n\nNun sukun atau tanwin apabila bertemu dengan huruf hijaiyah memiliki 4 hukum bacaan...",
  "youtubeVideoId": "7kK84x4_uY8",
  "quiz": {
    "id": "8f1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    "title": "Kuis Evaluasi Nun Sukun & Tanwin",
    "description": "Jawablah 5 soal pilihan ganda berikut untuk menguji pemahaman kaidah tajwid Anda.",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1-uuid-001",
        "questionText": "Jika nun sukun (نْ) bertemu dengan huruf Ba (ب), hukum bacaannya adalah...",
        "audioSampleUrl": null,
        "orderIndex": 1,
        "options": [
          { "id": "opt-1", "optionText": "Idzhar Halqi" },
          { "id": "opt-2", "optionText": "Iqlab" },
          { "id": "opt-3", "optionText": "Ikhfa Haqiqi" },
          { "id": "opt-4", "optionText": "Idgham Bighunnah" }
        ]
      }
    ]
  }
}
```

### 6.3 Mengirimkan Jawaban Kuis (Submit Quiz Attempt)
* **Endpoint**: `POST /tajwid/quizzes/{quizId}/submit`
* **Autentikasi**: Wajib (Bearer Token).
* **Request Body**:
```json
{
  "answers": [
    {
      "questionId": "q1-uuid-001",
      "selectedOptionId": "opt-2"
    }
  ]
}
```
* **Response `200 OK` (Layar Review Pembahasan)**:
```json
{
  "attemptId": "e2a91f5c-8d34-4b6a-912c-56789abcdef0",
  "score": 100.0,
  "totalQuestions": 1,
  "correctAnswers": 1,
  "passed": true,
  "passingScore": 70,
  "completedAt": "2026-10-31T09:25:00Z",
  "review": [
    {
      "questionId": "q1-uuid-001",
      "questionText": "Jika nun sukun (نْ) bertemu dengan huruf Ba (ب), hukum bacaannya adalah...",
      "selectedOptionId": "opt-2",
      "correctOptionId": "opt-2",
      "isCorrect": true,
      "explanation": "Benar! Apabila nun sukun atau tanwin bertemu huruf Ba (ب), maka dibaca Iqlab, yaitu bunyi nun/tanwin diganti menjadi bunyi mim (م) disertai ghunnah (berdengung)."
    }
  ]
}
```

---

## 7. Modul Mutabaah & Analitik Hafalan

### 7.1 Ringkasan Mutabaah & Streak Pengguna
* **Endpoint**: `GET /mutabaah/summary`
* **Autentikasi**: Wajib (Bearer Token).
* **Response `200 OK`**:
```json
{
  "currentStreak": 3,
  "maxStreak": 7,
  "todayReviewedAyahs": 10,
  "dailyTarget": 10,
  "targetMetToday": true,
  "totalAyahsMemorized": 40,
  "weeklyActivity": [
    { "date": "2026-10-25", "ayahs": 12, "targetMet": true },
    { "date": "2026-10-26", "ayahs": 10, "targetMet": true },
    { "date": "2026-10-27", "ayahs": 0, "targetMet": false },
    { "date": "2026-10-28", "ayahs": 10, "targetMet": true },
    { "date": "2026-10-29", "ayahs": 15, "targetMet": true },
    { "date": "2026-10-30", "ayahs": 10, "targetMet": true },
    { "date": "2026-10-31", "ayahs": 10, "targetMet": true }
  ]
}
```

### 7.2 Peta Visual Retensi Ayat (Surah Heatmap)
* **Endpoint**: `GET /mutabaah/heatmap/{surahNumber}`
* **Parameter**: `surahNumber` (integer).
* **Response `200 OK`**:
```json
{
  "surahNumber": 78,
  "surahName": "An-Naba'",
  "totalAyahs": 40,
  "ayahs": [
    { "ayahNumber": 1, "status": "strong", "lastScore": 95.0, "intervalDays": 14 },
    { "ayahNumber": 2, "status": "reviewing", "lastScore": 80.0, "intervalDays": 3 },
    { "ayahNumber": 3, "status": "weak", "lastScore": 60.0, "intervalDays": 1 }
  ]
}
```
*(Status: `strong` = interval $> 7$ hari / skor $\ge 85$, `reviewing` = interval 3-7 hari, `weak` = interval 1 hari / skor $< 70$, `untested` = belum pernah dievaluasi).*

