// KomikMeh Service Worker — PWA offline shell + notifications
const CACHE_NAME = 'komikmeh-shell-v2';
const SHELL_URLS = ['/', '/manifest.json', '/favicon.svg', '/icon-192x192.png'];

const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Only handle same-origin app assets. API data and CDN images (covers,
    // chapter pages) always go straight to the network.
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/image')) return;
    if (isDev) return; // never cache during local dev

    // Network-first for the app shell: fresh when online, cached when offline
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok && (response.type === 'basic' || response.type === 'default')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(request).then((cached) => cached || caches.match('/'))
            )
    );
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
