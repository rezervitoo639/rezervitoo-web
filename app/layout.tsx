import type { Metadata, Viewport } from 'next';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rezervitoo.com'),
  title: 'rezervitoo - أفضل منصة للسفر والإقامة في الجزائر',
  description: 'رفيقك المميز لحجز الفنادق، النزل، والإقامات الخاصة في الجزائر. اكتشف أفضل العروض وتجارب السفر.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'rezervitoo - أفضل منصة للسفر والإقامة في الجزائر',
    description: 'رفيقك المميز لحجز الفنادق، النزل، والإقامات الخاصة في الجزائر.',
    url: 'https://rezervitoo.com',
    siteName: 'rezervitoo',
    images: [
      {
        url: '/logo-full.png',
        width: 1200,
        height: 630,
        alt: 'rezervitoo Logo',
      },
    ],
    locale: 'ar_DZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
