import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import NotificationHandler from '@/components/NotificationHandler';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'KomikMeh',
  description: 'KomikMeh - Platform baca komik terbaik',
  manifest: '/manifest.json',
  referrer: 'no-referrer',
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
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body 
        className={`${plusJakartaSans.variable} antialiased`}
        onContextMenu={(e) => e.preventDefault()}
      >
        <NotificationHandler>
          {children}
        </NotificationHandler>
      </body>
    </html>
  );
};

export default RootLayout;
