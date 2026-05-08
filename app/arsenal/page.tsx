import { Metadata } from 'next';
import ArsenalClient from './ArsenalClient';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'L\'Arsenal | Outils & Stratégies pour Bâtisseurs',
  description: 'Équipe-toi. Outils, protocoles et ressources stratégiques pour forger ton empire. Code du Bâtisseur, Protocole d\'Isolation et plus.',
  path: '/arsenal',
  ogTypeLabel: 'ARSENAL',
  image: '/images/og/og-arsenal.jpg',
});

export default function Page() {
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
        "name": "Arsenal",
        "item": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/arsenal"
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
