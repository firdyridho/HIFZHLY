#!/bin/bash
set -e

echo "=========================================="
echo "    🚀 HIFZHLY VPS DEPLOYMENT SCRIPT     "
echo "=========================================="

# 1. Update source code from staging
echo "[1/4] Menarik perubahan kode terbaru dari branch staging..."
git pull origin staging

# 2. Pastikan file .env tersedia
if [ ! -f .env ]; then
    echo "[2/4] File .env belum ada, membuat dari konfigurasi default..."
    cat <<EOT > .env
APP_ENV=production
APP_PORT=8080
FRONTEND_PORT=3000
JWT_SECRET=hifzhly_fifa_secret_key_prod_2026_xyz!
POSTGRES_USER=hifzhly_user
POSTGRES_PASSWORD=hifzhly_secure_password_2026
POSTGRES_DB=hifzhly_db
DATABASE_URL=postgres://hifzhly_user:hifzhly_secure_password_2026@postgres:5432/hifzhly_db?sslmode=disable
REDIS_HOST=redis
REDIS_PORT=6379
EQURAN_API_BASE_URL=https://equran.id/api/v2
EOT
else
    echo "[2/4] File .env ditemukan."
fi

# 3. Build & start docker containers
echo "[3/4] Melakukan build dan restart kontainer Docker..."
docker compose down || true
docker compose up -d --build

# 4. Status cek
echo "[4/4] Memeriksa status kontainer..."
docker compose ps

echo "=========================================="
echo "  ✅ Hifzhly Backend Stack Berhasil Berjalan di VPS!"
echo "  Backend API : http://<IP_VPS>:8080/health"
echo "  Frontend Web: https://hifzhly.vercel.app"
echo "=========================================="
