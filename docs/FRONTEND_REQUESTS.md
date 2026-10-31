# Kotak Masuk Permintaan ke Frontend (Frontend Requests Inbox)

| Atribut | Keterangan |
| :--- | :--- |
| **Dokumen** | Media Komunikasi Resmi Permintaan Pembuatan / Penyesuaian Antarmuka Web |
| **Penulis (Pemohon)** | **Firdy Ridho Fillah** (Backend & AI Engineer) |
| **Penerima (Pelaksana)**| **Faeyza Ardellein Yaradhitya** (Frontend Developer & UI/UX) |
| **Status** | Aktif / Hackathon FIFA 24 Jam |
| **Dokumen Terkait** | [`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md) / [`API.md`](./API.md) / [`TASKS.md`](./TASKS.md) |

---

## Panduan Penggunaan untuk Backend Engineer

> **PERINGATAN SINKRONISASI (SOP ANTI-TIMPA)**:
> Sebelum menulis permintaan baru dan sesaat sebelum melakukan push:
> 1. Wajib jalankan `git pull origin staging` terlebih dahulu.
> 2. Pastikan endpoint atau data yang diminta telah selesai diimplementasikan di Go/Python dan lulus uji coba lokal.
> 3. Tulis permintaan baru menggunakan format standar di bawah.
> 4. Tarik perubahan terkini (`git pull origin staging`) tepat sebelum melakukan push!

### Format Menulis Permintaan Baru:
```markdown
* [ ] **REQ-FE-XX: [Judul Permintaan Komponen UI]**
  * Tanggal Diminta: YYYY-MM-DD (Jam: XX:XX)
  * Diminta Oleh: Backend Team (Firdy)
  * Latar Belakang / Endpoint Aktif: [Sebutkan endpoint backend yang baru saja aktif]
  * Kebutuhan Tampilan: [Jelaskan elemen UI, interaksi, atau data yang harus disajikan kepada pengguna]
  * Status: Menunggu Dikerjakan
```

---

## Panduan untuk Frontend Developer

1. Periksa berkas ini secara berkala setelah Backend menyelesaikan suatu milestone endpoint.
2. Bangun komponen tampilan React, styling Tailwind CSS, dan hubungkan dengan endpoint terkait.
3. Setelah komponen aktif dan terverifikasi di peramban:
   * Ubah tanda status menjadi `[x] SELESAI`.
   * Pindahkan ke bagian **Riwayat Permintaan Selesai (Archive)** di bawah.
   * Catat pada [`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md).

---

## Daftar Permintaan Aktif (Active Inbox)

* [ ] **REQ-FE-02: Integrasi State Autentikasi Pengguna (Login & Register)**
  * Tanggal Diminta: 2026-10-31 (Jam 03:00)
  * Diminta Oleh: Backend Team (Firdy)
  * Latar Belakang / Endpoint Aktif: Endpoint backend Go untuk autentikasi telah aktif:
    - `POST /api/v1/auth/register` (body: `email`, `username`, `fullName`, `password`, `dailyTargetAyahs`)
    - `POST /api/v1/auth/login` (body: `usernameOrEmail`, `password`)
    - `GET /api/v1/auth/me` (header: `Authorization: Bearer <token>`)
  * Kebutuhan Tampilan:
    1. Modal/Form login & register di sudut kanan atas header.
    2. Simpan token JWT yang diterima ke dalam `localStorage.setItem('hifzhly_auth_token', token)`.
    3. Tampilkan nama user dan target ayat harian secara dinamis di header aplikasi.
  * Status: Menunggu Dikerjakan

* [ ] **REQ-FE-01: Implementasi Layar Review Pembahasan Kuis Pasca Submit Jawaban**
  * Tanggal Diminta: 2026-10-31 (Jam 01:45)
  * Diminta Oleh: Backend Team (Firdy)
  * Latar Belakang / Endpoint Aktif: Endpoint `POST /api/v1/tajwid/quizzes/{quizId}/submit` telah dirancang untuk mengembalikan skor, status kelulusan, dan array `review` berisi penjelasan kaidah tajwid per pertanyaan (lihat [`API.md`](./API.md) Bagian 6.3).
  * Kebutuhan Tampilan:
    1. Card rekapitulasi nilai di bagian atas (skor numerik besar, badge hijau "Lulus" jika $\ge 70$, badge kuning "Coba Lagi" jika $< 70$).
    2. Daftar review per butir soal: menampilkan teks pertanyaan, pilihan pengguna, kunci jawaban, dan kotak berlatar belakang toska lembut yang menampilkan teks `explanation`.
    3. Tombol aksi: "Ulangi Kuis" dan "Lanjut ke Modul Berikutnya".
  * Status: Menunggu Dikerjakan

---

## Riwayat Permintaan Selesai (Archive)

*Belum ada riwayat permintaan selesai.*

