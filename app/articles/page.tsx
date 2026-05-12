import { Metadata } from 'next';
import ArticlesClient from './ArticlesClient';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata, getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Les Archives Publiques | Transmissions & Analyses',
  description: 'Notes de l\'Architecte. Analyses stratégiques, éducation financière et mindset pour une nouvelle ère d\'indépendance.',
  path: '/articles',
  ogTypeLabel: 'ARCHIVES',
  image: '/images/og/og-articles.jpg',
});

export default function Page() {
  const siteUrl = getSiteUrl();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Les Archives Publiques - Kheops Set Motivation",
    "description": "Analyses stratégiques, éducation financière et mindset.",
    "publisher": {
      "@type": "Organization",
      "name": "Kheops Set Motivation"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Archives",
        "item": `${siteUrl}/articles`
      }
    ]
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ArticlesClient />
    </>
  );
}
