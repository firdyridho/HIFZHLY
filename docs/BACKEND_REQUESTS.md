# Kotak Masuk Permintaan ke Backend (Backend Requests Inbox)

| Atribut | Keterangan |
| :--- | :--- |
| **Dokumen** | Media Komunikasi Resmi Permintaan Fitur / Endpoint ke Backend |
| **Penulis (Pemohon)** | **Faeyza Ardellein Yaradhitya** (Frontend Developer & UI/UX) |
| **Penerima (Pelaksana)**| **Firdy Ridho Fillah** (Backend & AI Engineer) |
| **Status** | Aktif / Hackathon FIFA 24 Jam |
| **Dokumen Terkait** | [`BACKEND_TASKS.md`](./BACKEND_TASKS.md) / [`API.md`](./API.md) / [`TASKS.md`](./TASKS.md) |

---

## Panduan Penggunaan untuk Frontend Developer

> **PERINGATAN SINKRONISASI (SOP ANTI-TIMPA)**:
> Sebelum menulis permintaan baru dan sesaat sebelum melakukan push:
> 1. Wajib jalankan `git pull origin staging` terlebih dahulu.
> 2. Periksa apakah Backend baru saja merilis endpoint baru atau memperbarui skema respon di [`API.md`](./API.md).
> 3. Tulis permintaan baru menggunakan format standar di bawah.
> 4. Tarik perubahan terkini (`git pull origin staging`) tepat sebelum melakukan push!

### Format Menulis Permintaan Baru:
```markdown
* [ ] **REQ-BE-XX: [Judul Permintaan Singkat]**
  * Tanggal Diminta: YYYY-MM-DD (Jam: XX:XX)
  * Diminta Oleh: Frontend Team (Faeyza)
  * Latar Belakang / Kebutuhan UI: [Jelaskan komponen atau layar apa yang membutuhkan data ini]
  * Usulan Endpoint: [Contoh: GET /api/v1/mutabaah/history]
  * Format Request / Response yang Diharapkan: [Contoh JSON]
  * Status: Menunggu Dikerjakan
```

---

## Panduan untuk Backend Engineer

1. Periksa berkas ini secara berkala pada awal dan pertengahan setiap sesi kerja 24 jam.
2. Jika permintaan telah selesai diimplementasikan, diverifikasi, dan di-push ke branch `staging`:
   * Ubah tanda status menjadi `[x] SELESAI`.
   * Pindahkan ke bagian **Riwayat Permintaan Selesai (Archive)** di bawah.
   * Informasikan kepada Frontend Developer melalui koordinasi tim bahwa endpoint sudah siap dikonsumsi secara live.

---

## Daftar Permintaan Aktif (Active Inbox)

* [ ] **REQ-BE-02: Endpoint Mutabaah Summary & Konsistensi Streak (`GET /api/v1/mutabaah/summary`)**
  * **Tanggal Diminta**: 2026-10-31 (Jam 18:35)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Dashboard analitik mutabaah ([`MutabaahPage.tsx`](../frontend/src/pages/MutabaahPage.tsx)) membutuhkan data riil aktivitas murojaah santri tanpa data dummy.
  * **Usulan Endpoint**: `GET /api/v1/mutabaah/summary`
  * **Headers**: `Authorization: Bearer <jwt_token>`
  * **Format Respons yang Diharapkan**:
    ```json
    {
      "currentStreak": 5,
      "maxStreak": 14,
      "todayReviewedAyahs": 10,
      "dailyTarget": 10,
      "targetMetToday": true,
      "totalAyahsMemorized": 78,
      "weeklyActivity": [
        { "date": "2026-10-25", "ayahs": 12, "targetMet": true },
        { "date": "2026-10-26", "ayahs": 10, "targetMet": true },
        { "date": "2026-10-27", "ayahs": 5, "targetMet": false },
        { "date": "2026-10-28", "ayahs": 15, "targetMet": true },
        { "date": "2026-10-29", "ayahs": 10, "targetMet": true },
        { "date": "2026-10-30", "ayahs": 10, "targetMet": true },
        { "date": "2026-10-31", "ayahs": 10, "targetMet": true }
      ]
    }
    ```
  * **Status**: Menunggu Dikerjakan oleh Backend Engineer

* [ ] **REQ-BE-03: Endpoint Mutabaah Surah Heatmap Retention (`GET /api/v1/mutabaah/heatmap/{surahNumber}`)**
  * **Tanggal Diminta**: 2026-10-31 (Jam 18:35)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Visualisasi heatmap daya ingat ayat per surah (Juz 'Amma) pada tab analitik retensi.
  * **Usulan Endpoint**: `GET /api/v1/mutabaah/heatmap/{surahNumber}`
  * **Headers**: `Authorization: Bearer <jwt_token>`
  * **Format Respons yang Diharapkan**:
    ```json
    {
      "surahNumber": 78,
      "surahName": "An-Naba'",
      "retentionPercentage": 92.4,
      "status": "strong",
      "ayahs": [
        { "ayahNumber": 1, "status": "strong", "lastScore": 95, "repetitionCount": 4 },
        { "ayahNumber": 2, "status": "strong", "lastScore": 100, "repetitionCount": 5 },
        { "ayahNumber": 3, "status": "reviewing", "lastScore": 75, "repetitionCount": 2 }
      ]
    }
    ```
  * **Status**: Menunggu Dikerjakan oleh Backend Engineer

* [ ] **REQ-BE-04: Endpoint Update Target Hafalan Harian Santri (`PATCH /api/v1/auth/profile`)**
  * **Tanggal Diminta**: 2026-10-31 (Jam 18:35)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Menyimpan perubahan target harian ayat yang diatur santri melalui kartu target interaktif dashboard ke database PostgreSQL `users.daily_target_ayahs`.
  * **Usulan Endpoint**: `PATCH /api/v1/auth/profile`
  * **Headers**: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`
  * **Payload Request**:
    ```json
    {
      "dailyTargetAyahs": 15
    }
    ```
  * **Status**: Menunggu Dikerjakan oleh Backend Engineer

* [ ] **REQ-BE-05: Endpoint Jadwal Sholat Riil Dinamis (`GET /api/v1/prayer-times`)**
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Kebutuhan UI**: Dashboard Hifzhly menampilkan 5 waktu sholat harian (Shubuh, Dzuhur, Ashar, Maghrib, Isya) dan countdown waktu sholat berikutnya secara akurat.
  * **Status**: Segera Dikerjakan Backend

* [ ] **REQ-BE-06: Endpoint Kumpulan Doa & Dzikir Murojaah (`GET /api/v1/doa`)**
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Kebutuhan UI**: Modal Doa Murojaah menampilkan doa-doa sebelum/sesudah hafalan lengkap dengan teks Arab, latin, terjemahan, dan keutamaan.
  * **Status**: Segera Dikerjakan Backend

---

## Riwayat Permintaan Selesai (Archive)

* [x] **REQ-BE-01: Penyediaan Mock Payload Evaluasi Suara Murojaah untuk Pengujian Tampilan Kata**
  * Tanggal Diminta: 2026-10-31 (Jam 01:00)
  * Tanggal Selesai: 2026-10-31 (Jam 01:30)
  * Diminta Oleh: Frontend Team
  * Diselesaikan Oleh: Backend Team (Firdy)
  * Implementasi: Menambahkan contoh mock data JSON lengkap dengan array `wordDiff` (status `correct` dan `substituted`) pada Bagian 5 dokumen [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md) sehingga Frontend dapat langsung mengembangkan komponen penyorotan teks Arab.
  * Status: [x] SELESAI
