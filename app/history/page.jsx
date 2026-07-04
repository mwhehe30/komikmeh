'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, ArrowLeft, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('global_history') || '[]');
        setHistory(saved);
        setLoading(false);
    }, []);

    const removeHistory = (e, slug) => {
        e.preventDefault();
        e.stopPropagation();
        const next = history.filter((h) => h.slug !== slug);
        setHistory(next);
        localStorage.setItem('global_history', JSON.stringify(next));
    };

    const clearAllHistory = () => {
        if (confirm("Are you sure you want to clear all reading history?")) {
            setHistory([]);
            localStorage.setItem('global_history', JSON.stringify([]));
        }
    };

    const handleImageError = async (slug) => {
        try {
            const { getSeriesDetail } = await import('@/lib/api');
            const detail = await getSeriesDetail(slug);
            if (detail?.data?.coverImage) {
                const newImage = detail.data.coverImage;
                
                setHistory(prev => {
                    const next = prev.map(h => {
                        if (h.slug === slug) {
                            return { ...h, coverImage: newImage };
                        }
                        return h;
                    });
                    localStorage.setItem('global_history', JSON.stringify(next));
                    return next;
                });
            }
        } catch (err) {
            console.error("Failed to refresh image for", slug, err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                            <div className="p-3 bg-amber-400/10 rounded-2xl">
                                <History className="w-8 h-8 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">Reading History</h1>
                                <p className="text-neutral-500 mt-1">
                                    You have {history.length} read series
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {history.length > 0 && (
                        <button
                            onClick={clearAllHistory}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors shadow-sm self-start md:self-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Clear All</span>
                        </button>
                    )}
                </header>

                {history.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                        {history.map((item) => (
                            <li
                                key={item.slug}
                                className="group relative flex flex-col bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-400/5 transition-all duration-300 ease-in-out border border-neutral-800 hover:border-neutral-700"
                            >
                                <Link href={`/series/${item.slug}`}>
                                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-800">
                                        {item.coverImage ? (
                                            <Image
                                                src={item.coverImage}
                                                alt={item.title}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    if (e.target.getAttribute('data-error')) return;
                                                    e.target.setAttribute('data-error', 'true');
                                                    handleImageError(item.slug);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => removeHistory(e, item.slug)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-neutral-300 hover:text-red-400 hover:bg-black/80 transition-all z-10 opacity-0 group-hover:opacity-100"
                                            title="Remove from history"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {/* Content overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h2
                                                className="font-bold text-white leading-tight line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors drop-shadow-md text-sm sm:text-base"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </h2>
                                            <div className="flex items-center gap-3 text-xs font-medium text-neutral-300">
                                                <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                                    <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">Ch</span>
                                                    <span className="text-white">{item.last_read_chapter}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-neutral-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                
                                <Link 
                                    href={`/series/${item.slug}/chapter/${item.last_read_chapter}`}
                                    className="block text-center py-2 bg-amber-400 text-black font-semibold text-sm hover:bg-amber-500 transition-colors"
                                >
                                    Continue Reading
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800/50 shadow-inner">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-neutral-900 border border-neutral-800 mb-6 shadow-xl">
                            <History className="w-10 h-10 text-neutral-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-white">No Reading History</h2>
                        <p className="text-neutral-400 max-w-sm mx-auto leading-relaxed mb-8">
                            You haven't read any comics yet. Start exploring and your history will appear here.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-xl text-black bg-amber-400 hover:bg-amber-500 transition-all duration-200 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:-translate-y-0.5"
                        >
                            Explore Comics
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
