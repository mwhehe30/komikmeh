'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, Trash2, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
        setNotifications(saved);
        setLoading(false);
    }, []);

    const markAsReadAndNavigate = (e, notif) => {
        e.preventDefault();
        
        // Mark as read
        const updated = notifications.map(n => 
            n.id === notif.id ? { ...n, is_read: true } : n
        );
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
        
        // Navigate to chapter
        router.push(`/series/${notif.slug}/chapter/${notif.chapter}`);
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, is_read: true }));
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
    };

    const clearAll = () => {
        if (confirm("Are you sure you want to clear all notifications?")) {
            setNotifications([]);
            localStorage.setItem('notifications', JSON.stringify([]));
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors mb-6 shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="relative p-3 bg-amber-400/10 rounded-2xl">
                                <Bell className="w-8 h-8 text-amber-400" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black"></span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">Notifications</h1>
                                <p className="text-neutral-500 mt-1">
                                    You have {unreadCount} unread updates
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="flex gap-2 self-start md:self-auto">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/50 text-neutral-300 border border-neutral-700/50 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Mark all read</span>
                                </button>
                            )}
                            <button
                                onClick={clearAll}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        </div>
                    )}
                </header>

                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((item) => (
                            <a
                                key={item.id}
                                href={`/series/${item.slug}/chapter/${item.chapter}`}
                                onClick={(e) => markAsReadAndNavigate(e, item)}
                                className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                                    item.is_read 
                                    ? 'bg-neutral-900/40 border-neutral-800/50 hover:bg-neutral-900/80' 
                                    : 'bg-neutral-900 border-neutral-700 hover:border-amber-400/50 hover:bg-neutral-800'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${item.is_read ? 'bg-transparent' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`} />
                                    <div>
                                        <h3 className={`font-semibold mb-1 transition-colors ${item.is_read ? 'text-neutral-400' : 'text-white group-hover:text-amber-400'}`}>
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.is_read ? 'bg-neutral-800 text-neutral-500' : 'bg-amber-400/10 text-amber-400'}`}>
                                                Chapter {item.chapter}
                                            </span>
                                            <span className="flex items-center gap-1 text-neutral-500 text-xs">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${item.is_read ? 'text-neutral-700' : 'text-neutral-500 group-hover:text-amber-400'}`} />
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800/50 shadow-inner">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-neutral-900 border border-neutral-800 mb-6 shadow-xl">
                            <Bell className="w-10 h-10 text-neutral-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-white">No Notifications</h2>
                        <p className="text-neutral-400 max-w-sm mx-auto leading-relaxed mb-8">
                            You're all caught up! When a bookmarked comic has a new chapter, it will appear here.
                        </p>
                        <Link
                            href="/bookmarks"
                            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-xl text-black bg-amber-400 hover:bg-amber-500 transition-all duration-200 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:-translate-y-0.5"
                        >
                            View Bookmarks
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
