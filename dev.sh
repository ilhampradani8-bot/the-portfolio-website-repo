#!/usr/bin/env bash
# Mode Dev Lokal untuk Portofolio Dr. Ilham Pradani
# Menjalankan Cloudflare Pages Dev (lengkap dengan Edge Function lokal di http://localhost:8788)
PORT="${1:-8788}"

echo "=========================================================="
echo "🚀 Memulai Cloudflare Pages Local Dev Server di port $PORT"
echo "📍 Akses Lokal: http://localhost:$PORT"
echo "⚡ Mendukung Live Preview & Edge Functions lokal (/api/contact)"
echo "Tekan Ctrl+C untuk menghentikan server."
echo "=========================================================="
echo ""

npx wrangler pages dev /root/ilhampradani-web --port="$PORT"

