import { getSeriesChapters } from './api';

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNotification = async (title, options) => {
    if (Notification.permission !== 'granted') {
        return;
    }

    // Cek apakah service worker tersedia (untuk mobile)
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                vibrate: [200, 100, 200],
                ...options,
            });
        } catch (err) {
            console.error('Service Worker notification failed:', err);
            // Fallback ke notifikasi biasa
            new Notification(title, {
                icon: '/icon-192x192.png',
                ...options,
            });
        }
    } else {
        // Fallback untuk desktop atau browser yang tidak support SW
        new Notification(title, {
            icon: '/icon-192x192.png',
            ...options,
        });
    }
};

export const checkForUpdates = async () => {
    // Cek apakah notifikasi diaktifkan
    const notifEnabled = localStorage.getItem('notif_enabled');
    if (notifEnabled !== 'true') {
        return 0;
    }

    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (bookmarks.length === 0) return 0;

    const updateHistory = JSON.parse(localStorage.getItem('update_history') || '{}');
    const newUpdates = [];

    for (const series of bookmarks) {
        try {
            const slug = series.data.slug;
            const res = await getSeriesChapters(slug);

            if (res && res.data && res.data.length > 0) {
                const latestChapter = res.data[0];
                const chapterIndex = latestChapter.data?.index || latestChapter.chapterIndex;
                const lastKnown = updateHistory[slug];

                // Jika belum ada history, inisialisasi tanpa notifikasi
                if (!lastKnown) {
                    console.log(`Initializing history for ${series.data.title}: Chapter ${chapterIndex}`);
                    updateHistory[slug] = chapterIndex;
                } else if (chapterIndex.toString() !== lastKnown.toString()) {
                    // Ada update, kirim notifikasi
                    newUpdates.push({
                        title: series.data.title,
                        chapter: chapterIndex,
                        slug: slug
                    });
                    updateHistory[slug] = chapterIndex;
                }
            }
        } catch (err) {
            console.error(`Failed to check updates for ${series.data.title}:`, err);
        }
    }

    localStorage.setItem('update_history', JSON.stringify(updateHistory));

    if (newUpdates.length > 0) {
        // Save to notifications list
        const notificationsList = JSON.parse(localStorage.getItem('notifications') || '[]');
        const currentTimestamp = Date.now();
        
        newUpdates.forEach(update => {
            notificationsList.unshift({
                ...update,
                id: `notif-${update.slug}-${update.chapter}-${currentTimestamp}`,
                timestamp: currentTimestamp,
                is_read: false
            });
        });
        
        localStorage.setItem('notifications', JSON.stringify(notificationsList));

        if (newUpdates.length === 1) {
            sendNotification(`Chapter Baru! ${newUpdates[0].title}`, {
                body: `Chapter ${newUpdates[0].chapter} sudah tersedia.`,
                tag: `update-${newUpdates[0].slug}`
            });
        } else {
            sendNotification(`${newUpdates.length} Komik Update!`, {
                body: `${newUpdates.map(u => u.title).join(', ')} baru saja update.`,
                tag: 'bulk-update'
            });
        }
    }

    return newUpdates.length;
};

// Function untuk testing notifikasi
export const testNotification = () => {
    if (Notification.permission === 'granted') {
        sendNotification('Test Notifikasi', {
            body: 'Notifikasi berhasil! Sistem notifikasi berfungsi dengan baik.',
            tag: 'test-notification'
        });
        return true;
    }
    return false;
};
