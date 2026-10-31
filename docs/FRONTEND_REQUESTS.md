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

* [ ] **REQ-FE-03: STOP Penggunaan Data Dummy & Migrasi ke Endpoint Riil Backend**
  * **Tanggal Diminta**: 2026-10-31 (Jam: 18:15)
  * **Diminta Oleh**: Ketua Tim / Backend Team (Firdy)
  * **Instruksi Tegas**:
    1. **Dilarang keras menggunakan data dummy / hardcoded array statis di Frontend** (seperti `PRAYER_TIMES` hardcoded di `DashboardPage.tsx`, teks doa hardcoded di modal, atau santri list hardcoded).
    2. Jika Frontend membutuhkan data baru apapun, **WAJIB meminta endpoint ke Backend melalui `docs/BACKEND_REQUESTS.md`**, bukan berinisiatif membuat data palsu/dummy sendiri.
    3. Backend saat ini sedang menyiapkan endpoint riil untuk segera dikonsumsi Frontend:
       * `GET /api/v1/prayer-times`: Jadwal sholat riil 5 waktu berbasis kota pengguna.
       * `GET /api/v1/doa`: Kumpulan doa & dzikir murojaah Al-Qur'an resmi.
       * `GET /api/v1/mutabaah/summary`: Ringkasan streak & statistik riil dari database.
       * `GET /api/v1/mutabaah/heatmap/{surah}`: Status retensi ayat riil dari database SRS.
  * **Status**: Menunggu Frontend Menghubungkan Endpoint Riil

---

* [ ] **REQ-FE-04: Komponen Exit-Intent Quick Logger Modal (`ExitMutabaahModal.tsx`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Backend Team (Firdy)
  * **Kebutuhan UI**:
    1. Tracker otomatis di `MushafPage.tsx` merekam surat, ayat awal-akhir, jumlah lembar, dan durasi membaca saat santri aktif membaca.
    2. Saat santri mengklik tombol kembali (`<-`) atau hendak keluar, tampilkan modal popup ringkas pra-terisi (*pre-filled*).
    3. Menyediakan textarea untuk catatan santri opsional dan tombol "Simpan ke Mutabaah".
  * **Status**: Menunggu Dikerjakan Frontend

* [ ] **REQ-FE-05: Halaman Mutabaah Santri Lengkap (`MutabaahPage.tsx`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Backend Team (Firdy)
  * **Kebutuhan UI**:
    1. Tab Timeline Jurnal: Menampilkan kartu-kartu aktivitas mutabaah (tilawah, setoran, murojaah) beserta skor, catatan santri, dan catatan ustadz pembimbing.
    2. Tab Target & Komitmen: Form interaktif mengatur target hafalan surat pilihan, target ayat/lembar harian, dan evaluasi kepatuhan.
  * **Status**: Menunggu Dikerjakan Frontend

* [ ] **REQ-FE-06: Monitoring Mutabaah Santri & Feedback Ustadz di Admin (`AdminDashboardPage.tsx`)**
  * **Tanggal Diminta**: 2026-11-01 (Jam: 00:50)
  * **Diminta Oleh**: Backend Team (Firdy)
  * **Kebutuhan UI**:
    1. Tabel live monitoring kepatuhan santri hari ini (status tilawah, status murojaah, streak).
    2. Drawer / modal detail santri dengan input teks untuk mengirimkan Catatan Evaluasi Musyrif/Ustadz.
  * **Status**: Menunggu Dikerjakan Frontend

## Riwayat Permintaan Selesai (Archive)

* [x] **REQ-FE-03: Indikator Peringatan Ayat Mutasyabihat (Tarteel QUL Standard)**
  * Tanggal Diminta: 2026-10-31 (Jam 04:30)
  * Tanggal Selesai: 2026-10-31 (Jam 15:35)
  * Diselesaikan Oleh: Faeyza (Frontend Team)
  * Implementasi Tampilan:
    1. Tombol indikator amber dengan ikon `AlertTriangle` (`lucide-react`, Zero Emojis) di samping nomor ayat pada `MushafPage.tsx` bila `ayah.mutashabihat.length > 0`.
    2. Slide-over drawer / modal informatif perbandingan ayat mutasyabihat: menampilkan ayat aktif, surah & ayat pembanding, teks Arab berharakat (`font-quran text-2xl`), label kesamaan wazan/irama, dan catatan tajwid pembeda agar hafalan tidak tertukar.
  * Status: **SELESAI**

* [x] **REQ-FE-02: Integrasi State Autentikasi Pengguna (Login & Register) & Header Aplikasi**
  * Tanggal Diminta: 2026-10-31 (Jam 03:00)
  * Tanggal Selesai: 2026-10-31 (Jam 15:35)
  * Diselesaikan Oleh: Faeyza (Frontend Team)
  * Implementasi Tampilan:
    1. Form login & register terhubung ke `POST /api/v1/auth/login` dan `POST /api/v1/auth/register`.
    2. Token disimpan ke `localStorage.setItem('hifzhly_auth_token', token)` dan profil ke `localStorage.setItem('hifzhly_user_profile', JSON.stringify(user))`.
    3. Pemisahan total antara header landing page (`TubelightNavbar`) dan header aplikasi santri (`MainLayout.tsx`) yang menampilkan nama santri dinamis, target ayat harian (`dailyTargetAyahs`), streak api konsistensi (`Flame` Lucide SVG), dan tombol logout.
  * Status: **SELESAI**

* [x] **REQ-FE-01: Implementasi Layar Review Pembahasan Kuis Pasca Submit Jawaban**
  * Tanggal Diminta: 2026-10-31 (Jam 01:45)
  * Tanggal Selesai: 2026-10-31 (Jam 15:35)
  * Diselesaikan Oleh: Faeyza (Frontend Team)
  * Implementasi Tampilan:
    1. Card rekapitulasi nilai tajwid di `TajwidPage.tsx`: skor numerik besar (`score`), status kelulusan hijau "Lulus" ($\ge 70$) dengan `CheckCircle2` atau kuning "Coba Lagi" ($< 70$) dengan `RotateCcw` tanpa emoji.
    2. Daftar ulasan butir soal: menampilkan pertanyaan, opsi pilihan santri (berpenanda hijau jika benar, merah jika salah), kunci jawaban resmi, dan kotak penjelasan kaidah tajwid toska lembut (`bg-teal-50 border-teal-200 text-teal-950`).
    3. Tombol aksi responsif: "Ulangi Kuis Ini" dan "Lanjut ke Modul Berikutnya".
  * Status: **SELESAI**
