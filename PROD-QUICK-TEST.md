# ⚡ Production Quick Test

## Cara Tercepat Test di Production

### Metode 1: Akses File Test (Paling Mudah)

```
https://your-domain.com/test-notifications.html
```

Klik tombol-tombol secara berurutan seperti di development.

### Metode 2: Console Script (30 Detik)

1. Buka production site
2. Tekan **F12** (DevTools)
3. Paste script ini di **Console**:

```javascript
(async()=>{localStorage.setItem('notif_enabled','true');if(Notification.permission==='default')await Notification.requestPermission();if(Notification.permission==='granted'){new Notification('Test',{body:'Working!'});console.log('✅ Test sent!')}const b=JSON.parse(localStorage.getItem('bookmarks')||'[]'),h={},u='https://unofficial-komikcast-api.vercel.app';for(const s of b){const r=await fetch(`${u}/series/${s.data.slug}/chapters`),d=await r.json();if(d?.data?.[0])h[s.data.slug]=d.data[0].data?.index||d.data[0].chapterIndex}localStorage.setItem('update_history',JSON.stringify(h));console.log('✅ Done!',h)})();
```

4. Done! Notifikasi akan bekerja otomatis.

### Metode 3: Manual Step-by-Step

```javascript
// 1. Enable
localStorage.setItem('notif_enabled', 'true');

// 2. Permission
await Notification.requestPermission();

// 3. Test
new Notification('Test', { body: 'Hello!' });

// 4. Init history (paste script dari Metode 2)
```

## Simulasi Update (Testing)

Setelah inisialisasi, jalankan ini untuk test notifikasi:

```javascript
const h = JSON.parse(localStorage.getItem('update_history') || '{}');
const slug = Object.keys(h)[0];
if (slug) {
    h[slug] = parseInt(h[slug]) - 1;
    localStorage.setItem('update_history', JSON.stringify(h));
    console.log('✅ Reload page untuk trigger notifikasi');
}
```

Lalu **reload page**.

## Cek Status

```javascript
console.table({
    'Notif Enabled': localStorage.getItem('notif_enabled'),
    'Permission': Notification.permission,
    'Bookmarks': JSON.parse(localStorage.getItem('bookmarks')||'[]').length,
    'History': Object.keys(JSON.parse(localStorage.getItem('update_history')||'{}')).length
});
```

## Troubleshooting

**Notifikasi tidak muncul?**
```javascript
// Cek permission
console.log(Notification.permission); // Harus 'granted'

// Cek data
console.log(localStorage.getItem('notif_enabled')); // Harus 'true'
console.log(JSON.parse(localStorage.getItem('update_history')||'{}')); // Harus ada data
```

**Reset jika perlu:**
```javascript
localStorage.removeItem('update_history');
// Lalu jalankan init script lagi
```

## File Locations

- Test UI: `/test-notifications.html` (di public folder)
- Docs: `TESTING-PRODUCTION.md` (detail lengkap)
- Quick: `PROD-QUICK-TEST.md` (file ini)

## Support

- Desktop: Chrome, Firefox, Edge ✅
- Mobile: Chrome Android ✅, Safari iOS ⚠️ (limited)
- Requires: HTTPS (production), Permission granted
