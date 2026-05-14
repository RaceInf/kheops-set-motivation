"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Mail, User, MessageSquare } from "lucide-react";
import * as gtag from '@/lib/gtag';
import * as fpixel from '@/lib/fpixel';
import { trackEvent } from '@/lib/analytics';

export default function ArsenalCta({ 
  productId, 
  cta, 
  title 
}: { 
  productId: string; 
  cta: string; 
  title: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !whatsapp) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      gtag.event({ 
        action: 'begin_checkout', 
        category: 'ecommerce', 
        label: `${cta} - ${title}` 
      });

      trackEvent('submit_email_checkout', { productId, title });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          userEmail: email,
          customerName: name,
          whatsappNumber: whatsapp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Lien de paiement introuvable');
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (showEmailInput) {
    return (
      <form onSubmit={handleCheckout} className="w-full flex flex-col gap-6 bg-zinc-950 p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col gap-4">
          {/* Champ Nom */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-2">
              <User className="w-3 h-3 text-gold" /> Nom Complet
            </label>
            <input 
              type="text" 
              required
              placeholder="Prénom et Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 text-sm focus:outline-none focus:border-gold transition-colors text-white"
              disabled={isLoading}
            />
          </div>

          {/* Champ WhatsApp */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-gold" /> Numéro WhatsApp
            </label>
            <input 
              type="tel" 
              required
              placeholder="+237 ..."
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 text-sm focus:outline-none focus:border-gold transition-colors text-white"
              disabled={isLoading}
            />
          </div>

          {/* Champ Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Mail className="w-3 h-3 text-gold" /> E-mail de livraison
            </label>
            <input 
              type="email" 
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 text-sm focus:outline-none focus:border-gold transition-colors text-white"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest bg-red-500/10 p-3 border-l-2 border-red-500">{error}</p>}
        
        <button 
          type="submit"
          disabled={isLoading || !email || !name || !whatsapp}
          className="w-full py-4 bg-gold text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-white transition-colors flex justify-center items-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> GÉNÉRATION DU LIEN...</>
          ) : (
            <>VALIDER ET PAYER <ArrowLeft className="w-4 h-4 rotate-135" /></>
          )}
        </button>

        <button 
          type="button"
          onClick={() => setShowEmailInput(false)}
          className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
        >
          Annuler
        </button>
      </form>
    );
  }

  return (
    <button 
      onClick={() => {
        setShowEmailInput(true);
        fpixel.event('InitiateCheckout', {
          content_name: title,
          content_ids: [productId],
          content_type: 'product',
        });
        trackEvent('click_buy_button', { productId, title, source: 'product_page' });
      }}
      className="w-full py-6 bg-gold text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-white transition-colors group flex justify-center items-center gap-3"
    >
      {cta}
      <ArrowLeft className="w-4 h-4 rotate-135 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
    </button>
  );
}
