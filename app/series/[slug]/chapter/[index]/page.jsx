'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  X,
  Search,
} from 'lucide-react';
import { getChapterDetail, getSeriesChapters, getSeriesDetail } from '@/lib/api';
import { useMemo } from 'react';
import ErrorState from '@/components/ErrorState';

const Page = () => {
  const { slug, index } = useParams();
  const router = useRouter();

  const [chapterDetail, setChapterDetail] = useState(null);
  const [seriesDetail, setSeriesDetail] = useState(null);
  const [chaptersList, setChaptersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowNav(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [chapterRes, chaptersRes, seriesRes] = await Promise.all([
        getChapterDetail(slug, index),
        getSeriesChapters(slug),
        getSeriesDetail(slug)
      ]);

      if (chapterRes && chapterRes.data) {
        setChapterDetail(chapterRes.data);
      }
      if (chaptersRes && chaptersRes.data) {
        setChaptersList(chaptersRes.data);
      }
      if (seriesRes && seriesRes.data) {
        setSeriesDetail(seriesRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat chapter. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, index]);

  // Track History
  useEffect(() => {
    if (!loading && chapterDetail) {
      const historyKey = `read_history_${slug}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (!history.includes(index.toString())) {
        const newHistory = [...history, index.toString()];
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
      }

      if (seriesDetail) {
        const globalHistory = JSON.parse(localStorage.getItem('global_history') || '[]');
        const currentItem = {
          slug: slug,
          title: seriesDetail.title || seriesDetail.data?.title || slug,
          coverImage: seriesDetail.coverImage || seriesDetail.data?.coverImage || '',
          last_read_chapter: index.toString(),
          timestamp: Date.now()
        };
        const filteredHistory = globalHistory.filter(h => h.slug !== slug);
        filteredHistory.unshift(currentItem);
        localStorage.setItem('global_history', JSON.stringify(filteredHistory));
      }
    }
  }, [slug, index, loading, chapterDetail, seriesDetail]);

  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return chaptersList;
    return chaptersList.filter((ch) =>
      ch.data.index.toString().includes(chapterSearch.trim()),
    );
  }, [chaptersList, chapterSearch]);

  // Komikcast usually sorts chapters descending (latest first).
  const currentIndex = chaptersList.findIndex(
    (ch) => ch.data.index.toString() === index.toString(),
  );

  let nextChapter = null; // Next in story (older item in array if descending)
  let prevChapter = null; // Previous in story

  if (currentIndex !== -1) {
    if (currentIndex > 0) {
      nextChapter = chaptersList[currentIndex - 1]; // "Next" chapter is index - 1 in array
    }
    if (currentIndex < chaptersList.length - 1) {
      prevChapter = chaptersList[currentIndex + 1]; // "Prev" chapter is index + 1 in array
    }
  }

  // Keyboard navigation (left/right arrows jump chapters)
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (isModalOpen) return;
      if (e.key === 'ArrowRight' && nextChapter) {
        router.push(`/series/${slug}/chapter/${nextChapter.data.index}`);
      } else if (e.key === 'ArrowLeft' && prevChapter) {
        router.push(`/series/${slug}/chapter/${prevChapter.data.index}`);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slug, nextChapter, prevChapter, isModalOpen, router]);

  // Remember scroll position per chapter and restore it when re-opening
  const scrollKey = `reader_scroll_${slug}_${index}`;
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(scrollKey, String(window.scrollY));
      } catch { /* storage may be unavailable */ }
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        save();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      save();
    };
  }, [scrollKey]);

  useEffect(() => {
    if (loading || !chapterDetail) return;
    let saved = 0;
    try {
      saved = Number(localStorage.getItem(scrollKey)) || 0;
    } catch { /* storage may be unavailable */ }
    if (saved <= 0) return;

    let attempts = 0;
    const tryRestore = () => {
      if (Math.abs(window.scrollY - saved) > 80) {
        window.scrollTo({ top: saved, behavior: 'instant' });
      }
      if (Math.abs(window.scrollY - saved) > 80 && attempts < 40) {
        attempts += 1;
        setTimeout(tryRestore, 150);
      }
    };
    const t = setTimeout(tryRestore, 100);
    return () => clearTimeout(t);
  }, [loading, chapterDetail, scrollKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4"></div>
        <p>Loading Chapter...</p>
      </div>
    );
  }

  if (error && !chapterDetail) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <ErrorState onRetry={load} />
        </div>
      </main>
    );
  }

  if (!chapterDetail || !chapterDetail.data?.images) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-2xl font-bold">Chapter Not Found</h1>
        <Link
          href={`/series/${slug}`}
          className="px-6 py-2 bg-amber-400 text-black rounded-full font-bold hover:bg-amber-500 transition"
        >
          Back to Series
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-300">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/series/${slug}`}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline-block">
              Back to Series
            </span>
          </Link>
          <div className="text-center truncate px-4 flex-1">
            <h1 className="text-sm font-bold text-neutral-100 truncate">
              Chapter {index}
            </h1>
          </div>
          <Link
            href="/"
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Images Container */}
      <main
        className="max-w-3xl mx-auto flex flex-col items-center select-none pb-8 pt-14 cursor-pointer"
        onClick={() => setShowNav((prev) => !prev)}
      >
        {chapterDetail.data.images.map((src, i) => (
          <div
            key={i}
            className="relative w-full min-h-[300px] flex items-center justify-center bg-neutral-900/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Page ${i + 1}`}
              className="w-full h-auto object-contain block"
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </main>

      {/* Floating Navigation Controls */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showNav ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-neutral-900/95 backdrop-blur-md px-6 py-3.5 rounded-full flex items-center justify-center gap-6 sm:gap-8 border border-neutral-800 shadow-2xl transition-all">
          {/* Previous Chapter */}
          <button
            onClick={() =>
              prevChapter &&
              router.push(`/series/${slug}/chapter/${prevChapter.data.index}`)
            }
            disabled={!prevChapter}
            className="flex items-center justify-center p-2 -m-2 rounded-full text-neutral-400 transition-all duration-150 hover:text-white hover:bg-white/10 active:bg-white/25 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 disabled:active:scale-100"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* List - Select Chapter (stays highlighted while the modal is open) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center justify-center p-2 -m-2 rounded-full transition-all duration-150 active:scale-90 ${
              isModalOpen
                ? 'bg-white/25 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/10 active:bg-white/25'
            }`}
            title="Select Chapter"
          >
            <List className="w-5 h-5 fill-current" />
          </button>

          {/* Next Chapter */}
          <button
            onClick={() =>
              nextChapter &&
              router.push(`/series/${slug}/chapter/${nextChapter.data.index}`)
            }
            disabled={!nextChapter}
            className="flex items-center justify-center p-2 -m-2 rounded-full text-neutral-400 transition-all duration-150 hover:text-white hover:bg-white/10 active:bg-white/25 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 disabled:active:scale-100"
            title="Next Chapter"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chapter Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Select Chapter</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-hidden flex flex-col">
              <div className="relative mb-4 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="number"
                  placeholder="Search chapter..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                {filteredChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      router.push(`/series/${slug}/chapter/${ch.data.index}`);
                      setIsModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-sm font-bold transition-all ${ch.data.index.toString() === index.toString()
                      ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-400/50 hover:text-white'
                      }`}
                  >
                    Ch. {ch.data.index}
                  </button>
                ))}
                {filteredChapters.length === 0 && (
                  <div className="col-span-full py-10 text-center text-neutral-600">
                    No chapters found for &quot;{chapterSearch}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
