'use client';

import KomikCard from '@/components/KomikCard';
import { Skeleton } from '@/components/Skeleton';
import { getLatestKomik } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
export default function Home() {
  const [latestKomik, setLatestKomik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchLatestKomik = async () => {
      try {
        const latestKomik = await getLatestKomik();
        setLatestKomik(latestKomik);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestKomik();
  }, []);

  useEffect(() => {
    if (!latestKomik || latestKomik.length <= visibleCount) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        setVisibleCount((prev) => {
          const nextCount = prev + 18;
          return latestKomik ? Math.min(nextCount, latestKomik.length) : prev;
        });
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [latestKomik, visibleCount]);

  return (
    <main className='container mx-auto px-4 pt-8 pb-24'>
      <h1 className='text-3xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400'>
        Update Terbaru
      </h1>

      {loading ? (
        <div className='grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='aspect-3/4 w-full rounded-xl' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className='grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4'>
            {latestKomik?.slice(0, visibleCount).map((komik, index) => (
              <KomikCard key={index} komik={komik} />
            ))}
          </div>
          {latestKomik && latestKomik.length > visibleCount && (
            <div ref={loadMoreRef} className='h-8' />
          )}
        </>
      )}
    </main>
  );
}
