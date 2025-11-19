'use client';

import { usePathname } from 'next/navigation';
import BottomBar from './BottomBar';
import NavBar from './NavBar';

export default function NavigationWrapper({ children }) {
  const pathname = usePathname();
  const shouldHide = pathname?.startsWith('/read');

  return (
    <>
      {!shouldHide && <NavBar />}
      {children}
      {!shouldHide && <BottomBar />}
    </>
  );
}
