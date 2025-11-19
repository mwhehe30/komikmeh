import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useHistoryStore = create(
  persist(
    (set) => ({
      readChapters: [],
      markAsRead: (chapterData) =>
        set((state) => {
          // Remove existing entry if present to avoid duplicates and move to top
          const filteredChapters = state.readChapters.filter(
            (c) => c.slug !== chapterData.slug
          );
          return {
            readChapters: [
              { ...chapterData, readAt: new Date().toISOString() },
              ...filteredChapters,
            ],
          };
        }),
      clearHistory: () => set({ readChapters: [] }),
    }),
    {
      name: 'reading-history',
    }
  )
);

export default useHistoryStore;
