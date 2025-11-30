import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookmarkStore = create(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (comic) =>
        set((state) => {
          // Check if already bookmarked
          if (state.bookmarks.some((b) => b.slug === comic.slug)) {
            return state;
          }
          return {
            bookmarks: [
              { ...comic, bookmarkedAt: new Date().toISOString() },
              ...state.bookmarks,
            ],
          };
        }),
      removeBookmark: (slug) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.slug !== slug),
        })),
      toggleBookmark: (comic) => {
        const { bookmarks, addBookmark, removeBookmark } = get();
        const isBookmarked = bookmarks.some((b) => b.slug === comic.slug);
        if (isBookmarked) {
          removeBookmark(comic.slug);
        } else {
          addBookmark(comic);
        }
      },
      clearBookmarks: () => set({ bookmarks: [] }),
    }),
    {
      name: 'bookmark-storage',
    }
  )
);

export default useBookmarkStore;
