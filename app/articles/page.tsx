import { Metadata } from 'next';
import ArticlesClient from './ArticlesClient';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Les Archives Publiques | Transmissions & Analyses',
  description: 'Notes de l\'Architecte. Analyses stratégiques, éducation financière et mindset pour une nouvelle ère d\'indépendance.',
  path: '/articles',
  ogTypeLabel: 'ARCHIVES',
  image: '/images/og/og-articles.jpg',
});

export default function Page() {
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
        "item": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Archives",
        "item": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/articles"
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
