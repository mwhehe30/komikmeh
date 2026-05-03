'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Filter, Bookmark } from 'lucide-react';

const Bottombar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/',
    },
    {
      label: 'Explore',
      icon: Search,
      href: '/search',
    },
    {
      label: 'Bookmark',
      icon: Bookmark,
      href: '/bookmarks',
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(calc(100%-2rem),400px)]">
      <nav className="flex items-center justify-between p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-2xl animate-in fade-in zoom-in duration-300" />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-bold mt-1 relative z-10 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Bottombar;
