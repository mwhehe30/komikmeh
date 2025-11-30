import Link from 'next/link';
import BookmarkButton from './BookmarkButton';
import UniversalImage from './UniversalImage';

import { memo } from 'react';

const KomikCard = memo(({ komik, priority = false }) => {
  return (
    <div className='group relative bg-zinc-900 rounded-xl md:overflow-hidden md:hover:scale-[1.02] md:transition-transform md:duration-300 shadow-none md:shadow-sm border-none md:border md:border-zinc-800 md:hover:border-zinc-600 transform-gpu [contain:content]'>
      {/* Thumbnail Image */}
      <Link
        href={`/komik/${komik.slug}`}
        className='block aspect-3/4 relative overflow-hidden rounded-t-xl md:rounded-none'
        prefetch={false}
      >
        <UniversalImage
          src={komik.thumbnail}
          alt={komik.title}
          fill
          className='object-cover md:group-hover:scale-110 md:transition-transform md:duration-500'
          sizes='(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw'
          priority={priority}
          quality={60}
        />
        {/* Gradient Overlay */}
        <div className='hidden md:block absolute bottom-0 left-0 right-0 h-[60%] bg-linear-to-t from-black/90 to-transparent opacity-80 md:group-hover:opacity-60 transition-opacity' />

        {/* Type Badge (Optional if data exists) */}
        {komik.type && (
          <span className='absolute top-2 left-2 bg-primary/90 text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-md backdrop-blur-sm z-10'>
            {komik.type}
          </span>
        )}
      </Link>

      {/* Bookmark Button */}
      <div className='absolute top-2 right-2 z-20'>
        <BookmarkButton komik={komik} />
      </div>

      {/* Content Info */}
      <div className='relative md:absolute bottom-0 left-0 right-0 p-2 md:p-4 bg-zinc-900 md:bg-transparent rounded-b-xl md:rounded-none'>
        <Link href={`/komik/${komik.slug}`} prefetch={false}>
          <h3 className='text-white font-bold text-[10px] md:text-lg line-clamp-2 mb-1.5 md:mb-1 md:group-hover:text-primary transition-colors leading-tight min-h-[2.5em] md:min-h-0'>
            {komik.title}
          </h3>
        </Link>

        <div className='flex justify-between items-center mt-1 md:mt-2'>
          {/* Latest Chapter Link */}
          <Link
            href={`/read/${komik.latest_chapter.slug}`}
            prefetch={false}
            className='text-[9px] md:text-xs font-medium text-zinc-300 bg-zinc-800 md:bg-zinc-800/90 hover:bg-primary hover:text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-colors truncate max-w-full'
          >
            {komik.latest_chapter.title}
          </Link>
        </div>
      </div>
    </div>
  );
});

KomikCard.displayName = 'KomikCard';

export default KomikCard;
