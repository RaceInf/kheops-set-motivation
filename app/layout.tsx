import type {Metadata} from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import './globals.css';

const bebas = Bebas_Neue({ 
  subsets: ['latin'], 
  weight: ['400'], 
  variable: '--font-bebas' 
});

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3004' 
      : 'https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app'
  ),
  title: {
    default: 'Kheops Set Motivation | L\'Ordre du Bâtisseur',
    template: '%s | Kheops Set Motivation'
  },
  description: 'Démanteler la mentalité de consommateur, devenir un Bâtisseur. Discipline, Souveraineté Financière et Leadership Radical pour une nouvelle génération d\'entrepreneurs.',
  keywords: ['Bâtisseur', 'Discipline', 'Indépendance financière', 'Leadership', 'Entrepreneuriat africain', 'KSM', 'Kheops Set', 'Architecture Mentale', 'Capital du Bâtisseur', 'Stratégie financière', 'Mindset'],
  authors: [{ name: 'Kheops Set' }],
  creator: 'Kheops Set',
  publisher: 'Kheops Set Motivation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app',
    siteName: 'Kheops Set Motivation',
    title: 'Kheops Set Motivation | L\'Ordre du Bâtisseur',
    description: 'Démanteler la mentalité de consommateur, devenir un Bâtisseur. Forge ton esprit et bâtis ton empire.',
    images: [
      {
        url: '/images/og/og-accueil.jpg',
        width: 1200,
        height: 630,
        alt: 'Kheops Set Motivation - L\'Ordre du Bâtisseur',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kheops Set Motivation | L\'Ordre du Bâtisseur',
    description: 'Démanteler la mentalité de consommateur, devenir un Bâtisseur. Discipline et Souveraineté.',
    creator: '@kheopset',
    images: ['/images/og/og-accueil.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/favicons/favicon.ico' },
      { url: '/images/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/images/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome',
        url: '/images/favicons/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome',
        url: '/images/favicons/android-chrome-512x512.png',
        sizes: '512x512',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className={`${bebas.variable} ${inter.variable}`}>
      <body className="bg-black text-white antialiased selection:bg-[#eeb149] selection:text-black font-sans" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                  environment: '${process.env.NODE_ENV}',
                });
              `}
            </Script>
          </>
        )}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
