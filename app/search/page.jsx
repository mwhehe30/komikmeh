'use client';

import KomikCard from '@/components/KomikCard';
import { SearchKomik } from '@/lib/api';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const [query, setQuery] = useState(q);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) handleSearch(query);
  }, [query]);

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await SearchKomik(searchQuery);
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('query');
    setQuery(searchQuery);

    // update URL tanpa refresh
    const params = new URLSearchParams(window.location.search);
    params.set('q', searchQuery);
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  return (
    <main className='min-h-screen pb-24 pt-24 container mx-auto px-4'>
      <div className='max-w-2xl mx-auto mb-12 text-center'>
        <h1 className='text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6'>
          Cari Komik
        </h1>

        <form onSubmit={handleSubmit} className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-r from-primary/20 to-violet-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all'>
            <Search className='w-5 h-5 text-gray-400 ml-4' />
            <input
              type='text'
              name='query'
              defaultValue={query}
              placeholder='Cari judul komik...'
              className='flex-1 bg-transparent border-none text-white placeholder-gray-500 px-4 py-2 focus:outline-none focus:ring-0'
              autoComplete='off'
            />
            <button
              type='submit'
              className='px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-all shadow-lg shadow-primary/20'
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className='aspect-[3/4] bg-zinc-800/50 rounded-xl animate-pulse'
            />
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
              Hasil pencarian untuk "{query}" ({results.length})
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
              {results.map((komik, index) => (
                <KomikCard komik={komik} key={index} />
              ))}
            </div>
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
              Maaf, kami tidak dapat menemukan komik dengan kata kunci "{query}"
            </p>
          </div>
        )
      ) : (
        !loading &&
        !query && (
          <div className='flex flex-col items-center justify-center py-20 text-center opacity-50'>
            <Search className='w-16 h-16 text-gray-600 mb-4' />
            <p className='text-gray-500'>
              Ketik judul komik untuk mulai mencari
            </p>
          </div>
        )
      )}
    </main>
  );
};

export default SearchPage;
