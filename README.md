# Komik Meh

Komik Meh adalah aplikasi katalog komik berbasis Next.js yang mengambil data terbaru dari [Unofficial Komikcast API](https://unofficial-komikcast-api.vercel.app/komikcast). Fokus utama proyek ini adalah memberikan pengalaman membaca komik berbahasa Indonesia yang cepat, responsif, dan mudah dinavigasi.

## Fitur Utama

1. **Beranda "Update Terbaru"** – Menampilkan rilisan terbaru dengan _infinite scroll_ berbasis `IntersectionObserver` serta skeleton loading agar transisi terasa mulus.@app/page.jsx#13-85
2. **Pencarian dengan URL query** – Halaman `/search` memanfaatkan parameter `?q=` agar hasil bisa dibagikan, lengkap dengan _debounced fetch_, indikator loading lanjutan, dan pagination incremental.@app/search/page.jsx#10-75
3. **Detail Komik Sinematik** – Halaman detail menyajikan hero blur, genre tags, status/type badge, dan tombol "Mulai Baca" yang langsung mengarah ke chapter pertama/terakhir yang relevan.@app/komik/[slug]/page.jsx#17-100
4. **Pembaca Chapter Imersif** – Halaman `/read/[slug]` memuat gambar chapter secara penuh, menyediakan kontrol auto-scroll, toolbar navigasi, dan fallback error sederhana.@app/read/[slug]/page.jsx#1-76
5. **Riwayat Bacaan Lokal** – Zustand `persist` menyimpan daftar chapter yang pernah dibaca agar pengguna bisa melanjutkan dengan cepat bahkan setelah reload.@store/useHistoryStore.js#1-30

## Teknologi & Arsitektur

- **Next.js App Router** dengan komponen klien untuk interaktivitas tinggi.
- **Tailwind CSS** (kelas utilitas seperti `bg-linear-to-r`, `grid-cols-6`, dll.) untuk styling responsif.
- **Zustand Persisted Store** guna menyimpan riwayat bacaan di `localStorage`.
- **Lucide Icons & Timeago.js** untuk ikonografi dan format waktu relatif.@app/komik/[slug]/page.jsx#7-16
- **UniversalImage Component** sebagai pembungkus `<Image>` untuk optimasi gambar lintas halaman.@components/KomikCard.jsx#1-55
- **API Layer** terpusat pada `lib/api.js`, seluruh request diberi opsi `revalidate: 60` agar cache Next.js lebih efisien.@lib/api.js#1-54

Komposisi Alur Data

API Komikcast -> lib/api.js -> Halaman (Home/Search/Detail/Read) -> Komponen UI -> Zustand (riwayat)

## Menjalankan Proyek

1. Instal dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000).

> Gunakan Node.js 18+ agar fitur `fetch` bawaan dan cache Next.js bekerja optimal.

## Deployment Production

- URL produksi: [https://komik-meh.vercel.app](https://komik-meh.vercel.app/)
- Deployment dilakukan di Vercel agar memanfaatkan edge network dan incremental cache bawaan Next.js.
- Pastikan environment production memiliki akses keluar ke API Komikcast supaya feed dan reader tetap sinkron.

## Catatan API

- Basis data bersumber dari `https://unofficial-komikcast-api.vercel.app/komikcast` dengan endpoint publik `latest`, `detail/[slug]`, `chapter/[slug]`, dan `search`.@lib/api.js#1-54
- Setiap request memakai `next.revalidate = 60` detik untuk menyeimbangkan data terbaru dan performa.
- Pastikan deployment production mengizinkan akses keluar ke domain API tersebut.

## Ide Pengembangan Lanjutan

- Tambahkan autentikasi agar riwayat bacaan dapat disinkronkan lintas perangkat.
- Sediakan mode offline dengan cache gambar chapter menggunakan Service Worker.
- Perluas filter pencarian (genre, status, urutan rilis) agar eksplorasi komik lebih kaya.
