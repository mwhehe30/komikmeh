# 🚀 Notification Testing Cheat Sheet

## Quick Access

### Development
```
http://localhost:3000/test-notifications.html
```

### Production
```
https://your-domain.com/test-notifications.html
```

## One-Liner Console Script

Paste ini di browser console (F12):

```javascript
(async()=>{localStorage.setItem('notif_enabled','true');if(Notification.permission==='default')await Notification.requestPermission();if(Notification.permission==='granted'){new Notification('Test',{body:'Working!'});console.log('✅')}const b=JSON.parse(localStorage.getItem('bookmarks')||'[]'),h={},u='https://unofficial-komikcast-api.vercel.app';for(const s of b){const r=await fetch(`${u}/series/${s.data.slug}/chapters`),d=await r.json();if(d?.data?.[0])h[s.data.slug]=d.data[0].data?.index||d.data[0].chapterIndex}localStorage.setItem('update_history',JSON.stringify(h));console.log('✅ Done!',h)})();
```

## Manual Commands

### Enable Notifications
```javascript
localStorage.setItem('notif_enabled', 'true');
```

### Request Permission
```javascript
await Notification.requestPermission();
```

### Test Notification
```javascript
new Notification('Test', { body: 'Hello!' });
```

### Check Status
```javascript
console.table({
    'Permission': Notification.permission,
    'Enabled': localStorage.getItem('notif_enabled'),
    'Bookmarks': JSON.parse(localStorage.getItem('bookmarks')||'[]').length,
    'History': Object.keys(JSON.parse(localStorage.getItem('update_history')||'{}')).length
});
```

### Initialize History
```javascript
const BASE_URL = 'https://unofficial-komikcast-api.vercel.app';
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
const history = {};

for (const s of bookmarks) {
    const res = await fetch(`${BASE_URL}/series/${s.data.slug}/chapters`);
    const data = await res.json();
    if (data?.data?.[0]) {
        history[s.data.slug] = data.data[0].data?.index || data.data[0].chapterIndex;
        console.log(`${s.data.title}: Chapter ${history[s.data.slug]}`);
    }
}

localStorage.setItem('update_history', JSON.stringify(history));
console.log('✅ Initialized:', Object.keys(history).length, 'series');
```

### Simulate Old History (Testing)
```javascript
const h = JSON.parse(localStorage.getItem('update_history') || '{}');
const slug = Object.keys(h)[0];
if (slug) {
    h[slug] = parseInt(h[slug]) - 1;
    localStorage.setItem('update_history', JSON.stringify(h));
    console.log('✅ Simulated. Reload page to test.');
}
```

### View Data
```javascript
// Bookmarks
console.log(JSON.parse(localStorage.getItem('bookmarks') || '[]'));

// History
console.log(JSON.parse(localStorage.getItem('update_history') || '{}'));

// Settings
console.log('Enabled:', localStorage.getItem('notif_enabled'));
```

### Reset
```javascript
// Reset history only
localStorage.removeItem('update_history');

// Reset all (CAREFUL!)
localStorage.clear();
```

## Troubleshooting

### Permission Denied
1. Browser settings → Site settings
2. Find your domain
3. Notifications → Allow
4. Reload page

### No Notifications
```javascript
// Check all requirements
const check = {
    'API Support': 'Notification' in window,
    'Permission': Notification.permission,
    'Enabled': localStorage.getItem('notif_enabled') === 'true',
    'Has Bookmarks': JSON.parse(localStorage.getItem('bookmarks')||'[]').length > 0,
    'Has History': Object.keys(JSON.parse(localStorage.getItem('update_history')||'{}')).length > 0
};
console.table(check);
// All should be true/granted
```

### Service Worker Issues
```javascript
// Check registration
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('Registered:', !!reg);
    console.log('Active:', !!reg?.active);
});

// Re-register
navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('✅ Re-registered');
});
```

## Testing Flow

1. Enable → `localStorage.setItem('notif_enabled', 'true')`
2. Permission → `await Notification.requestPermission()`
3. Test → `new Notification('Test', {body: 'Hi'})`
4. Initialize → Run init script
5. Simulate → Run simulate script
6. Reload → Check for notification

## Files Reference

| File | Purpose |
|------|---------|
| test-notifications.html | Full UI testing |
| QUICK-TEST.md | 5-minute guide |
| TESTING-NOTIFIKASI.md | Detailed docs |
| TESTING-PRODUCTION.md | Production guide |
| PROD-QUICK-TEST.md | Prod quick ref |
| TESTING-SUMMARY.md | Summary |
| CHEATSHEET.md | This file |

## Browser Support

✅ Chrome, Firefox, Edge, Opera
⚠️ Safari (limited on iOS)
❌ IE (not supported)

## Requirements Checklist

- [ ] HTTPS (production)
- [ ] Permission granted
- [ ] Notifications enabled
- [ ] Has bookmarks
- [ ] History initialized
- [ ] Service Worker active

## Quick Diagnosis

```javascript
// Run this to diagnose issues
(()=>{
    const issues = [];
    if (!('Notification' in window)) issues.push('❌ No Notification API');
    if (Notification.permission !== 'granted') issues.push('❌ Permission not granted');
    if (localStorage.getItem('notif_enabled') !== 'true') issues.push('❌ Not enabled');
    if (JSON.parse(localStorage.getItem('bookmarks')||'[]').length === 0) issues.push('⚠️ No bookmarks');
    if (Object.keys(JSON.parse(localStorage.getItem('update_history')||'{}')).length === 0) issues.push('⚠️ No history');
    
    if (issues.length === 0) {
        console.log('✅ All checks passed!');
    } else {
        console.log('Issues found:');
        issues.forEach(i => console.log(i));
    }
})();
```

---

**Pro Tip**: Bookmark this page for quick reference!
