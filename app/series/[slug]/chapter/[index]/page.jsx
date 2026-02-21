'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  Play,
  X,
  Search,
} from 'lucide-react';
import { getChapterDetail, getSeriesChapters } from '@/lib/api';
import { useMemo } from 'react';

const Page = () => {
  const { slug, index } = useParams();
  const router = useRouter();

  const [chapterDetail, setChapterDetail] = useState(null);
  const [chaptersList, setChaptersList] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chapterRes, chaptersRes] = await Promise.all([
          getChapterDetail(slug, index),
          getSeriesChapters(slug),
        ]);

        if (chapterRes && chapterRes.data) {
          setChapterDetail(chapterRes.data);
        }
        if (chaptersRes && chaptersRes.data) {
          setChaptersList(chaptersRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    }
  }, [slug, index, loading, chapterDetail]);

  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return chaptersList;
    return chaptersList.filter((ch) =>
      ch.data.index.toString().includes(chapterSearch.trim()),
    );
  }, [chaptersList, chapterSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4"></div>
        <p>Loading Chapter...</p>
      </div>
    );
  }

  if (!chapterDetail || !chapterDetail.data?.images) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-50 gap-4">
        <h1 className="text-2xl font-bold">Chapter Not Found</h1>
        <Link
          href={`/series/${slug}`}
          className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition"
        >
          Back to Series
        </Link>
      </div>
    );
  }

  // Navigation Logic
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-neutral-800/50 shadow-sm transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
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
            <h1 className="text-sm font-bold text-neutral-200 truncate">
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
              src={`/api/proxy?url=${encodeURIComponent(src)}`}
              alt={`Page ${i + 1}`}
              className="w-full h-auto object-contain block"
              loading="lazy"
            />
          </div>
        ))}
      </main>

      {/* Floating Navigation Controls */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showNav ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-[#111111]/95 backdrop-blur-md px-6 py-3.5 rounded-full flex items-center justify-center gap-6 sm:gap-8 border border-neutral-800 shadow-2xl transition-all">
          {/* Previous Chapter */}
          <button
            onClick={() =>
              prevChapter &&
              router.push(`/series/${slug}/chapter/${prevChapter.data.index}`)
            }
            disabled={!prevChapter}
            className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Play className="w-5 h-5" />

          {/* List - List Chapter */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-neutral-400 hover:text-white transition-colors"
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
            className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400"
            title="Next Chapter"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chapter Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="number"
                  placeholder="Search chapter..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700">
                {filteredChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      router.push(`/series/${slug}/chapter/${ch.data.index}`);
                      setIsModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-sm font-bold transition-all ${ch.data.index.toString() === index.toString()
                      ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'
                      }`}
                  >
                    Ch. {ch.data.index}
                  </button>
                ))}
                {filteredChapters.length === 0 && (
                  <div className="col-span-full py-10 text-center text-neutral-500">
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
