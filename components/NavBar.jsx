'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Bookmark, Bell } from 'lucide-react';

const NavBar = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = () => {
      const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  // No top bar while reading a chapter (clean, immersive reader)
  if (pathname.includes('/chapter/')) {
    return null;
  }

  const links = [
    { href: '/', label: 'Latest', icon: Home, exact: true },
    { href: '/search', label: 'Explore', icon: Search },
    { href: '/history', label: 'History', icon: History },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/notifications', label: 'Updates', icon: Bell, badge: unreadCount > 0 },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-white hover:text-neutral-300 transition-colors"
        >
          Komik<span className="font-light">Meh</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                      isActive ? 'bg-black' : 'bg-white'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
