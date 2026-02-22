# 🌐 Testing Notifikasi di Production

## Opsi 1: Deploy File Test ke Production (Recommended)

File `test-notifications.html` sudah standalone dan bisa langsung diakses di production.

### Cara Akses:
```
https://your-domain.com/test-notifications.html
```

File ini akan otomatis tersedia karena ada di root project. Next.js akan serve static HTML files.

### Jika Tidak Muncul:
Pindahkan ke folder `public`:
```bash
mv test-notifications.html public/test-notifications.html
```

Lalu akses:
```
https://your-domain.com/test-notifications.html
```

## Opsi 2: Testing via Browser Console

Buka production site di browser, tekan F12, paste script ini:

### Script Testing Lengkap

```javascript
// ===================================
// PRODUCTION NOTIFICATION TEST SCRIPT
// ===================================

console.log('🔔 Starting Notification Test...\n');

// 1. CEK STATUS SISTEM
console.log('=== 1. SYSTEM STATUS ===');
console.log('Browser Support:');
console.log('  Notification API:', 'Notification' in window ? '✅' : '❌');
console.log('  Service Worker:', 'serviceWorker' in navigator ? '✅' : '❌');
console.log('  LocalStorage:', typeof Storage !== 'undefined' ? '✅' : '❌');
console.log('\nPermission:', Notification.permission);
console.log('Notif Enabled:', localStorage.getItem('notif_enabled'));

const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
const updateHistory = JSON.parse(localStorage.getItem('update_history') || '{}');
console.log('Bookmarks:', bookmarks.length);
console.log('History:', Object.keys(updateHistory).length);
console.log('\n');

// 2. AKTIFKAN NOTIFIKASI
console.log('=== 2. ENABLE NOTIFICATIONS ===');
localStorage.setItem('notif_enabled', 'true');
console.log('✅ Notifikasi diaktifkan\n');

// 3. REQUEST PERMISSION
console.log('=== 3. REQUEST PERMISSION ===');
if (Notification.permission === 'default') {
    console.log('⏳ Requesting permission...');
    await Notification.requestPermission().then(permission => {
        console.log('Permission:', permission);
    });
} else {
    console.log('Current permission:', Notification.permission);
}
console.log('\n');

// 4. TEST NOTIFIKASI SEDERHANA
console.log('=== 4. TEST SIMPLE NOTIFICATION ===');
if (Notification.permission === 'granted') {
    new Notification('🧪 Test Production', {
        body: 'Notifikasi berfungsi di production!',
        icon: '/icon-192x192.png'
    });
    console.log('✅ Test notification sent!\n');
} else {
    console.log('❌ Permission not granted\n');
}

// 5. INISIALISASI HISTORY
console.log('=== 5. INITIALIZE HISTORY ===');
if (bookmarks.length === 0) {
    console.log('❌ No bookmarks found. Add some bookmarks first.\n');
} else {
    console.log(`Found ${bookmarks.length} bookmarks. Initializing...\n`);
    
    const BASE_URL = 'https://unofficial-komikcast-api.vercel.app';
    const newHistory = {};
    
    for (const series of bookmarks) {
        try {
            const slug = series.data.slug;
            console.log(`📖 ${series.data.title}...`);
            
            const res = await fetch(`${BASE_URL}/series/${slug}/chapters`);
            const data = await res.json();
            
            if (data && data.data && data.data.length > 0) {
                const latestChapter = data.data[0];
                const chapterIndex = latestChapter.data?.index || latestChapter.chapterIndex;
                newHistory[slug] = chapterIndex;
                console.log(`   ✅ Chapter ${chapterIndex}`);
            }
        } catch (err) {
            console.log(`   ❌ Error: ${err.message}`);
        }
    }
    
    localStorage.setItem('update_history', JSON.stringify(newHistory));
    console.log(`\n✅ History initialized for ${Object.keys(newHistory).length} series\n`);
}

// 6. SIMULASI UPDATE (OPTIONAL)
console.log('=== 6. SIMULATE UPDATE (Optional) ===');
console.log('Run this to test notification without waiting for real update:\n');
console.log('const history = JSON.parse(localStorage.getItem("update_history") || "{}");');
console.log('const firstSlug = Object.keys(history)[0];');
console.log('if (firstSlug) {');
console.log('    history[firstSlug] = parseInt(history[firstSlug]) - 1;');
console.log('    localStorage.setItem("update_history", JSON.stringify(history));');
console.log('    console.log("✅ Simulated old history. Reload page to trigger check.");');
console.log('}\n');

// 7. MANUAL CHECK
console.log('=== 7. MANUAL UPDATE CHECK ===');
console.log('To manually check for updates, reload the page or wait 30 minutes.\n');

console.log('=== TEST COMPLETE ===');
console.log('✅ Setup done! Notifications will work automatically now.');
console.log('\nNext steps:');
console.log('1. Wait for real chapter updates (automatic)');
console.log('2. Or run the simulation code above and reload');
```

### Script Singkat (Quick Test)

```javascript
// Quick test - paste ini di console production
(async () => {
    // Enable notif
    localStorage.setItem('notif_enabled', 'true');
    
    // Request permission
    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    
    // Test notification
    if (Notification.permission === 'granted') {
        new Notification('Test', { body: 'Working!' });
        console.log('✅ Test sent!');
    }
    
    // Initialize history
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const BASE_URL = 'https://unofficial-komikcast-api.vercel.app';
    const history = {};
    
    for (const s of bookmarks) {
        const res = await fetch(`${BASE_URL}/series/${s.data.slug}/chapters`);
        const data = await res.json();
        if (data?.data?.[0]) {
            history[s.data.slug] = data.data[0].data?.index || data.data[0].chapterIndex;
        }
    }
    
    localStorage.setItem('update_history', JSON.stringify(history));
    console.log('✅ Done! History:', history);
})();
```

## Opsi 3: Buat Halaman Test di Next.js

Jika ingin UI yang lebih terintegrasi:

### 1. Buat route baru:

```bash
# File: app/test-notif/page.jsx
```

### 2. Copy konten dari `test-notifications.html` tapi dalam format React

Saya bisa buatkan jika diperlukan.

## Opsi 4: Testing Manual Tanpa Script

### Langkah-langkah:

1. **Buka production site**
   ```
   https://your-domain.com
   ```

2. **Buka DevTools** (F12)

3. **Cek data** di Console:
   ```javascript
   localStorage.getItem('notif_enabled')
   JSON.parse(localStorage.getItem('bookmarks') || '[]')
   JSON.parse(localStorage.getItem('update_history') || '{}')
   ```

4. **Enable notifikasi** di Console:
   ```javascript
   localStorage.setItem('notif_enabled', 'true')
   ```

5. **Request permission**:
   ```javascript
   await Notification.requestPermission()
   ```

6. **Test notifikasi**:
   ```javascript
   new Notification('Test', { body: 'Hello!' })
   ```

7. **Inisialisasi history** (copy script dari atas)

8. **Reload page** dan tunggu 5 detik

## Monitoring di Production

### Cek Service Worker:
1. DevTools → Application → Service Workers
2. Pastikan `sw.js` terdaftar dan active

### Cek Notifications:
1. DevTools → Application → Storage → Local Storage
2. Lihat keys: `notif_enabled`, `bookmarks`, `update_history`

### Cek Console Logs:
```javascript
// Enable verbose logging
localStorage.setItem('debug_notif', 'true');
```

Lalu di `lib/notifications.js`, tambahkan logging:
```javascript
const debug = localStorage.getItem('debug_notif') === 'true';
if (debug) console.log('Checking updates...');
```

## Troubleshooting Production

### Issue: File test-notifications.html tidak muncul

**Solusi 1**: Pindah ke public folder
```bash
mv test-notifications.html public/
```

**Solusi 2**: Buat sebagai Next.js page
```bash
# Buat app/test-notif/page.jsx
```

### Issue: Service Worker tidak terdaftar

**Cek**:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('SW:', reg);
});
```

**Fix**: Pastikan `public/sw.js` ada dan accessible

### Issue: Permission denied

**Solusi**:
1. Browser settings → Site settings
2. Cari domain production
3. Allow notifications
4. Reload page

### Issue: Notifikasi tidak muncul di mobile

**Cek**:
- HTTPS required (production harus HTTPS)
- Browser support (Safari iOS limited)
- Permission granted
- Service Worker active

## Best Practices Production

1. **Jangan deploy file test ke production** (atau protect dengan auth)
2. **Monitor error logs** untuk notification failures
3. **Graceful degradation** jika browser tidak support
4. **Rate limiting** untuk API calls
5. **User feedback** jika permission denied

## Analytics (Optional)

Track notification effectiveness:

```javascript
// Di lib/notifications.js
export const sendNotification = async (title, options) => {
    // ... existing code ...
    
    // Track
    if (window.gtag) {
        gtag('event', 'notification_sent', {
            title: title,
            tag: options.tag
        });
    }
};
```

## Kesimpulan

Untuk production testing:
- **Tercepat**: Browser console script
- **Terlengkap**: Deploy test-notifications.html
- **Terintegrasi**: Buat Next.js page

Pilih sesuai kebutuhan!
