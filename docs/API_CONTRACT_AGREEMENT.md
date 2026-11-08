# Frontend & Backend API Contract Agreement

| Atribut | Keterangan |
| :--- | :--- |
| **Dokumen** | Perjanjian Kontrak Antarmuka Komunikasi Data (REST API & Audio Pipeline) |
| **Pihak Terikat** | **Firdy Ridho Fillah** (Backend & AI) & **Faeyza Ardellein Yaradhitya** (Frontend & UI/UX) |
| **Tim / Institusi** | Tim FIFA (Firdy Ridho Fillah & Faeyza Ardellein Yaradhitya) |
| **Versi Kontrak** | 1.0 (Mengikat & Berlaku untuk Hackathon 24 Jam) |
| **Tanggal Kesepakatan**| 2026-10-31 |
| **Dokumen Terkait** | [`PRD.md`](./PRD.md) / [`ERD.md`](./ERD.md) / [`API.md`](./API.md) / [`TASKS.md`](./TASKS.md) |

---

## 1. Latar Belakang dan Tujuan Kesepakatan

Dokumen ini disusun sebagai perjanjian teknis resmi (*Service Level Agreement & Technical Interface Contract*) antara **Ketua Tim (Backend Engineer & AI)** dan **Frontend Developer & UI/UX** pada repositori proyek **Hifzhly**.

Dalam kompetisi hackathon berdurasi ketat 24 jam, hilangnya waktu akibat miskomunikasi struktur data JSON, perbedaan format audio, atau tabrakan branch Git dapat menggagalkan demonstrasi produk. Oleh karena itu, kesepakatan ini bertujuan untuk:
1. Menetapkan batasan tegas tanggung jawab kerja (*boundary agreement*) agar kedua anggota dapat bekerja secara paralel sejak jam pertama.
2. Memastikan seluruh pertukaran data JSON, penamaan properti, status kode HTTP, dan format error terstandardisasi 100%.
3. Menyediakan kontrak *mock data* sehingga tim Frontend dapat membangun antarmuka lengkap tanpa terhambat oleh proses pelatihan atau deployment model AI suara di sisi backend.
4. Menerapkan SOP kolaborasi Git anti-timpa (*Golden Push Cycle*).

---

## 2. Batas Tanggung Jawab Tim (Boundary Agreement)

### 2.1 Tanggung Jawab Backend & AI (Firdy Ridho Fillah)
* Mengembangkan REST API berkinerja tinggi menggunakan bahasa pemrograman Golang.
* Menyediakan skema dan migrasi database relasional PostgreSQL serta mekanisme caching Redis.
* Mengintegrasikan layanan mikro AI (Python Whisper ASR, VAD, dan algoritma penyejajaran kata Levenshtein).
* Mengimplementasikan logika Spaced Repetition System (SRS SuperMemo-2 adaptif) dan mesin validasi kuis tajwid.
* Menyediakan endpoint proxy berkecepatan tinggi ke EQuran.id API v2 untuk teks ayat dan audio qari.
* Menyiapkan konfigurasi orkestrasi Docker Compose server dan menyediakan data bibit (*seed data*) materi serta kuis tajwid.
* **Larangan**: Backend dilarang menyentuh atau mengubah direktori frontend (`frontend/` atau `src/`). Seluruh kebutuhan data visual harus dikomunikasikan secara resmi melalui `docs/FRONTEND_REQUESTS.md`.

### 2.2 Tanggung Jawab Frontend & UI/UX (Faeyza Ardellein Yaradhitya)
* Membangun antarmuka pengguna web interaktif berbasis React 19, Vite, dan Tailwind CSS v4.
* Mengimplementasikan perekaman audio browser menggunakan Web Audio API dengan spesifikasi teknis 16 kHz Mono WAV/PCM.
* Membangun komponen tampilan Mushaf Al-Qur'an dengan kemampuan penyorotan kata keliru (*word-level highlighting*) secara visual.
* Mengintegrasikan pemutar video YouTube (via `react-youtube` atau HTML5 `<iframe>`) pada modul tajwid.
* Menyajikan antarmuka interaktif pengerjaan kuis tajwid serta layar review pembahasan per butir soal.
* Membangun visualisasi dashboard Mutabaah (grafik konsistensi, streak, dan daftar ayat jatuh tempo SRS).
* **Larangan**: Frontend dilarang mengubah skema tabel database, logika penskoran AI, atau port backend tanpa persetujuan tertulis melalui `docs/BACKEND_REQUESTS.md`.

---

## 3. Konvensi Format Data dan Standar Serialisasi

### 3.1 Penamaan Kunci JSON (Casing Convention)
* Seluruh properti JSON pada *request body* dan *response payload* REST API **wajib menggunakan format `camelCase`**.
  * Contoh valid: `userId`, `surahNumber`, `ayahNumber`, `transcribedText`, `wordDiff`, `nextReviewAt`, `passingScore`.
  * Penggunaan `snake_case` (contoh: `surah_number`, `user_id`) hanya diperbolehkan pada layer internal query SQL database PostgreSQL.

### 3.2 Representasi Waktu dan Timestamp
1. **Waktu Transaksi & Entitas**: Menggunakan standar ISO 8601 UTC dengan akhiran `Z` (contoh: `2026-10-31T09:00:00Z`).
2. **Durasi Perekaman Audio**: Menggunakan integer satuan milidetik (`durationMs`, contoh: `4250`).
3. **Tanggal Kalender SRS & Mutabaah**: Menggunakan string format ISO Date `YYYY-MM-DD` (contoh: `2026-10-31`).

### 3.3 Standar Respon Kesalahan (Uniform Error Handling)
Setiap tanggapan gagal HTTP (status 4xx dan 5xx) wajib mengembalikan format JSON seragam:
```json
{
  "error": "Pesan deskripsi kesalahan dalam Bahasa Indonesia yang ramah pengguna"
}
```

Daftar kode status HTTP yang disepakati:
* `200 OK`: Permintaan berhasil diproses dan mengembalikan data yang diminta.
* `201 Created`: Entitas baru (pengguna, sesi murojaah, attempt kuis) berhasil dibuat.
* `400 Bad Request`: Format payload JSON tidak valid, audio korup, atau parameter wajib tidak ada.
* `401 Unauthorized`: Token JWT tidak disertakan, kedaluwarsa, atau tidak valid.
* `404 Not Found`: Data surah, ayat, modul tajwid, atau pengguna tidak ditemukan.
* `409 Conflict`: Pendaftaran gagal karena email atau username sudah digunakan.
* `422 Unprocessable Entity`: Validasi bisnis gagal (misal: audio terlalu hening / VAD tidak mendeteksi suara).
* `500 Internal Server Error`: Terjadi kegagalan pemrosesan pada internal server Go atau worker AI Whisper.

---

## 4. Spesifikasi Kontrak Aliran Audio Murojaah

Perekaman suara pada modul *Smart Murojaah* merupakan komponen paling kritis. Format audio disepakati secara ketat sebagai berikut:

| Parameter Teknis | Nilai Kesepakatan | Catatan Implementasi |
| :--- | :--- | :--- |
| **Metode Pengiriman** | `multipart/form-data` | Menggunakan field `audio` (berkas WAV/WebM) dan field form metadata |
| **Sample Rate** | `16000 Hz` (16 kHz) | Standar optimal untuk model Whisper ASR |
| **Kanal Audio** | `1 Channel` (Mono) | Mereduksi ukuran berkas audio hingga 50% |
| **Maksimal Durasi per Ayat** | 45 detik | Mencegah kelebihan beban pemrosesan pada server |
| **Form Data Fields** | `audio`: binary file<br/>`surahNumber`: integer<br/>`ayahNumber`: integer<br/>`sessionId`: string UUID | Metadata wajib agar AI dapat mencocokkan teks referensi ayat |

---

## 5. Mock Data Contract untuk Rapid Prototyping (Fase 1–2)

Selama Backend menyelesaikan integrasi Whisper AI pada jam 02:00–10:00, Frontend dapat menggunakan mock response berikut untuk membangun tampilan visual hasil evaluasi:

```json
{
  "evaluationId": "c9a29e4d-7f12-4c28-910a-31a89b0d87fa",
  "surahNumber": 78,
  "ayahNumber": 1,
  "score": 87.5,
  "transcribedText": "عَمَّ يَتَسَاءَلُ",
  "referenceText": "عَمَّ يَتَسَآءَلُونَ",
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
      "mistakeType": "huruf_akhir_hilang"
    }
  ],
  "srsUpdate": {
    "qualityRating": 4,
    "nextReviewAt": "2026-11-03",
    "intervalDays": 3,
    "repetitionCount": 2
  }
}
```

---

## 6. Prosedur Kerja Kolaborasi Git (Golden Push Cycle)

Untuk menghindari tabrakan kode dan konflik merge saat jam-jam genting kompetisi:
1. Seluruh pengembangan berjalan di atas branch `staging`. Branch `main` hanya digunakan untuk rilis final di jam ke-22.
2. Setiap kali sebelum menulis kode baru atau membuat request:
   ```bash
   git pull origin staging
   ```
3. Sebelum melakukan push ke remote repository:
   ```bash
   git pull origin staging
   git add .
   git commit -m "feat/fix: deskripsi perubahan"
   git pull origin staging
   git push origin staging
   ```
4. Jika terdapat ketidakcocokan data di tengah proses pengerjaan, kedua pihak wajib merujuk kembali pada dokumen [`API.md`](./API.md).

