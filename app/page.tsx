import { Metadata } from 'next';
import PageClient from './PageClient';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata, getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Deviens Un Bâtisseur | Souveraineté & Discipline',
  description: 'Tu travailles dur. Ton compte ne le reflète pas. Kheops Set Motivation est l\'architecture mentale et financière pour ceux qui construisent — sans permission et sans excuse.',
  path: '/',
  image: '/images/og/og-accueil.jpg',
});

export default function Page() {
  const siteUrl = getSiteUrl();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kheops Set Motivation",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      "https://www.facebook.com/KheopsSetMotivation",
      "https://www.youtube.com/@kheopset.motivation",
      "https://wa.me/237654172703"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kheops Set Motivation",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <PageClient />
    </>
  );
}
