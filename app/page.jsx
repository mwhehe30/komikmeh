'use client';

import React from 'react';
import { getSeries } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Bookmark, Bell, BellRing } from 'lucide-react';
import SkeletonCard from '@/components/SkeletonCard';
import { requestNotificationPermission } from '@/lib/notifications';

export default function Page() {
  const TAKE = 12;

  const [series, setSeries] = React.useState([]);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState([]);
  const [notifPermission, setNotifPermission] = React.useState('default');

  // Load bookmarks on mount
  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(saved);
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifPermission('granted');
    }
  };

  const toggleBookmark = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    setBookmarks((prev) => {
      const isBookmarked = prev.some((b) => b.id === item.id);
      let next;
      if (isBookmarked) {
        next = prev.filter((b) => b.id !== item.id);
      } else {
        // Save minimal data for the bookmarks page
        const bData = {
          id: item.id,
          data: {
            title: item.data.title,
            slug: item.data.slug,
            coverImage: item.data.coverImage,
            format: item.data.format,
            rating: item.data.rating
          }
        };
        next = [bData, ...prev];
      }
      localStorage.setItem('bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const observerRef = React.useRef(null);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await getSeries(offset, TAKE);

      // dedupe safety
      setSeries((prev) => {
        const map = new Map();

        prev.forEach((item) => map.set(item.id, item));

        res.data.forEach((item) => map.set(item.id, item));

        return Array.from(map.values());
      });

      setOffset((prev) => prev + TAKE);

      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // load pertama
  React.useEffect(() => {
    loadMore();
  }, []);

  // infinite scroll observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '200px',
      },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight inline-block">
            Latest Series
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRequestPermission}
              className={`p-2.5 rounded-2xl border transition-all shadow-sm ${notifPermission === 'granted'
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              title={notifPermission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
            >
              {notifPermission === 'granted' ? (
                <BellRing className="w-5 h-5 shadow-sm" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </button>
            <Link
              href="/bookmarks"
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
            >
              <Bookmark className="w-4 h-4 text-purple-500" />
              <span>My Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {bookmarks.length}
                </span>
              )}
            </Link>
          </div>
        </header>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
          {series.map((item) => (
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
                        <div className="relative w-6 h-6 rounded-md overflow-hidden shadow-sm backdrop-blur-md bg-black/20 flex items-center justify-center p-0.5 border border-white/10 group/flag translate-y-0 hover:-translate-y-0.5 transition-transform duration-300">
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
                        {item.chapters?.[0] &&
                          new Date() - new Date(item.chapters[0].updatedAt) <
                          24 * 60 * 60 * 1000 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black text-white bg-red-600 rounded-md shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse">
                              UP
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleBookmark(e, item)}
                    className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all group/bookmark"
                    title={bookmarks.some(b => b.id === item.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                  >
                    <Bookmark
                      className={`w-4 h-4 transition-all ${bookmarks.some(b => b.id === item.id)
                        ? 'fill-purple-500 text-purple-500 scale-110'
                        : 'text-white group-hover/bookmark:scale-110'
                        }`}
                    />
                  </button>

                  {item.data.rating && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md shadow-sm z-10">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-[11px] font-medium text-white">
                        {item.data.rating}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-3.5 z-20 bg-white dark:bg-neutral-900">
                  <h3
                    className="font-bold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                    title={item.data.title}
                  >
                    {item.data.title}
                  </h3>
                </div>
              </Link>
              {item.chapters && item.chapters.length > 0 && (
                <div className="px-3.5 pb-3.5 z-20 bg-white dark:bg-neutral-900 mt-auto">
                  <Link
                    href={`/series/${item.data.slug}/chapter/${item.chapters[0].data.index}`}
                    className="flex justify-between items-center px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 transition-colors border border-neutral-100 dark:border-neutral-700/50"
                  >
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 line-clamp-1 mr-2">
                      Ch. {item.chapters[0].data.index}
                    </span>
                    {item.chapters[0] &&
                      new Date() - new Date(item.chapters[0].updatedAt) <
                      24 * 60 * 60 * 1000 && (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded shrinks-0">
                          New
                        </span>
                      )}
                  </Link>
                </div>
              )}
            </li>
          ))}
          {loading &&
            Array.from({ length: series.length === 0 ? 12 : 6 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </ul>

        {/* trigger infinite scroll */}
        <div
          ref={observerRef}
          className="h-10 w-full mt-4 flex items-center justify-center"
        >
          {!loading && !hasMore && series.length > 0 && (
            <div className="px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Semua komik telah ditampilkan
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
