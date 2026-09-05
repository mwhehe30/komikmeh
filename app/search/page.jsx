'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchSeries, getGenres } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Bookmark, Search, X, Filter as FilterIcon, ChevronDown } from 'lucide-react';
import SkeletonCard from '@/components/SkeletonCard';
import ErrorState from '@/components/ErrorState';

export default function SearchPage() {
  const TAKE = 18;

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [results, setResults] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isRestored, setIsRestored] = useState(false);
  
  const observerRef = useRef(null);
  const bootedRef = useRef(false);
  const prevKeyRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      // Load genre list first so restored state can be mapped name -> id
      let genreList = [];
      try {
        const res = await getGenres();
        genreList = res.data || [];
        setGenres(genreList);
      } catch (err) {
        console.error(err);
      }

      const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setBookmarks(savedBookmarks);

      // Restore state from sessionStorage
      const savedState = sessionStorage.getItem('explore_page_state');
      if (savedState) {
        const { 
          query: sQuery, 
          selectedGenres: sGenres, 
          selectedStatus: sStatus, 
          selectedType: sType,
          results: sResults,
          offset: sOffset,
          hasMore: sHasMore,
          scrollPos 
        } = JSON.parse(savedState);
        
        setQuery(sQuery);
        // Selected genres are stored as ids; map legacy names to ids
        setSelectedGenres(
          (sGenres || [])
            .map((g) =>
              typeof g === 'number'
                ? g
                : genreList.find((genre) => genre.name === g)?.id,
            )
            .filter((id) => id != null),
        );
        setSelectedStatus(sStatus);
        setSelectedType(sType);
        setResults(sResults);
        setOffset(sOffset);
        setHasMore(sHasMore);
        setIsRestored(true);

        // Restore scroll position with retries
        const restoreScroll = (retryCount = 0) => {
          window.scrollTo({ top: scrollPos, behavior: 'instant' });
          if (Math.abs(window.scrollY - scrollPos) > 10 && retryCount < 20) {
            setTimeout(() => restoreScroll(retryCount + 1), 100);
          }
        };
        setTimeout(restoreScroll, 100);
      } else {
        handleSearch();
      }

      // Boot complete: mark the current (default) search as done so the
      // debounced effect below doesn't immediately fire a duplicate request.
      bootedRef.current = true;
      prevKeyRef.current = JSON.stringify([query, selectedGenres, selectedStatus, selectedType]);
    };

    init();
  }, []);

  // Save state to sessionStorage
  const saveState = () => {
    const state = {
      query,
      selectedGenres,
      selectedStatus,
      selectedType,
      results,
      offset,
      hasMore,
      scrollPos: window.scrollY
    };
    sessionStorage.setItem('explore_page_state', JSON.stringify(state));
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
        const bData = {
          id: item.id,
          data: {
            title: item.data?.title || item.title,
            slug: item.data?.slug || item.slug,
            coverImage: item.data?.coverImage || item.coverImage,
            format: item.data?.format || item.format,
            rating: item.data?.rating || item.rating
          }
        };
        next = [bData, ...prev];
      }
      localStorage.setItem('bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((g) => g !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    setLoading(true);
    setOffset(0);
    setResults([]);
    setError(null);
    
    try {
      const filters = {
        genreIds: selectedGenres,
        status: selectedStatus,
        type: selectedType
      };
      const res = await searchSeries(query, 0, TAKE, filters);
      setResults(res.data);
      setTotal(res.total ?? res.data.length);
      setOffset(TAKE);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
      setError('Gagal mencari komik. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Live search: debounce while typing, react immediately to filter changes
  useEffect(() => {
    if (!bootedRef.current) return;

    if (isRestored) {
      setIsRestored(false);
      return;
    }

    const key = JSON.stringify([query, selectedGenres, selectedStatus, selectedType]);
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    const timer = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedGenres, selectedStatus, selectedType]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
      const filters = {
        genreIds: selectedGenres,
        status: selectedStatus,
        type: selectedType
      };
      const res = await searchSeries(query, offset, TAKE, filters);
      setResults((prev) => {
        const map = new Map();
        prev.forEach((item) => map.set(item.id, item));
        res.data.forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      });
      setTotal(res.total);
      setOffset((prev) => prev + TAKE);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat hasil berikutnya. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading, query]);

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Explore</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                showFilters || selectedGenres.length > 0 || selectedStatus || selectedType
                  ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              <span className="text-sm font-bold">Filters</span>
              {(selectedGenres.length > 0 || selectedStatus || selectedType) && (
                <span className="flex items-center justify-center w-5 h-5 bg-black text-amber-400 rounded-full text-[10px] font-black">
                  {(selectedGenres.length > 0 ? 1 : 0) + (selectedStatus ? 1 : 0) + (selectedType ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for titles, authors, genres..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all shadow-sm group-hover:border-neutral-700 text-white placeholder:text-neutral-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Collapsible Filter Section */}
          {showFilters && (
            <div className="space-y-6 bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Status</label>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full appearance-none bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Hiatus">Hiatus</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Type</label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full appearance-none bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    >
                      <option value="">All Types</option>
                      <option value="Manga">Manga</option>
                      <option value="Manhwa">Manhwa</option>
                      <option value="Manhua">Manhua</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Genres</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                        selectedGenres.includes(genre.id)
                          ? 'bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-400/20'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-400/50 hover:text-white'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setSelectedGenres([]);
                    setSelectedStatus('');
                    setSelectedType('');
                  }}
                  className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-white transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-neutral-200 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </header>

        {error && !loading && results.length === 0 ? (
          <ErrorState onRetry={handleSearch} />
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-neutral-500 mb-4">
              {total != null ? `${total.toLocaleString()} results` : `${results.length} results`}
            </p>
            {error && (
              <ErrorState
                compact
                message="Gagal memuat hasil berikutnya. Periksa koneksi Anda."
                onRetry={handleSearch}
              />
            )}
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((item) => (
              <li
                key={item.id}
                className="group relative flex flex-col bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-400/5 transition-all duration-300 ease-in-out border border-neutral-800 hover:border-neutral-700"
              >
                <Link 
                  href={`/series/${item.data?.slug || item.slug}`}
                  onClick={saveState}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-800">
                    <Image
                      src={item.data?.coverImage || item.coverImage}
                      alt={item.data?.title || item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    
                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => toggleBookmark(e, item)}
                      className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all"
                    >
                      <Bookmark
                        className={`w-4 h-4 transition-all ${bookmarks.some(b => b.id === item.id) ? 'fill-amber-400 text-amber-400 scale-110' : 'text-white'}`}
                      />
                    </button>

                    {(item.data?.rating || item.rating) && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded-md shadow-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="text-[11px] font-bold text-white">{item.data?.rating || item.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-bold text-neutral-100 text-sm line-clamp-2 group-hover:text-amber-400 transition-colors">
                      {item.data?.title || item.title}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
            </ul>
          </>
        ) : loading && results.length === 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
          </ul>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-neutral-700 mb-4" />
            <p className="text-neutral-500">No results found</p>
          </div>
        )}

        <div ref={observerRef} className="h-10 w-full mt-4" />
      </div>
    </main>
  );
}
