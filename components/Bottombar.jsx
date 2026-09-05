'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bookmark, History, Bell } from 'lucide-react';

const Bottombar = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    const checkUnread = () => {
      const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    };
    
    checkUnread();

    // Setup an interval to check periodically since localStorage might be updated by polling
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: Home, href: '/' },
    { icon: Search, href: '/search' },
    { icon: History, href: '/history' },
    { icon: Bookmark, href: '/bookmarks' },
    { icon: Bell, href: '/notifications', badge: unreadCount > 0 },
  ];

  const activeIndex = navItems.findIndex((item) => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  });

  if (pathname.includes('/chapter/')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6">
      <div className="flex items-center gap-8 px-8 py-3.5 bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-full shadow-2xl">
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center group transition-transform active:scale-90"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-neutral-900" />
                )}
              </div>
              {isActive && (
                <div className="absolute -bottom-1.5 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Bottombar;
