import Link from 'next/link';
import UniversalImage from './UniversalImage';

const KomikCard = ({ komik }) => {
  return (
    <div className='group relative bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-lg border border-zinc-800 hover:border-zinc-600'>
      {/* Thumbnail Image */}
      <Link
        href={`/komik/${komik.slug}`}
        className='block aspect-[3/4] relative overflow-hidden'
      >
        <UniversalImage
          src={komik.thumbnail}
          alt={komik.title}
          fill
          className='object-cover group-hover:scale-110 transition-transform duration-500'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        {/* Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity' />

        {/* Type Badge (Optional if data exists) */}
        {komik.type && (
          <span className='absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm'>
            {komik.type}
          </span>
        )}
      </Link>

      {/* Content Info */}
      <div className='absolute bottom-0 left-0 right-0 p-2 md:p-4'>
        <Link href={`/komik/${komik.slug}`}>
          <h3 className='text-white font-bold text-xs md:text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight'>
            {komik.title}
          </h3>
        </Link>

        <div className='flex justify-between items-center mt-1 md:mt-2'>
          {/* Latest Chapter Link */}
          <Link
            href={`/read/${komik.latest_chapter.slug}`}
            className='text-[10px] md:text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-primary hover:text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm transition-colors truncate max-w-full'
          >
            {komik.latest_chapter.title}
          </Link>

          {/* Rating or other info could go here */}
        </div>
      </div>
    </div>
  );
};

export default KomikCard;
