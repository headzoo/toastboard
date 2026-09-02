import type { Metadata } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import '../index.css';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Willow Book — event guestbook with no login',
  description:
    'A live guestbook for personal events with no sign-up, no login, and no email. Guests scan a QR code and leave a note or photo.',
  icons: {
    icon: [
      { url: '/images/favicon.ico', sizes: '48x48' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${figtree.variable} ${fraunces.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
