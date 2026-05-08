import { Metadata } from 'next';
import PageClient from './PageClient';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Deviens Un Bâtisseur | Souveraineté & Discipline',
  description: 'Rejoins l\'élite. Forge ton esprit, accumule le capital et bâtis ton empire. Le protocole radical pour sortir de la matrice et atteindre la souveraineté financière.',
  path: '/',
  image: '/images/og/og-accueil.jpg',
});

export default function Page() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kheops Set Motivation",
    "url": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app",
    "logo": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/logo.png",
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
    "url": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/search?q={search_term_string}",
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
