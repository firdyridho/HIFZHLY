# Portal Manajemen Task & Permintaan Fitur (Backend & Frontend)

| Atribut | Keterangan |
| :--- | :--- |
| **Proyek** | Hifzhly - Platform Murojaah Al-Qur'an Berbasis AI & Spaced Repetition |
| **Pihak Berkolaborasi** | **Firdy Ridho Fillah** (Backend & AI) & **Faeyza Ardellein Yaradhitya** (Frontend & UI/UX) |
| **Siklus Kerja** | Hackathon FIFA 24 Jam (Fase 1 hingga Fase 5) |
| **Status Dokumen** | Aktif & Mengikat |
| **Dokumen Terkait** | [`BACKEND_TASKS.md`](./BACKEND_TASKS.md) / [`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md) / [`BACKEND_REQUESTS.md`](./BACKEND_REQUESTS.md) / [`FRONTEND_REQUESTS.md`](./FRONTEND_REQUESTS.md) |

---

## 1. Struktur 4 Berkas Manajemen Kerja

Dokumentasi manajemen tugas pada repositori Hifzhly menerapkan sistem pemisahan berkas mandiri (*Inbox & Roadmap System*) guna mencegah konflik Git ketika kedua pengembang (atau AI agent pendamping) melakukan *commit* dan *push* secara paralel:

| Berkas | Pemilik / Penulis Utama | Fungsi & Kegunaan |
| :--- | :--- | :--- |
| [`BACKEND_TASKS.md`](./BACKEND_TASKS.md) | **Firdy Ridho Fillah** (Backend & AI) | Roadmap resmi backend, checklist fitur 24 jam, arsitektur server Go, AI Worker Whisper, dan log task selesai `[x]`. |
| [`BACKEND_REQUESTS.md`](./BACKEND_REQUESTS.md) | **Faeyza Ardellein Yaradhitya** (Penulis)<br/>Firdy (Penerima) | **Kotak Masuk (Inbox)**: Frontend meminta endpoint baru, penyesuaian payload JSON, atau mock response tanpa merusak berkas task backend. |
| [`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md) | **Faeyza Ardellein Yaradhitya** (Frontend & UI/UX) | Roadmap resmi tampilan React, checklist komponen Mushaf, audio recorder, YouTube embed, kuis review, dan log task selesai `[x]`. |
| [`FRONTEND_REQUESTS.md`](./FRONTEND_REQUESTS.md) | **Firdy Ridho Fillah** (Penulis)<br/>Faeyza (Penerima) | **Kotak Masuk (Inbox)**: Backend meminta penyesuaian komponen UI setelah endpoint Go/AI selesai dirilis atau membutuhkan trigger interaksi baru. |

---

## 2. Alur Kerja Dua Arah (Workflow Inbox -> Done)

### Skenario 1: Frontend Membutuhkan Endpoint / Modifikasi Data
1. Frontend Developer membuka [`BACKEND_REQUESTS.md`](./BACKEND_REQUESTS.md).
2. Periksa apakah sudah melakukan `git pull origin staging`.
3. Tuliskan deskripsi endpoint atau data yang dibutuhkan di bagian **Daftar Permintaan Aktif**.
4. Backend Engineer membaca permintaan, membangun endpoint di Go/Python, melakukan verifikasi pengujian, dan menandai selesai `[x]`.
5. Backend memindahkan permintaan ke riwayat selesai dan Frontend dapat langsung mengonsumsi data live.

### Skenario 2: Backend Telah Merilis Fitur Baru & Membutuhkan UI
1. Backend Engineer membuka [`FRONTEND_REQUESTS.md`](./FRONTEND_REQUESTS.md).
2. Tuliskan endpoint baru yang telah siap beserta contoh respons JSON yang dapat dikonsumsi.
3. Frontend Developer membaca permintaan, merancang antarmuka React dan Tailwind CSS, serta mengintegrasikan state management.
4. Setelah UI aktif di aplikasi, Frontend menandai selesai `[x]` dan memperbarui [`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md).

---

## 3. Aturan Kolaborasi Git & SOP Anti-Timpa (Wajib Ditaati)

Untuk menghindari kasus di mana developer melakukan *pull* saat lawan belum selesai, lalu saat sudah selesai lupa *pull* kembali dan langsung *push* sehingga menimpa pekerjaan rekan:

### 1. Wajib `git pull` SEBELUM Menulis di Berkas Request
* Jangan pernah menulis permintaan baru sebelum menjalankan:
  ```bash
  git pull origin staging
  ```
* Tujuannya agar Anda selalu membaca versi paling akhir dari berkas request dan tidak membuat permintaan duplikat.

### 2. Wajib Cek Perubahan Rekan SEBELUM Melakukan Push
* **Khusus Frontend**: Sebelum melakukan push, periksa apakah Backend baru saja merilis perubahan endpoint atau payload baru. Selalu sinkronkan dengan perubahan backend agar frontend tidak berjalan di atas API lama.
* **Khusus Backend**: Sebelum melakukan push, periksa apakah Frontend sedang membutuhkan data darurat di `BACKEND_REQUESTS.md`.

### 3. Siklus Aman Push (Golden Push Cycle)
Gunakan urutan perintah berikut setiap kali hendak mengirimkan pekerjaan ke remote repository:
```bash
# Langkah 1: Tarik perubahan rekan terlebih dahulu
git pull origin staging

# Langkah 2: Tambahkan dan commit perubahan Anda
git add <nama_berkas>
git commit -m "feat/fix: deskripsi perubahan yang jelas"

# Langkah 3: Tarik sekali lagi sesaat sebelum push (memastikan tidak ada commit rekan yang baru masuk)
git pull origin staging

# Langkah 4: Kirim perubahan Anda dengan aman
git push origin staging
```

