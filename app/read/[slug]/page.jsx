'use client';

import { Skeleton } from '@/components/Skeleton';
import UniversalImage from '@/components/UniversalImage';
import { getChapterImage, getDetailKomik } from '@/lib/api';
import useHistoryStore from '@/store/useHistoryStore';
import {
  ArrowLeft,
  BookText,
  ChevronLeft,
  ChevronRight,
  Home,
  Pause,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const Page = () => {
  const { slug } = useParams();
  const [chapter, setChapter] = useState(null);
  const [show, setShow] = useState(true);
  const [auto, setAuto] = useState(false);
  const { markAsRead } = useHistoryStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchChapterImage = async () => {
      try {
        const data = await getChapterImage(slug);
        setChapter(data);
      } catch (e) {
        console.error(e);
        setChapter([]);
      }
    };
    fetchChapterImage();
  }, [slug]);

  useEffect(() => {
    const saveToHistory = async () => {
      if (!chapter || !chapter.komik_slug) return;

      try {
        const comicDetails = await getDetailKomik(chapter.komik_slug);

        markAsRead({
          slug: slug,
          title: chapter.title,
          comicSlug: chapter.komik_slug,
          comicTitle: comicDetails.title,
          thumbnail: comicDetails.thumbnail,
          released_at: chapter.released_at || new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save reading history:', error);
      }
    };

    saveToHistory();
  }, [chapter, slug, markAsRead]);

  useEffect(() => {
    if (!auto) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          top: 1.5,
        });
      }
    }, 16);

    return () => clearInterval(interval);
  }, [auto]);

  const toggleScroll = () => {
    setAuto((prev) => !prev);
  };

  return (
    <main
      ref={scrollRef}
      onClick={() => setShow(!show)}
      onScroll={() => setShow(false)}
      className='h-screen overflow-y-auto'
    >
      <div className='container mx-auto'>
        <section
          className={`bg-dark-light md:px-8 px-3 mx-2 rounded-lg py-6 flex items-center justify-between sticky top-2 z-50 mb-4 ${
            show ? 'translate-y-0' : '-translate-y-40'
          } transition-all duration-300`}
        >
          {chapter?.title && (
            <>
              <button
                onClick={() => window.history.back()}
                className='flex items-center gap-2 cursor-pointer'
              >
                <ArrowLeft />
              </button>
              <div className='flex items-center justify-center gap-2 px-4'>
                <h1 className='text-lg font-medium w-fit line-clamp-1 break-all'>
                  {chapter?.title}
                </h1>
                <ChevronRight />
                <h1 className='text-lg font-medium text-violet-600'>
                  {chapter?.chapter_number}
                </h1>
              </div>
              <Link href='/' className='cursor-pointer'>
                <Home />
              </Link>
            </>
          )}
        </section>

        {!chapter ? (
          <div className='max-w-3xl mx-auto space-y-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='w-full aspect-2/3 rounded-lg' />
            ))}
          </div>
        ) : null}

        {chapter && (
          <section>
            <div className='max-w-3xl fixed overflow-hidden bottom-8 left-2 right-2 mx-auto text-white flex items-center justify-center gap-8'>
              {chapter?.previous_chapter_slug && (
                <Link
                  href={`/read/${chapter?.previous_chapter_slug}`}
                  className={`md:size-20 size-16 bg-dark-light rounded-full flex items-center justify-center cursor-pointer ${
                    show ? 'translate-y-0' : 'translate-y-20'
                  } transition-all duration-300`}
                >
                  <ChevronLeft />
                </Link>
              )}

              <button
                onClick={toggleScroll}
                className={`size-16 md:size-20 bg-dark-light rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  auto
                    ? 'translate-y-0'
                    : show
                    ? 'translate-y-0'
                    : 'translate-y-20'
                }`}
              >
                {auto ? <Pause /> : <Play />}
              </button>

              <Link
                href={`/komik/${chapter?.komik_slug}`}
                className={`md:size-20 size-16 bg-dark-light rounded-full flex items-center justify-center cursor-pointer ${
                  show ? 'translate-y-0' : 'translate-y-20'
                } transition-all duration-300`}
              >
                <BookText />
              </Link>

              {chapter?.next_chapter_slug && (
                <Link
                  href={`/read/${chapter?.next_chapter_slug}`}
                  className={`md:size-20 size-16 bg-dark-light rounded-full flex items-center justify-center cursor-pointer ${
                    show ? 'translate-y-0' : 'translate-y-20'
                  } transition-all duration-300`}
                >
                  <ChevronRight />
                </Link>
              )}
            </div>
          </section>
        )}

        <section className='flex flex-col max-w-3xl mx-auto'>
          {chapter?.images?.map((src, i) => (
            <UniversalImage
              key={i}
              src={src}
              alt={`Page ${i + 1}`}
              width={800}
              height={1200}
              className='w-full h-auto'
              priority={i < 3}
              onContextMenu={(e) => e.preventDefault()}
            />
          ))}
        </section>
      </div>
    </main>
  );
};

export default Page;
