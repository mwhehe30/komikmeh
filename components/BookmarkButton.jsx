'use client';

import useBookmarkStore from '@/store/useBookmarkStore';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

const BookmarkButton = ({ komik, className = '' }) => {
  const { bookmarks, toggleBookmark } = useBookmarkStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsBookmarked(bookmarks.some((b) => b.slug === komik.slug));
  }, [bookmarks, komik.slug]);

  const handleBookmark = (e) => {
    e.preventDefault(); // Prevent link navigation if inside a Link
    e.stopPropagation();
    toggleBookmark(komik);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleBookmark}
      className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 group/btn ${
        isBookmarked
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
          : 'bg-black/40 text-white hover:bg-white hover:text-red-500'
      } ${className}`}
      title={isBookmarked ? 'Hapus dari favorit' : 'Tambah ke favorit'}
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-300 ${
          isBookmarked ? 'fill-current scale-110' : 'group-hover/btn:scale-110'
        }`}
      />
    </button>
  );
};

export default BookmarkButton;
