'use client';

import { navigations } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className='hidden md:block sticky top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='w-8 h-8 bg-gradient-to-br from-primary to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-primary/50 transition-all'>
              K
            </div>
            <span className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all'>
              KomikMeh
            </span>
          </Link>

          {/* Navigation Links */}
          <div>
            <ul className='flex items-center gap-1'>
              {navigations.map((navigation, index) => {
                const isActive = pathname === navigation.href;
                return (
                  <li key={index}>
                    <Link
                      href={navigation.href}
                      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:text-white ${
                        isActive
                          ? 'text-white bg-white/10 shadow-inner'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {navigation.name}
                      {isActive && (
                        <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full mb-1.5' />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
