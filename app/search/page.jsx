'use client';

import KomikCard from '@/components/KomikCard';
import { Skeleton } from '@/components/Skeleton';
import { SearchKomik } from '@/lib/api';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';

  const [query, setQuery] = useState(q);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (q) {
      setQuery(q);
      setResults(null);
      setPage(1);
      setHasMore(false);
      handleSearch(q, 1, true);
    } else {
      setResults(null);
      setQuery('');
      setPage(1);
      setHasMore(false);
    }
  }, [q]);

  const handleSearch = async (searchQuery, pageToLoad = 1, replace = true) => {
    if (!searchQuery) return;

    if (pageToLoad === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);

    try {
      const { data, meta } = await SearchKomik(searchQuery, pageToLoad);

      setResults((prev) => {
        if (!prev || replace || pageToLoad === 1) {
          return data;
        }
        return [...prev, ...data];
      });

      const nextPage = meta?.pagination?.next_page;
      const currentPage = meta?.pagination?.current_page ?? pageToLoad;

      setPage(currentPage);
      setHasMore(Boolean(nextPage));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results');
    } finally {
      if (pageToLoad === 1) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!hasMore || loading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        handleSearch(query, page + 1, false);
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      }
    );

    const node = loadMoreRef.current;

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, isLoadingMore, query, page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('query');

    if (searchQuery && searchQuery.trim() !== '') {
      router.replace(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className='max-w-2xl mx-auto mb-12 text-center'>
        <h1 className='text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 mb-6'>
          Cari Komik
        </h1>

        <form onSubmit={handleSubmit} className='relative group'>
          <div className='absolute inset-0 bg-linear-to-r from-primary/20 to-violet-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 md:p-2 shadow-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all'>
            <Search className='w-4 h-4 md:w-5 md:h-5 text-gray-400 ml-2 md:ml-4 shrink-0' />
            <input
              type='text'
              name='query'
              defaultValue={query}
              placeholder='Cari judul komik...'
              className='flex-1 bg-transparent border-none text-white placeholder-gray-500 px-2 md:px-4 py-2 focus:outline-none focus:ring-0 text-sm md:text-base min-w-0'
              autoComplete='off'
            />
            <button
              type='submit'
              className='px-3 md:px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-all shadow-lg shadow-primary/20 text-sm md:text-base shrink-0'
            >
              <span className='hidden sm:inline'>Cari</span>
              <Search className='w-4 h-4 sm:hidden' />
            </button>
          </div>
        </form>
      </div>

      {loading && !results ? (
        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
          {[...Array(10)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='aspect-3/4 w-full rounded-xl' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className='text-center py-12'>
          <p className='text-red-400'>{error}</p>
        </div>
      ) : results ? (
        results.length > 0 ? (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold text-gray-300'>
              Hasil pencarian untuk &quot;{query}&quot;
            </h2>
            <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
              {results.map((komik, index) => (
                <KomikCard komik={komik} key={index} />
              ))}
            </div>
            {hasMore && (
              <div
                ref={loadMoreRef}
                className='flex justify-center items-center py-8'
              >
                {isLoadingMore && (
                  <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4'>
              <Search className='w-8 h-8 text-gray-500' />
            </div>
            <h3 className='text-xl font-semibold text-gray-300 mb-2'>
              Tidak ditemukan
            </h3>
            <p className='text-gray-500'>
              Maaf, kami tidak dapat menemukan komik dengan kata kunci &quot;
              {query}&quot;
            </p>
          </div>
        )
      ) : (
        <div className='flex flex-col items-center justify-center py-20 text-center opacity-50'>
          <Search className='w-16 h-16 text-gray-600 mb-4' />
          <p className='text-gray-500'>Ketik judul komik untuk mulai mencari</p>
        </div>
      )}
    </>
  );
};

const SearchPage = () => {
  return (
    <main className='min-h-screen pb-24 pt-24 container mx-auto px-4'>
      <Suspense
        fallback={
          <div className='flex justify-center py-20'>
            <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
};

export default SearchPage;
