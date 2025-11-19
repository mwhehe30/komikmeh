'use client';

import { Skeleton } from '@/components/Skeleton';
import UniversalImage from '@/components/UniversalImage';
import { getDetailKomik } from '@/lib/api';
import useHistoryStore from '@/store/useHistoryStore';
import { ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import id from 'timeago.js/lib/lang/id_ID';

timeago.register('id_ID', id);

const Page = () => {
  const { slug } = useParams();
  const [detailKomik, setDetailKomik] = useState(null);
  const { readChapters, markAsRead } = useHistoryStore();
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  useEffect(() => {
    const fetchDetailKomik = async () => {
      const detailKomik = await getDetailKomik(slug);
      setDetailKomik(detailKomik);
    };
    fetchDetailKomik();
  }, [slug]);

  return (
    <main className='min-h-screen pb-20'>
      {detailKomik ? (
        <>
          {/* Hero Section with Blurred Background */}
          <div className='relative w-full min-h-[50vh] md:min-h-[500px] flex items-end overflow-hidden'>
            <div className='absolute inset-0 bg-black/60 z-10' />
            <div
              className='absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40'
              style={{ backgroundImage: `url(${detailKomik?.thumbnail})` }}
            />
            <div className='absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent z-20' />

            <div className='container mx-auto px-4 relative z-30 flex flex-col md:flex-row items-end pb-10 gap-8 w-full'>
              {/* Thumbnail */}
              <div className='relative w-[calc(100%-30px)] md:w-56 aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-800/50 mx-auto md:mx-0 mt-4'>
                <UniversalImage
                  src={detailKomik?.thumbnail}
                  alt={detailKomik?.title}
                  fill
                  className='object-cover'
                />
              </div>

              {/* Title & Info */}
              <div className='flex-1 w-full text-center md:text-left mb-4'>
                <h1 className='text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl line-clamp-3 leading-tight tracking-tight'>
                  {detailKomik?.title}
                </h1>

                <div className='flex flex-wrap justify-center md:justify-start gap-3 text-xs md:text-sm text-gray-300 mb-6'>
                  <span className='bg-zinc-800/60 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/10 font-medium shadow-lg'>
                    {detailKomik?.type}
                  </span>
                  <span className='bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full backdrop-blur-xl border border-emerald-500/20 font-medium shadow-lg'>
                    {detailKomik?.status}
                  </span>
                </div>

                <div className='flex flex-wrap justify-center md:justify-start gap-2 mb-8'>
                  {detailKomik?.genres?.map((genre, index) => (
                    <span
                      key={index}
                      className='bg-white/5 hover:bg-white/10 text-gray-200 px-3 py-1.5 rounded-lg text-xs backdrop-blur-md border border-white/5 transition-colors cursor-default'
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Start Reading Button */}
                {detailKomik?.chapters?.length > 0 && (
                  <div className='flex justify-center md:justify-start'>
                    <Link
                      href={`/read/${
                        detailKomik.chapters[detailKomik.chapters.length - 1]
                          .slug
                      }`}
                      className='relative inline-flex items-center justify-center gap-3 px-8 py-4 overflow-hidden font-bold text-white transition-all duration-300 ease-out rounded-2xl shadow-2xl shadow-violet-500/20 group hover:scale-105 hover:shadow-violet-500/40 w-full md:w-auto'
                    >
                      <span className='absolute inset-0 w-full h-full bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 opacity-100 group-hover:opacity-90'></span>
                      <span className='absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-white/10 rounded-full opacity-30 group-hover:rotate-90 ease'></span>
                      <span className='relative flex items-center gap-2 text-lg tracking-wide'>
                        Mulai Baca Chapter 1
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='container mx-auto px-4 mt-8 gap-8'>
            {/* Main Content: Synopsis & Chapters */}
            <div className='space-y-8'>
              {/* Synopsis */}
              <section className='bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50'>
                <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                  <span className='w-1 h-6 bg-primary rounded-full' />
                  Sinopsis
                </h2>
                <p className='text-gray-300 leading-relaxed text-sm md:text-base'>
                  {detailKomik?.synopsis}
                </p>
              </section>

              {/* Chapters */}
              <section>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-xl font-bold flex items-center gap-2'>
                    <span className='w-1 h-6 bg-primary rounded-full' />
                    Chapter List
                  </h2>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-gray-500'>
                      {detailKomik?.chapters?.length} Chapters
                    </span>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                      }
                      className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors'
                    >
                      {sortOrder === 'desc' ? (
                        <>
                          <ArrowDown className='w-4 h-4' /> Newest
                        </>
                      ) : (
                        <>
                          <ArrowUp className='w-4 h-4' /> Oldest
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent'>
                  {(sortOrder === 'desc'
                    ? detailKomik?.chapters
                    : [...(detailKomik?.chapters || [])].reverse()
                  )?.map((chapter, index) => {
                    const isRead = readChapters.some(
                      (c) => c.slug === chapter.slug
                    );
                    return (
                      <Link
                        href={`/read/${chapter.slug}`}
                        key={index}
                        onClick={() =>
                          markAsRead({
                            slug: chapter.slug,
                            title: chapter.title,
                            comicSlug: slug,
                            comicTitle: detailKomik.title,
                            thumbnail: detailKomik.thumbnail,
                            released_at: chapter.released_at,
                          })
                        }
                        className={`group flex justify-between items-center p-4 rounded-xl border transition-all duration-200 ${
                          isRead
                            ? 'bg-zinc-900/50 border-zinc-800 text-gray-500'
                            : 'bg-zinc-900 border-zinc-800 hover:border-primary/50 hover:bg-zinc-800 text-gray-200'
                        }`}
                      >
                        <div className='flex flex-col'>
                          <span
                            className={`font-medium text-sm ${
                              !isRead &&
                              'group-hover:text-primary transition-colors'
                            }`}
                          >
                            {chapter.title}
                          </span>
                          <span className='text-xs text-gray-500 mt-1'>
                            <TimeAgo
                              datetime={chapter.released_at}
                              locale='id_ID'
                            />
                          </span>
                        </div>
                        {isRead && (
                          <span className='text-xs bg-zinc-800 text-gray-500 px-2 py-1 rounded-full'>
                            Read
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar (Optional for future use, e.g. Recommendations) */}
            <div className='hidden lg:block space-y-6'>
              {/* Placeholder for future content */}
            </div>
          </div>
        </>
      ) : (
        <div className='animate-pulse'>
          {/* Hero Skeleton */}
          <div className='relative w-full min-h-[50vh] md:min-h-[500px] bg-zinc-900 flex items-end pb-10'>
            <div className='container mx-auto px-4 flex flex-col md:flex-row items-end gap-8 w-full'>
              <Skeleton className='w-[calc(100%-30px)] md:w-56 aspect-[3/4] rounded-xl mx-auto md:mx-0 mt-4' />
              <div className='flex-1 w-full space-y-4'>
                <Skeleton className='h-10 md:h-14 w-3/4 mx-auto md:mx-0' />
                <div className='flex gap-3 justify-center md:justify-start'>
                  <Skeleton className='h-8 w-20 rounded-full' />
                  <Skeleton className='h-8 w-20 rounded-full' />
                </div>
                <div className='flex gap-2 justify-center md:justify-start'>
                  <Skeleton className='h-6 w-16 rounded-lg' />
                  <Skeleton className='h-6 w-16 rounded-lg' />
                  <Skeleton className='h-6 w-16 rounded-lg' />
                </div>
                <Skeleton className='h-12 w-48 rounded-full mx-auto md:mx-0 mt-6' />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className='container mx-auto px-4 mt-8 space-y-8'>
            <div className='space-y-4'>
              <Skeleton className='h-8 w-32' />
              <Skeleton className='h-24 w-full rounded-2xl' />
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <Skeleton className='h-8 w-40' />
                <Skeleton className='h-8 w-24' />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className='h-16 w-full rounded-xl' />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
