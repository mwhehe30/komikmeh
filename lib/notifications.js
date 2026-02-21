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

export const sendNotification = (title, options) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/favicon.ico',
            ...options,
        });
    }
};

export const checkForUpdates = async () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (bookmarks.length === 0) return;

    const updateHistory = JSON.parse(localStorage.getItem('update_history') || '{}');
    const newUpdates = [];

    for (const series of bookmarks) {
        try {
            const slug = series.data.slug;
            const res = await getSeriesChapters(slug);

            if (res && res.data && res.data.length > 0) {
                const latestChapter = res.data[0];
                const lastKnown = updateHistory[slug];

                if (lastKnown && latestChapter.data.index.toString() !== lastKnown.toString()) {
                    newUpdates.push({
                        title: series.data.title,
                        chapter: latestChapter.data.index,
                        slug: slug
                    });
                }

                // Update local history
                updateHistory[slug] = latestChapter.data.index;
            }
        } catch (err) {
            console.error(`Failed to check updates for ${series.data.title}:`, err);
        }
    }

    localStorage.setItem('update_history', JSON.stringify(updateHistory));

    if (newUpdates.length > 0) {
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
};
