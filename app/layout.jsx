import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import NotificationHandler from '@/components/NotificationHandler';
import Bottombar from '@/components/Bottombar';
import NavBar from '@/components/NavBar';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'KomikMeh',
  description: 'KomikMeh - Platform baca komik terbaik',
  manifest: '/manifest.json',
  referrer: 'no-referrer',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KomikMeh',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <NotificationHandler>
          <NavBar />
          {children}
          <Bottombar />
        </NotificationHandler>
      </body>
    </html>
  );
};

export default RootLayout;
