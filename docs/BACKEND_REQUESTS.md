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

* [ ] **REQ-BE-07: Endpoint Mutabaah Calendar Heatmap Bulanan (`GET /api/v1/mutabaah/calendar?year=YYYY&month=MM`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam 00:25)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Mendukung kalender aktivitas Mutabaah Yaumi bergaya GitHub Contribution Heatmap per bulan. UI membutuhkan agregasi seluruh hari dalam bulan yang diminta untuk menentukan intensitas warna hijau (0-4) dan ringkasan bulanan.
  * **Usulan Endpoint**: `GET /api/v1/mutabaah/calendar?year=2026&month=10`
  * **Headers**: `Authorization: Bearer <jwt_token>`
  * **Format Respons yang Diharapkan**:
    ```json
    {
      "year": 2026,
      "month": 10,
      "monthName": "Oktober",
      "totalAyahsMonth": 185,
      "activeDaysCount": 18,
      "averageScoreMonth": 94.8,
      "targetMetDaysCount": 16,
      "days": {
        "2026-10-31": {
          "date": "2026-10-31",
          "ayahsReviewed": 15,
          "targetAchieved": true,
          "averageScore": 96.5,
          "durationMinutes": 20,
          "reportsCount": 2
        }
      }
    }
    ```
  * **Status**: Menunggu Dikerjakan oleh Backend Engineer

* [ ] **REQ-BE-08: Endpoint Detail Riwayat Laporan Mutabaah Harian (`GET /api/v1/mutabaah/logs?date=YYYY-MM-DD`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam 00:25)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Saat santri mengklik salah satu sel tanggal di GitHub calendar mutabaah, modal informasi riwayat laporan setoran akan menampilkan daftar sesi hafalan yang dilaporkan pada tanggal tersebut.
  * **Usulan Endpoint**: `GET /api/v1/mutabaah/logs?date=2026-10-31`
  * **Headers**: `Authorization: Bearer <jwt_token>`
  * **Format Respons yang Diharapkan**:
    ```json
    {
      "date": "2026-10-31",
      "ayahsReviewed": 15,
      "targetAchieved": true,
      "averageScore": 96.5,
      "durationMinutes": 20,
      "reports": [
        {
          "id": "log-uuid-1",
          "time": "05:30 WIB",
          "surahNumber": 78,
          "surahName": "An-Naba'",
          "ayahStart": 1,
          "ayahEnd": 10,
          "totalAyahs": 10,
          "score": 98.0,
          "type": "murojaah_ai",
          "verifier": "Hifzhly AI Voice Evaluator",
          "notes": "Kelancaran makhraj dan harakat tervalidasi AI Levenshtein."
        }
      ]
    }
    ```
  * **Status**: Menunggu Dikerjakan oleh Backend Engineer

* [ ] **REQ-BE-09: Endpoint Pencatatan Setoran Mutabaah Baru (`POST /api/v1/mutabaah/logs`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam 00:25)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Form "Catat Setoran Baru" di halaman Mutabaah memungkinkan santri mencatat setoran hafalan offline dengan ustadz atau tilawah mandiri ke database PostgreSQL `mutabaah_logs`.
  * **Usulan Endpoint**: `POST /api/v1/mutabaah/logs`
  * **Headers**: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`
  * **Payload Request**:
    ```json
    {
      "date": "2026-10-31",
      "surahNumber": 78,
      "ayahStart": 1,
      "ayahEnd": 10,
      "score": 95.0,
      "durationMinutes": 15,
      "type": "setoran_mandiri",
      "verifier": "Ustadz Ahmad, Lc.",
      "notes": "Bacaan lancar, mad thabi'i konsisten 2 harakat."
    }
    ```
  * **Format Respons yang Diharapkan**:
    ```json
    {
      "status": "success",
      "message": "Laporan mutabaah berhasil disimpan",
      "logId": "new-uuid-1234"
    }
    ```
  * **Status**: Menunggu Dikerjakan oleh Backend Engineer


---

* [ ] **REQ-BE-07: Endpoint Auto-Logging Mutabaah dari Exit Modal (`POST /api/v1/mutabaah/log`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Modal konfirmasi sebelum keluar dari Tilawah/Hafalan/Murojaah mengirimkan data aktivitas yang sudah ter-record otomatis beserta catatan opsional santri.
  * **Payload Request**:
    ```json
    {
      "activityType": "tilawah",
      "surahNumber": 2,
      "surahName": "Al-Baqarah",
      "startAyah": 142,
      "endAyah": 160,
      "totalAyahs": 19,
      "pagesCount": 2,
      "durationSeconds": 480,
      "score": 92.5,
      "santriNotes": "Ayat 155 makhraj 'ain masih perlu dilancarkan"
    }
    ```
  * **Status**: Menunggu Dikerjakan Backend

* [ ] **REQ-BE-08: Endpoint Riwayat Timeline Jurnal Mutabaah & Catatan (`GET /api/v1/mutabaah/history`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Halaman Mutabaah santri menampilkan log riwayat aktivitas lengkap dengan catatan santri dan catatan evaluasi ustadz.
  * **Status**: Menunggu Dikerjakan Backend

* [ ] **REQ-BE-09: Endpoint Target & Komitmen Mandiri Santri (`GET` & `PUT /api/v1/mutabaah/targets`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Mengambil dan menyimpan pengaturan target hafalan/tilawah mandiri santri (surat pilihan, rentang ayat, target lembar/hari).
  * **Status**: Menunggu Dikerjakan Backend

* [ ] **REQ-BE-10: Endpoint Monitoring & Evaluasi Musyrif/Ustadz (`GET /api/v1/admin/mutabaah/monitoring` & `POST /api/v1/admin/mutabaah/:id/evaluation`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Frontend Team (Faeyza)
  * **Latar Belakang / Kebutuhan UI**: Dashboard admin/musyrif untuk melihat rekap live kepatuhan seluruh santri dan mengirimkan feedback evaluasi ustadz.
  * **Status**: Menunggu Dikerjakan Backend

## Riwayat Permintaan Selesai (Archive)

* [x] **REQ-BE-01: Penyediaan Mock Payload Evaluasi Suara Murojaah untuk Pengujian Tampilan Kata**
  * Tanggal Diminta: 2026-10-31 (Jam 01:00)
  * Tanggal Selesai: 2026-10-31 (Jam 01:30)
  * Diminta Oleh: Frontend Team
  * Diselesaikan Oleh: Backend Team (Firdy)
  * Implementasi: Menambahkan contoh mock data JSON lengkap dengan array `wordDiff` (status `correct` dan `substituted`) pada Bagian 5 dokumen [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md) sehingga Frontend dapat langsung mengembangkan komponen penyorotan teks Arab.
  * Status: [x] SELESAI
