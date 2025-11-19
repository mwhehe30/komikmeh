'use client';

import UniversalImage from '@/components/UniversalImage';
import useHistoryStore from '@/store/useHistoryStore';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import id from 'timeago.js/lib/lang/id_ID';

timeago.register('id_ID', id);

export default function HistoryPage() {
  const { readChapters, clearHistory } = useHistoryStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className='min-h-screen pb-24 pt-20 container mx-auto px-4'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-zinc-800 rounded w-1/4'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-32 bg-zinc-800 rounded-xl'></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen pb-24 pt-20 container mx-auto px-4'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
          Riwayat Bacaan
        </h1>
        {readChapters.length > 0 && (
          <button
            onClick={clearHistory}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors'
          >
            <Trash2 className='w-4 h-4' />
            Hapus Riwayat
          </button>
        )}
      </div>

      {readChapters.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-[50vh] text-center'>
          <div className='w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4'>
            <span className='text-4xl'>📚</span>
          </div>
          <h2 className='text-xl font-semibold text-gray-300 mb-2'>
            Belum ada riwayat
          </h2>
          <p className='text-gray-500 max-w-xs'>
            Mulai baca komik favoritmu dan riwayat bacaanmu akan muncul di sini.
          </p>
          <Link
            href='/'
            className='mt-6 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-colors'
          >
            Jelajahi Komik
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {readChapters.map((item, index) => (
            <Link
              href={`/read/${item.slug}`}
              key={index}
              className='group relative flex gap-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl transition-all duration-300 overflow-hidden'
            >
              {/* Thumbnail */}
              <div className='relative w-20 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden'>
                <UniversalImage
                  src={item.thumbnail}
                  alt={item.comicTitle || 'Thumbnail'}
                  fill
                  className='object-cover group-hover:scale-110 transition-transform duration-500'
                />
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0 flex flex-col justify-center'>
                <h3 className='font-bold text-gray-200 truncate group-hover:text-primary transition-colors mb-1'>
                  {item.comicTitle}
                </h3>
                <p className='text-sm text-gray-400 font-medium mb-2'>
                  {item.title}
                </p>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <span>Dibaca</span>
                  <TimeAgo datetime={item.readAt} locale='id_ID' />
                </div>
              </div>

              {/* Glow Effect */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none' />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
