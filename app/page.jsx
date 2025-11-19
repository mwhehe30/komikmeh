'use client';

import KomikCard from '@/components/KomikCard';
import { Skeleton } from '@/components/Skeleton';
import { getLatestKomik } from '@/lib/api';
import { useEffect, useState } from 'react';
export default function Home() {
  const [latestKomik, setLatestKomik] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className='container mx-auto px-4 pt-20 pb-24'>
      <h1 className='text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400'>
        Update Terbaru
      </h1>

      {loading ? (
        <div className='grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='aspect-[3/4] w-full rounded-xl' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4'>
          {latestKomik?.map((komik, index) => (
            <KomikCard key={index} komik={komik} />
          ))}
        </div>
      )}
    </main>
  );
}
