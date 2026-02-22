# 🔔 Panduan Testing Sistem Notifikasi

## Masalah yang Ditemukan

Series sudah di-bookmark tapi tidak ada notifikasi karena:
1. **Tidak ada `update_history`** - Sistem memerlukan baseline chapter untuk membandingkan
2. **Notifikasi tidak diaktifkan** - Setting `notif_enabled` belum di-set
3. **Permission belum granted** - Browser belum memberikan izin notifikasi

## Cara Testing

### Metode 1: Menggunakan File Test HTML (Recommended)

1. **Buka file test**
   ```bash
   # Jalankan development server
   npm run dev
   ```
   
2. **Akses halaman test**
   - Buka browser: `http://localhost:3000/test-notifications.html`
   - Atau buka file `test-notifications.html` langsung di browser

3. **Ikuti langkah-langkah testing:**

   **Step 1: Cek Status Sistem**
   - Klik "Cek Status" untuk melihat kondisi sistem
   - Pastikan semua support tersedia (✅)

   **Step 2: Request Permission**
   - Klik "Minta Izin Notifikasi"
   - Allow permission di browser

   **Step 3: Test Notifikasi Sederhana**
   - Klik "Kirim Test Notifikasi"
   - Pastikan notifikasi muncul

   **Step 4: Lihat Data**
   - Klik "Lihat Bookmarks" - pastikan ada bookmark
   - Klik "Lihat Update History" - cek apakah ada history

   **Step 5: Inisialisasi History** (PENTING!)
   - Jika history kosong, klik "Inisialisasi History"
   - Ini akan mengambil chapter terbaru sebagai baseline
   - Tunggu sampai selesai

   **Step 6: Cek Update Manual**
   - Klik "Cek Update Sekarang"
   - Lihat hasilnya

   **Step 7: Simulasi Update (Optional)**
   - Klik "Simulasi History Lama" untuk testing
   - Lalu klik "Cek Update Sekarang"
   - Notifikasi seharusnya muncul

### Metode 2: Testing via Browser Console

1. **Buka aplikasi di browser**
   ```
   http://localhost:3000
   ```

2. **Buka Developer Console** (F12)

3. **Jalankan script testing:**

```javascript
// 1. Cek status
console.log('Bookmarks:', JSON.parse(localStorage.getItem('bookmarks') || '[]'));
console.log('History:', JSON.parse(localStorage.getItem('update_history') || '{}'));
console.log('Notif Enabled:', localStorage.getItem('notif_enabled'));
console.log('Permission:', Notification.permission);

// 2. Aktifkan notifikasi (jika belum)
localStorage.setItem('notif_enabled', 'true');

// 3. Request permission
await Notification.requestPermission();

// 4. Test notifikasi sederhana
new Notification('Test', { body: 'Testing notifikasi' });

// 5. Inisialisasi history (PENTING!)
const BASE_URL = 'https://unofficial-komikcast-api.vercel.app';
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
const updateHistory = {};

for (const series of bookmarks) {
    const slug = series.data.slug;
    const res = await fetch(`${BASE_URL}/series/${slug}/chapters`);
    const data = await res.json();
    if (data && data.data && data.data.length > 0) {
        const latestChapter = data.data[0];
        const chapterIndex = latestChapter.data?.index || latestChapter.chapterIndex;
        updateHistory[slug] = chapterIndex;
        console.log(`${series.data.title}: Chapter ${chapterIndex}`);
    }
}

localStorage.setItem('update_history', JSON.stringify(updateHistory));
console.log('✅ History initialized!');

// 6. Test cek update
// Tunggu beberapa saat atau simulasikan history lama
const history = JSON.parse(localStorage.getItem('update_history') || '{}');
const firstSlug = Object.keys(history)[0];
if (firstSlug) {
    history[firstSlug] = parseInt(history[firstSlug]) - 1; // Kurangi 1 chapter
    localStorage.setItem('update_history', JSON.stringify(history));
    console.log('✅ History disimulasikan lebih lama');
}

// 7. Trigger manual check (reload page atau tunggu 30 menit)
// Atau panggil langsung:
// await checkForUpdates(); // Jika function tersedia
```

### Metode 3: Testing Otomatis

1. **Pastikan notifikasi aktif:**
   - Buka Settings di aplikasi
   - Toggle notifikasi ON
   - Allow permission

2. **Inisialisasi history:**
   - Gunakan file test HTML atau console
   - Jalankan inisialisasi sekali

3. **Tunggu automatic check:**
   - Sistem akan cek setiap 30 menit
   - Atau reload page untuk trigger check awal (5 detik setelah load)

## Troubleshooting

### Notifikasi Tidak Muncul

**Problem 1: Permission Denied**
```
Solution: 
- Buka browser settings
- Cari "Notifications" atau "Site Settings"
- Allow notifications untuk localhost/domain
```

**Problem 2: History Kosong**
```
Solution:
- Jalankan inisialisasi history
- Gunakan file test HTML atau console script
```

**Problem 3: Notifikasi Disabled**
```
Solution:
- localStorage.setItem('notif_enabled', 'true');
- Atau toggle di Settings UI
```

**Problem 4: Service Worker Tidak Terdaftar**
```
Solution:
- Cek di DevTools > Application > Service Workers
- Pastikan sw.js terdaftar
- Reload page jika perlu
```

### Cek Data di LocalStorage

```javascript
// Lihat semua data
console.table({
    bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]').length,
    history: Object.keys(JSON.parse(localStorage.getItem('update_history') || '{}')).length,
    notif_enabled: localStorage.getItem('notif_enabled'),
    permission: Notification.permission
});
```

## Expected Behavior

### Skenario 1: First Time Setup
1. User bookmark series → Tidak ada notifikasi (normal)
2. Inisialisasi history → Chapter terbaru disimpan
3. Ada chapter baru → Notifikasi muncul ✅

### Skenario 2: Existing Bookmarks
1. Sudah ada bookmark tapi tidak ada history
2. Jalankan inisialisasi history
3. Chapter baru keluar → Notifikasi muncul ✅

### Skenario 3: Normal Usage
1. User bookmark series baru
2. Sistem auto-inisialisasi history di background
3. Chapter baru → Notifikasi muncul ✅

## Tips Testing

1. **Gunakan file test HTML** - Paling mudah dan lengkap
2. **Test di berbagai browser** - Chrome, Firefox, Safari
3. **Test di mobile** - Service Worker notification berbeda
4. **Simulasi history lama** - Untuk test tanpa menunggu chapter baru
5. **Monitor console** - Lihat error/log untuk debugging

## File-file Terkait

- `lib/notifications.js` - Logic notifikasi
- `components/NotificationHandler.jsx` - Auto-check component
- `public/sw.js` - Service worker untuk mobile
- `test-notifications.html` - File testing (baru dibuat)

## Next Steps

Jika masih ada masalah:
1. Cek console untuk error
2. Verify API response dari komikcast
3. Test permission di browser settings
4. Pastikan service worker aktif
