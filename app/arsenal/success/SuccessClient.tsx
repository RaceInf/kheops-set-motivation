'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TrackPurchase from '@/components/analytics/TrackPurchase';

interface SuccessClientProps {
  status: string;
  orderId: string;
  amount: number;
  productName: string;
  downloadUrl?: string | null;
}

export default function SuccessClient({ 
  status: initialStatus, 
  orderId, 
  amount, 
  productName, 
  downloadUrl: initialDownloadUrl 
}: SuccessClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [downloadUrl, setDownloadUrl] = useState(initialDownloadUrl);
  const router = useRouter();
  const isPaid = status === 'PAID';

  useEffect(() => {
    // Si déjà payé, pas besoin de poll
    if (isPaid) return;

    // Polling toutes les 3 secondes
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();
        
        if (data.status === 'PAID') {
          setStatus('PAID');
          clearInterval(interval);
          // On force un refresh du Server Component pour obtenir le downloadUrl signé
          router.refresh();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaid, orderId, router]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      {isPaid && (
        <TrackPurchase 
          orderId={orderId} 
          value={amount} 
          currency="XAF" 
          productName={productName} 
        />
      )}

      <div className="w-full max-w-xl border border-white/10 bg-zinc-950 p-8 md:p-12 text-center">
        {isPaid ? (
          <>
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter mb-4">
              ACQUISITION RÉUSSIE
            </h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Le dossier <span className="text-white font-bold">{productName}</span> est maintenant disponible. 
              Vous pouvez télécharger votre plan de construction ci-dessous.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <Loader2 className="w-16 h-16 text-gold animate-spin" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter mb-4">
              PAIEMENT EN COURS
            </h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Nous attendons la confirmation de Tara Money. 
              Cette page s&apos;actualisera automatiquement dès que la transaction sera validée.
            </p>
          </>
        )}

        <div className="flex flex-col gap-4 mt-8">
          {isPaid && (downloadUrl || initialDownloadUrl) && (
            <a
              href={downloadUrl || initialDownloadUrl || '#'}
              download
              className="w-full py-4 bg-gold text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-white transition-colors flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(238,177,73,0.3)] animate-pulse mb-4"
            >
              <Download className="w-4 h-4" /> TÉLÉCHARGER MON LIVRE
            </a>
          )}

          <Link
            href="/arsenal"
            className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-gold transition-colors flex justify-center items-center gap-3"
          >
            RETOURNER À L&apos;ARSENAL <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/"
            className="text-[10px] text-white/40 uppercase tracking-widest hover:text-white transition-colors mt-2"
          >
            RETOUR AU CHANTIER
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
            ID TRANSACTION : {orderId}
          </p>
        </div>
      </div>
    </div>
  );
}
