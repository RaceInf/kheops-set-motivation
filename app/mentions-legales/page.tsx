import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';

const baseMetadata = constructMetadata({
  title: 'Mentions Légales',
  description: 'Mentions légales de Kheops Set Motivation - L\'Ordre du Bâtisseur.',
  path: '/mentions-legales',
  ogTypeLabel: 'LEGAL',
  image: '/images/og/og-mentions-legales.jpg',
});

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true }
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 font-sans max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold mb-12 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="font-display text-5xl md:text-7xl uppercase mb-12 tracking-tighter">Mentions <span className="text-white/30">Légales</span></h1>
      
      <div className="space-y-12 text-white/70 leading-relaxed">
        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">1. Éditeur du Site</h2>
          <p>Le site Kheops Set Motivation est édité par Kheops Set.</p>
          <p>Contact : contact@kheopsetmotivation.com</p>
        </section>

        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">2. Hébergement</h2>
          <p>Le site est hébergé par Google Cloud Platform.</p>
        </section>

        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">3. Propriété Intellectuelle</h2>
          <p>L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
        </section>

        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">4. Responsabilité</h2>
          <p>Kheops Set Motivation ne saurait être tenue pour responsable des erreurs rencontrées sur le site, de problèmes techniques, de l&apos;interprétation des informations publiées et des conséquences de leur utilisation.</p>
        </section>
      </div>
    </div>
  );
}
