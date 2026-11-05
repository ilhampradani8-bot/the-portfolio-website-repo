# 🏛️ Official Digital Portfolio - Dr. Ilham Pradani C.L.
**S.H., M.TI. | Systems Architect, AI Expert & Cybersecurity Researcher**

[![Live Demo](https://img.shields.io/badge/Live-Vercel-black?style=for-the-badge&logo=vercel)](https://ilhampradani.chainasiaconnect.co.id/)
[![Tech Stack](https://img.shields.io/badge/HTML5_&_JS-Vanilla-F38020?style=for-the-badge&logo=javascript)](#)
[![Styling](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](#)

Repositori ini berisi *source code* untuk platform portofolio dan jurnal teknis resmi Dr. Ilham Pradani C.L. Dibangun dengan fokus pada kecepatan, SEO, dan arsitektur *Client-Side Rendering* (CSR) yang memanfaatkan Google Sheets sebagai sistem basis data dinamis (Headless CMS).

---

## ⚡ Fitur Utama (Core Features)

* **Arsitektur Tanpa Database Tradisional:** Seluruh data Portofolio dan Artikel Jurnal ditarik secara *real-time* dari Google Sheets publik, memungkinkan pembaruan konten tanpa perlu menyentuh *source code*.
* **Sistem Bilingual Terintegrasi (ID/EN):** Fitur alih bahasa tanpa *reload* menggunakan file JSON (`lang/id.json` & `lang/en.json`) yang disimpan dalam `localStorage`.
* **Desain UI/UX Presisi (Solid & Sharp):** Menggunakan estetika *Bento Grid* dan *dark mode* absolut dengan aksen biru, mencerminkan presisi arsitektural dan teknologi keamanan tingkat tinggi.
* **SEO & Metadata Dinamis:** Dilengkapi dengan injeksi JSON-LD (Schema Markup) dan pembaruan Meta Description otomatis via JavaScript untuk setiap artikel agar optimal di Google Search.
* **Responsivitas Penuh:** Navigasi Desktop yang elegan beralih ke *Fullscreen Mobile Drawer* pada perangkat *mobile*, mengunci *scroll* layar belakang untuk pengalaman pengguna (UX) yang imersif.

---

## 🛠️ Tech Stack & Infrastruktur

* **Frontend:** HTML5, Vanilla JavaScript (ES6+).
* **Styling:** Tailwind CSS (via CDN untuk *rapid development*).
* **Ikonografi:** [Lucide Icons](https://lucide.dev/).
* **Data Fetching:** Fetch API dipadukan dengan [Opensheet (elk.sh)](https://opensheet.elk.sh/) untuk konversi Google Sheets ke JSON API.
* **Deployment & Hosting:** Vercel (CI/CD otomatis dari GitHub).

---

## 📂 Struktur Direktori (Project Structure)

```text
📦 root
 ┣ 📂 image/           # Aset gambar statis (Hero, Logo, Icons)
 ┣ 📂 include/         # Komponen UI modular (Header, Footer)
 ┃ ┣ 📜 header.html
 ┃ ┗ 📜 footer.html
 ┣ 📂 lang/            # File lokalisasi / bahasa
 ┃ ┣ 📜 id.json
 ┃ ┗ 📜 en.json
 ┣ 📜 index.html       # Halaman Utama (Hero, Services, Portfolio)
 ┣ 📜 baca.html        # Halaman Jurnal Dinamis (Penerima ID Parameter)
 ┣ 📜 robots.txt       # Aturan crawling untuk Search Engine
 ┣ 📜 sitemap.xml      # Peta situs struktural
 ┗ 📜 README.md        # Dokumentasi Proyek
