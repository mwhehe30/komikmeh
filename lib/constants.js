import { Bookmark, History, Home, Search } from 'lucide-react';

export const navigations = [
  {
    name: 'Home',
    href: '/',
    icon: <Home />,
  },
  {
    name: 'Search',
    href: '/search',
    icon: <Search />,
  },
  {
    name: 'Favorit',
    href: '/bookmarks',
    icon: <Bookmark />,
  },
  {
    name: 'History',
    href: '/history',
    icon: <History />,
  },
];
