import { Metadata } from 'next';
import ArsenalClient from './ArsenalClient';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata, getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'L\'Arsenal | Outils & Stratégies pour Bâtisseurs',
  description: 'Équipe-toi. Outils, protocoles et ressources stratégiques pour forger ton empire. Code du Bâtisseur, Protocole d\'Isolation et plus.',
  path: '/arsenal',
  ogTypeLabel: 'ARSENAL',
  image: '/images/og/og-arsenal.jpg',
});

export default function Page() {
  const siteUrl = getSiteUrl();

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
        "name": "Arsenal",
        "item": `${siteUrl}/arsenal`
      }
    ]
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ArsenalClient />
    </>
  );
}
