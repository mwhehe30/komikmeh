'use client';

import React, { useEffect } from 'react';
import { checkForUpdates, requestNotificationPermission } from '@/lib/notifications';

export default function NotificationHandler({ children }) {
    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(() => console.log('SW registered'))
                .catch((err) => console.log('SW registration failed:', err));
        }

        // Initial check after a short delay to not block main thread
        const timer = setTimeout(() => {
            checkForUpdates();
        }, 5000);

        // Check periodically every 30 minutes
        const interval = setInterval(() => {
            checkForUpdates();
        }, 30 * 60 * 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return <>{children}</>;
}
