import { Metadata } from 'next';

export const getSiteUrl = () => {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3004';
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://kheopsetmotivation.com';
};

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'book';
  path: string;
  ogTypeLabel?: string;
}

export function constructMetadata({
  title,
  description,
  image,
  type = 'website',
  path,
  ogTypeLabel
}: SEOProps): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;
  
  // Dynamic OG image generation
  const generatedOgUrl = new URL(`${siteUrl}/api/og`);
  generatedOgUrl.searchParams.set('title', title);
  if (ogTypeLabel) {
    generatedOgUrl.searchParams.set('type', ogTypeLabel);
  }

  const ogImageUrl = image ? `${siteUrl}${image}` : generatedOgUrl.toString();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | KHEOPS SET MOTIVATION`,
    },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'KHEOPS SET MOTIVATION',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@KheopsSet',
    },
  };
}
