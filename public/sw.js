// Minimal Service Worker for PWA compliance
const CACHE_NAME = 'komikmeh-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass-through for all requests
    event.respondWith(fetch(event.request));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification.tag);
    event.notification.close();
    
    // Buka halaman yang sesuai
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Cek apakah ada window yang sudah terbuka
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Jika tidak ada, buka window baru
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle push notification (untuk future implementation)
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Ada update baru!',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: data.tag || 'default',
            requireInteraction: false,
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'KomikMeh', options)
        );
    }
});
