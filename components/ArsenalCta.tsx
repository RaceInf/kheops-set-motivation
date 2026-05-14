"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Mail, User, MessageSquare } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
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
          whatsappNumber: whatsapp.startsWith('+') ? whatsapp : `+${whatsapp}`
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

          {/* Champ WhatsApp avec Drapeaux */}
          <div className="flex flex-col gap-2 ksm-phone-input">
            <label className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-gold" /> Numéro WhatsApp
            </label>
            <PhoneInput
              country={"cm"}
              preferredCountries={["cm", "fr", "ci", "sn", "be", "ch", "ca"]}
              enableSearch={true}
              searchPlaceholder="Rechercher un pays..."
              searchNotFound="Aucun pays trouvé"
              countryCodeEditable={false}
              copyNumbersOnly={true}
              value={whatsapp}
              onChange={(phone) => setWhatsapp(phone)}
              disabled={isLoading}
              containerClass="ksm-phone-container"
              inputClass="ksm-phone-field"
              buttonClass="ksm-phone-button"
              dropdownClass="ksm-phone-dropdown"
              searchClass="ksm-phone-search"
              placeholder="+237 ..."
              inputProps={{
                required: true,
              }}
            />
            
            <style jsx global>{`
              .ksm-phone-container {
                width: 100% !important;
                background: black !important;
              }
              .ksm-phone-field {
                width: 100% !important;
                height: 54px !important;
                background: black !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 0 !important;
                font-size: 14px !important;
                padding-left: 58px !important;
                transition: all 0.2s !important;
                font-family: inherit !important;
              }
              .ksm-phone-field:focus {
                border-color: #eeb149 !important;
                background: rgba(238, 177, 73, 0.02) !important;
              }
              .ksm-phone-button {
                background: transparent !important;
                border: none !important;
                border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 0 !important;
                width: 48px !important;
                height: 34px !important;
                top: 10px !important;
                left: 1px !important;
              }
              .ksm-phone-button:hover, .ksm-phone-button.open {
                background: transparent !important;
              }
              .ksm-phone-button .selected-flag {
                background: transparent !important;
                padding: 0 0 0 12px !important;
                width: 100% !important;
              }
              .ksm-phone-button .selected-flag .arrow {
                border-top-color: rgba(255, 255, 255, 0.3) !important;
                left: 25px !important;
              }
              .ksm-phone-button .selected-flag .arrow.up {
                border-bottom-color: #eeb149 !important;
              }
              .ksm-phone-dropdown {
                background: #09090b !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 0 !important;
                width: 300px !important;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8) !important;
                margin-top: 10px !important;
              }
              .ksm-phone-search {
                background: #09090b !important;
                margin: 0 !important;
                padding: 12px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              }
              .ksm-phone-search input {
                background: #121214 !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 0 !important;
                font-size: 10px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.1em !important;
                padding: 10px !important;
              }
              .ksm-phone-dropdown .country:hover {
                background: rgba(238, 177, 73, 0.1) !important;
              }
              .ksm-phone-dropdown .country.highlight {
                background: rgba(238, 177, 73, 0.2) !important;
              }
              .ksm-phone-dropdown .country-name {
                color: white !important;
                font-size: 11px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
              }
              .ksm-phone-dropdown .dial-code {
                color: #eeb149 !important;
                font-size: 11px !important;
              }
              .ksm-phone-dropdown::-webkit-scrollbar {
                width: 4px;
              }
              .ksm-phone-dropdown::-webkit-scrollbar-track {
                background: black;
              }
              .ksm-phone-dropdown::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
              }
            `}</style>
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
          disabled={isLoading || !email || !name || whatsapp.length < 6}
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
          currency: 'XAF',
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
