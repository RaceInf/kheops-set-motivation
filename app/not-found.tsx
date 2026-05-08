import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Accès Refusé | 404',
  description: 'Cette zone de l\'architecture n\'existe pas ou a été restreinte.',
  path: '/404',
  image: '/images/og/og-404.jpg',
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background technical lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-white/10"></div>
        <div className="absolute top-0 bottom-0 right-1/4 w-[1px] bg-white/10"></div>
        <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-white/10"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <ShieldAlert className="w-16 h-16 text-gold mb-8 opacity-80" />
        
        <h1 className="font-display text-7xl md:text-9xl mb-4 text-white uppercase tracking-tighter">
          4<span className="text-gold">0</span>4
        </h1>
        
        <div className="h-px w-24 bg-gold mb-8" />
        
        <h2 className="font-sans text-xl md:text-2xl text-white font-bold uppercase tracking-[0.2em] mb-4">
          Protocole d&apos;Isolation Activé
        </h2>
        
        <p className="text-white/50 text-sm md:text-base mb-12 max-w-md font-sans leading-relaxed">
          Cette zone de l&apos;architecture n&apos;existe pas ou votre niveau d&apos;accréditation est insuffisant. La requête a été rejetée.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex py-4 px-8 bg-gold text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 items-center gap-3 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au Quartier Général
        </Link>
      </div>
    </div>
  );
}
