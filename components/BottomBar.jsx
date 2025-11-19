'use client';

import { navigations } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const BottomBar = () => {
  const pathname = usePathname();

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe'>
      {/* Gradient Fade for smooth transition */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none' />

      <div className='relative bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3'>
        <ul className='flex justify-around items-center'>
          {navigations.map((navigation, index) => {
            const isActive = pathname === navigation.href;
            return (
              <li key={index}>
                <Link
                  href={navigation.href}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive
                      ? 'text-white scale-110'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                        : 'bg-transparent'
                    }`}
                  >
                    {navigation.icon}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {navigation.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default BottomBar;
