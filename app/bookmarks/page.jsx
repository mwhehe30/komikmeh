'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, Bookmark, ArrowLeft, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            
            // Fetch fresh data untuk setiap bookmark
            const freshBookmarks = await Promise.all(
                saved.map(async (bookmark) => {
                    try {
                        const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${bookmark.data.slug}`);
                        if (res.ok) {
                            const freshData = await res.json();
                            return {
                                id: bookmark.id,
                                data: {
                                    title: freshData.data.title,
                                    slug: freshData.data.slug,
                                    coverImage: freshData.data.coverImage,
                                    format: freshData.data.format,
                                    rating: freshData.data.rating
                                }
                            };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch ${bookmark.data.slug}:`, err);
                    }
                    // Fallback ke data lama jika fetch gagal
                    return bookmark;
                })
            );
            
            setBookmarks(freshBookmarks);
            setLoading(false);
        };
        
        fetchBookmarks();
    }, []);

    const removeBookmark = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        const next = bookmarks.filter((b) => b.id !== id);
        setBookmarks(next);
        localStorage.setItem('bookmarks', JSON.stringify(next));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors mb-6 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-2xl">
                            <Bookmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight">My Bookmarks</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                                You have {bookmarks.length} saved series
                            </p>
                        </div>
                    </div>
                </header>

                {bookmarks.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                        {bookmarks.map((item) => (
                            <li
                                key={item.id}
                                className="group relative flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out border border-neutral-200 dark:border-neutral-800"
                            >
                                <Link href={`/series/${item.data.slug}`}>
                                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                                        <Image
                                            src={item.data.coverImage}
                                            alt={item.data.title}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                                            {item.data.format && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="relative w-6 h-6 rounded-md overflow-hidden shadow-sm backdrop-blur-md bg-black/20 flex items-center justify-center p-0.5 border border-white/10">
                                                        <Image
                                                            src={
                                                                item.data.format.toLowerCase().trim() === 'webtoon' ||
                                                                    item.data.format.toLowerCase().trim() === 'manga'
                                                                    ? '/manga.svg'
                                                                    : `/${item.data.format.toLowerCase().trim()}.svg`
                                                            }
                                                            alt={item.data.format}
                                                            width={24}
                                                            height={24}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => removeBookmark(e, item.id)}
                                            className="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                            title="Remove from bookmarks"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {item.data.rating && (
                                            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md shadow-sm z-10">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span className="text-[11px] font-medium text-white">
                                                    {item.data.rating}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1 p-3.5 z-20 bg-white dark:bg-neutral-900">
                                        <h3
                                            className="font-bold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                                            title={item.data.title}
                                        >
                                            {item.data.title}
                                        </h3>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 shadow-inner">
                        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No Bookmarks Yet</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-xs">
                            Save your favorite comics to access them easily and get notified of new chapters.
                        </p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Discover Series
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
