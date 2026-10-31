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

*Saat ini belum ada permintaan aktif baru dari Frontend. Seluruh spesifikasi awal telah terdokumentasi lengkap pada [`API.md`](./API.md).*

---

## Riwayat Permintaan Selesai (Archive)

* [x] **REQ-BE-01: Penyediaan Mock Payload Evaluasi Suara Murojaah untuk Pengujian Tampilan Kata**
  * Tanggal Diminta: 2026-10-31 (Jam 01:00)
  * Tanggal Selesai: 2026-10-31 (Jam 01:30)
  * Diminta Oleh: Frontend Team
  * Diselesaikan Oleh: Backend Team (Firdy)
  * Implementasi: Menambahkan contoh mock data JSON lengkap dengan array `wordDiff` (status `correct` dan `substituted`) pada Bagian 5 dokumen [`API_CONTRACT_AGREEMENT.md`](./API_CONTRACT_AGREEMENT.md) sehingga Frontend dapat langsung mengembangkan komponen penyorotan teks Arab.
  * Status: [x] SELESAI

