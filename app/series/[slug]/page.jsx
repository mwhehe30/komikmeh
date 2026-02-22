'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Clock,
  List,
  Search,
  ArrowUpDown,
  ArrowLeft,
  Bookmark
} from 'lucide-react';
import { getSeriesDetail, getSeriesChapters } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

const Page = () => {
  const { slug } = useParams();
  const [detail, setDetail] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // States for Chapter List Features
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [readHistory, setReadHistory] = useState([]);

  useEffect(() => {
    const historyKey = `read_history_${slug}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setReadHistory(history);

    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.some((b) => b.data.slug === slug));
  }, [slug]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let next;
    if (isBookmarked) {
      next = bookmarks.filter((b) => b.data.slug !== slug);
    } else {
      const bData = {
        id: detail.id,
        data: {
          title: detail.data.title,
          slug: detail.data.slug,
          coverImage: detail.data.coverImage,
          format: detail.data.format,
          rating: detail.data.rating
        }
      };
      next = [bData, ...bookmarks];
    }
    localStorage.setItem('bookmarks', JSON.stringify(next));
    setIsBookmarked(!isBookmarked);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [detailRes, chaptersRes] = await Promise.all([
          getSeriesDetail(slug),
          getSeriesChapters(slug),
        ]);
        if (detailRes && detailRes.data) {
          setDetail(detailRes.data);
        }
        if (chaptersRes && chaptersRes.data) {
          setChapters(chaptersRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const filteredAndSortedChapters = useMemo(() => {
    let result = [...chapters];

    // Search by chapter number
    if (searchQuery.trim() !== '') {
      result = result.filter((ch) =>
        ch.data.index.toString().includes(searchQuery.trim()),
      );
    }

    // Sort chapters
    result.sort((a, b) => {
      const idxA = parseFloat(a.data.index);
      const idxB = parseFloat(b.data.index);
      if (sortOrder === 'asc') {
        return idxA - idxB;
      } else {
        return idxB - idxA;
      }
    });

    return result;
  }, [chapters, searchQuery, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-neutral-900 dark:text-neutral-50 gap-4">
        <h1 className="text-2xl font-bold">Series Not Found</h1>
        <Link
          href="/"
          className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 pb-20">
      {/* Hero Section with Blurred Background */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden bg-black">
        {detail.data?.backgroundImage || detail.data?.coverImage ? (
          <>
            <Image
              src={detail.data.backgroundImage || detail.data.coverImage}
              alt="Background"
              fill
              className="object-cover opacity-40 blur-md scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 via-transparent to-transparent" />
          </>
        ) : null}

        {/* Breadcrumb & Navigation */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium transition-colors border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Cover Image */}
          <div className="shrink-0 mx-auto md:mx-0 w-48 sm:w-64">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-800">
              {detail.data?.coverImage && (
                <Image
                  src={detail.data.coverImage}
                  alt={detail.data.title || 'Cover'}
                  fill
                  sizes="(max-width: 640px) 192px, 256px"
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col pt-2 sm:pt-16 md:pt-32">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {detail.data?.format && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-full shadow-sm">
                  {detail.data.format.toLowerCase().trim() === 'webtoon' ? 'mangatoon' : detail.data.format}
                </span>
              )}
              {detail.data?.status && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full">
                  {detail.data.status}
                </span>
              )}
              {detail.data?.rating && (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 rounded-full font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {detail.data.rating}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                {detail.data?.title}
              </h1>
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg ${isBookmarked
                  ? 'bg-red-500 text-white shadow-red-500/20'
                  : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            {detail.data?.nativeTitle && (
              <h2 className="text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-4 line-clamp-2">
                {detail.data.nativeTitle}
              </h2>
            )}

            <div className="flex items-center gap-4 text-sm font-medium mb-6 text-neutral-600 dark:text-neutral-300">
              {detail.data?.author && (
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400">By</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {detail.data.author}
                  </span>
                </div>
              )}
              {detail.data?.releaseDate && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{detail.data.releaseDate}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {detail.data?.genres && detail.data.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {detail.data.genres.map((g) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300"
                  >
                    {g.data?.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Synopsis */}
            {detail.data?.synopsis && (
              <section>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Synopsis
                </h3>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {detail.data.synopsis.split(/\\r\\n|\\n/).map((p, i) => (
                    <p key={i} className="mb-4">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Chapters List */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <List className="w-6 h-6 text-purple-500" />
                  Chapters
                  <span className="text-neutral-400 text-lg font-medium ml-2">
                    ({chapters.length})
                  </span>
                </h3>

                {/* Search and Sort Controls */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="number"
                      placeholder="Cari chapter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow"
                    />
                  </div>
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ArrowUpDown className="w-4 h-4 text-neutral-500" />
                    <span className="hidden sm:inline-block">
                      {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-3 sm:p-5">
                {filteredAndSortedChapters.length > 0 ? (
                  <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 hover:scrollbar-thumb-purple-500/50 scrollbar-track-transparent pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {filteredAndSortedChapters.map((ch) => {
                        const isRead = readHistory.includes(ch.data.index.toString());
                        return (
                          <Link
                            key={ch.id}
                            href={`/series/${slug}/chapter/${ch.data.index}`}
                            className={`group flex flex-col justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 ${isRead
                              ? 'bg-neutral-50/50 dark:bg-neutral-800/20 border-neutral-100 dark:border-neutral-800/40 opacity-60'
                              : 'bg-neutral-50 hover:bg-purple-50 dark:bg-neutral-800/40 dark:hover:bg-purple-900/20 border-neutral-100 hover:border-purple-200 dark:border-neutral-800/60 dark:hover:border-purple-800/50'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`font-bold transition-colors text-sm ${isRead
                                ? 'text-neutral-500 dark:text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                                }`}>
                                Chapter {ch.data.index}
                              </span>
                              {!isRead && new Date() - new Date(ch.createdAt) <
                                3 * 24 * 60 * 60 * 1000 && (
                                  <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded flex items-center">
                                    NEW
                                  </span>
                                )}
                            </div>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {formatDistanceToNow(new Date(ch.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                    No chapters found matching &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-lg mb-4">Details</h4>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Views
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {detail.dataMetadata?.totalViews?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Bookmarks
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {detail.dataMetadata?.bookmarkCount?.toLocaleString() ||
                      'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Updated
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(detail.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
