# Panduan Deployment dan Orkestrasi Sistem (Deployment Guide)

| Atribut | Keterangan |
| :--- | :--- |
| **Nama Sistem** | Hifzhly Multi-Service Architecture |
| **Versi Dokumen** | 1.0 (Full-Stack Containerized Orchestration) |
| **Status** | Aktif / Hackathon FIFA 24 Jam |
| **Tanggal Pembaruan** | 2026-10-31 |
| **Dokumen Terkait** | [`PRD.md`](./PRD.md) / [`API.md`](./API.md) / [`ERD.md`](./ERD.md) |

---

## 1. Arsitektur Layanan Kontainer (Multi-Container Architecture)

Ekosistem Hifzhly diorkestrasi menggunakan **Docker Compose** ke dalam lima layanan terisolasi yang saling terhubung dalam private bridge network:

```mermaid
graph TD
    Client[Web Browser / Smartphone] -->|Port 80 / 443| Nginx[Frontend Nginx Container]
    Client -->|Port 8080 /api/v1| GoBackend[Go REST API Backend]
    
    GoBackend -->|Port 5432| Postgres[(PostgreSQL 16 Database)]
    GoBackend -->|Port 6379| RedisCache[(Redis 7.2 In-Memory Cache)]
    GoBackend -->|Internal Port 5000 / HTTP| PythonAI[Python AI Worker - Whisper & VAD]
    GoBackend -->|HTTPS Outbound| EQuran[EQuran.id API v2]
```

### Rincian Port dan Layanan:
1. **`frontend` (Port 3000 / 80)**: Menjalankan build statis React 19 + Tailwind CSS yang dilayani oleh Nginx Alpine.
2. **`backend` (Port 8080)**: Server biner Go berkinerja tinggi menangani rute `/api/v1`, autentikasi JWT, SRS, kuis, dan mutabaah.
3. **`ai-worker` (Port 5000 internal)**: Layanan mikro Python (Flask/FastAPI) yang memuat model `whisper-base-ar-quran`, VAD audio processing, dan penyejajaran Levenshtein.
4. **`postgres` (Port 5432)**: Penyimpanan permanen ACID data relasional pengguna, kurva lupa, dan soal tajwid.
5. **`redis` (Port 6379)**: Cache respons surah/ayat Al-Qur'an dan antrean token.

---

## 2. Prasyarat Lingkungan (Prerequisites)

Sebelum menjalankan sistem, pastikan perangkat keras dan perangkat lunak berikut telah terpasang:
* **Docker Engine**: Versi $\ge 24.0$
* **Docker Compose**: Versi $\ge 2.20$
* **RAM Minimum**: 4 GB (Disarankan 8 GB untuk inferensi Whisper model dengan mulus)
* **Koneksi Internet**: Diperlukan saat pertama kali melakukan build gambar untuk mengunduh bobot model Whisper dan dependensi npm/Go.

---

## 3. Konfigurasi Variabel Lingkungan (`.env`)

Buat berkas `.env` pada root direktori proyek dengan menyalin contoh berikut:

```ini
# ==============================================================================
# LINGKUNGAN APLIKASI
# ==============================================================================
APP_ENV=production
APP_PORT=8080
FRONTEND_PORT=3000

# ==============================================================================
# KEAMANAN & AUTENTIKASI JWT
# ==============================================================================
JWT_SECRET=super_secret_hifzhly_fifa_hackathon_key_2026_xyz!
JWT_EXPIRATION_HOURS=72

# ==============================================================================
# POSTGRESQL DATABASE
# ==============================================================================
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=hifzhly_user
POSTGRES_PASSWORD=hifzhly_secure_password_2026
POSTGRES_DB=hifzhly_db
DATABASE_URL=postgres://hifzhly_user:hifzhly_secure_password_2026@postgres:5432/hifzhly_db?sslmode=disable

# ==============================================================================
# REDIS IN-MEMORY CACHE
# ==============================================================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# ==============================================================================
# AI VOICE WORKER (WHISPER)
# ==============================================================================
AI_WORKER_URL=http://ai-worker:5000
WHISPER_MODEL_NAME=whisper-base-ar-quran
AI_TIMEOUT_SECONDS=15

# ==============================================================================
# EXTERNAL INTEGRATIONS
# ==============================================================================
EQURAN_API_BASE_URL=https://equran.id/api/v2
```

---

## 4. Berkas Konfigurasi `docker-compose.yml`

Gunakan konfigurasi orkestrasi standar berikut untuk menjalankan seluruh stack:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: hifzhly-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-hifzhly_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-hifzhly_secure_password_2026}
      POSTGRES_DB: ${POSTGRES_DB:-hifzhly_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-hifzhly_user} -d ${POSTGRES_DB:-hifzhly_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.2-alpine
    container_name: hifzhly-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  ai-worker:
    build:
      context: ./services/ai-worker
      dockerfile: Dockerfile
    container_name: hifzhly-ai-worker
    restart: unless-stopped
    environment:
      - MODEL_NAME=${WHISPER_MODEL_NAME:-whisper-base-ar-quran}
      - PORT=5000
    expose:
      - "5000"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5000/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hifzhly-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      ai-worker:
        condition: service_healthy
    env_file:
      - .env
    ports:
      - "8080:8080"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hifzhly-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 5. Langkah-Langkah Menjalankan Sistem

### 5.1 Menjalankan Seluruh Sistem (Mode Produksi / Demonstrasi)
1. Buka terminal pada root direktori proyek `Hifzhly`:
   ```bash
   docker compose up --build -d
   ```
2. Periksa status seluruh kontainer:
   ```bash
   docker compose ps
   ```
   *Pastikan kelima layanan berstatus `Up (healthy)`.*

3. Lihat log kontainer secara realtime bila dibutuhkan pemeriksaan:
   ```bash
   docker compose logs -f backend
   docker compose logs -f ai-worker
   ```

### 5.2 Menjalankan Mode Pengembangan Lokal (Hot-Reload)
Jika ingin melakukan debugging mandiri tanpa kontainer frontend/backend:
1. Jalankan hanya PostgreSQL dan Redis:
   ```bash
   docker compose up -d postgres redis
   ```
2. Jalankan Backend Go:
   ```bash
   cd backend
   go run cmd/api/main.go
   ```
3. Jalankan Frontend React:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

---

## 6. Prosedur Uji Kesehatan Sistem (Health Check Verification)

Lakukan verifikasi berkala melalui terminal untuk memastikan sistem siap saat demonstrasi:

1. **Uji Endpoint Backend Go**:
   ```bash
   curl -i http://localhost:8080/api/v1/quran/surahs
   ```
   *Harus mengembalikan HTTP `200 OK` dengan daftar 114 surah.*

2. **Uji Layanan AI Worker**:
   ```bash
   curl -i http://localhost:5000/health
   ```
   *Harus mengembalikan `{"status":"ready","model":"whisper-base-ar-quran"}`.*

3. **Uji Frontend Web**:
   Buka peramban di `http://localhost:3000`. Halaman landing page dan Mushaf Hifzhly harus tampil dalam waktu kurang dari 1 detik.

