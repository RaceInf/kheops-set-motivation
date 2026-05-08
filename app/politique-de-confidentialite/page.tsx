import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';

const baseMetadata = constructMetadata({
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité de Kheops Set Motivation.',
  path: '/politique-de-confidentialite',
  ogTypeLabel: 'LEGAL',
  image: '/images/og/og-politique-confidentialite.jpg',
});

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true }
};

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 font-sans max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold mb-12 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="font-display text-5xl md:text-7xl uppercase mb-12 tracking-tighter">Politique de <span className="text-white/30">Confidentialité</span></h1>
      
      <div className="space-y-12 text-white/70 leading-relaxed">
        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">1. Collecte des données</h2>
          <p>Nous collectons votre adresse e-mail uniquement lorsque vous vous inscrivez à notre newsletter. Ces données sont utilisées pour vous envoyer nos protocoles et mises à jour.</p>
        </section>

        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">2. Utilisation des données</h2>
          <p>Vos données ne sont jamais vendues ou partagées avec des tiers à des fins commerciales. Nous utilisons Brevo pour la gestion de nos envois d&apos;e-mails.</p>
        </section>

        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">3. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Vous pouvez vous désabonner à tout moment via le lien présent dans nos e-mails.</p>
        </section>

        <section>
          <h2 className="text-gold text-xl uppercase font-bold mb-4 tracking-widest">4. Cookies</h2>
          <p>Le site peut utiliser des cookies pour améliorer votre expérience de navigation. Vous pouvez les désactiver dans les paramètres de votre navigateur.</p>
        </section>
      </div>
    </div>
  );
}
