"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Don't show on admin pages
  if (pathname?.startsWith("/admin-ksm")) return null;

  // Show notification after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowNotification(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const whatsappNumber = "237654172703";
  const defaultMessage = "Bonjour Kheops Set, je souhaite en savoir plus sur l'Arsenal.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[320px] md:w-[360px] bg-black border border-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-zinc-900 p-6 border-b border-gold/20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center bg-black overflow-hidden">
                     <span className="text-gold font-display text-xl font-black">KS</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
                <div>
                  <h3 className="text-white font-display text-lg uppercase tracking-wider leading-none">Kheops Set Support</h3>
                  <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mt-1">En ligne • Réponse rapide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-[url('/images/noise.png')] bg-repeat">
              <div className="bg-zinc-900/80 p-4 border-l-2 border-gold mb-6 backdrop-blur-sm">
                <p className="text-white/80 text-sm leading-relaxed">
                  Bâtisseur, comment pouvons-nous vous aider dans votre ascension ?
                </p>
                <span className="text-[9px] text-white/30 uppercase tracking-widest mt-2 block">L'Équipe KSM</span>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-4">Besoin d'assistance ?</p>
                {[
                  { label: "Je n'ai pas reçu mon PDF", msg: "Salut l'équipe KSM, je viens d'acheter un produit mais je n'ai pas encore reçu mon mail de téléchargement." },
                  { label: "Souci avec mon paiement", msg: "Bonjour, j'ai essayé de passer commande mais mon paiement semble avoir échoué. Pouvez-vous vérifier ?" },
                  { label: "Lien de téléchargement perdu", msg: "Bonjour, j'ai perdu mon accès à mon outil de l'Arsenal, pourriez-vous me renvoyer mon lien ?" },
                  { label: "Besoin d'un conseil de lecture", msg: "Bonjour Kheops Set, je suis un peu indécis sur le choix de mon premier outil. Quel manuel me conseillez-vous pour commencer mon ascension ?" }
                ].map((q, i) => (
                  <a
                    key={i}
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(q.msg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-3 bg-white/5 border border-white/10 text-white/70 text-xs hover:border-gold/50 hover:text-gold transition-all group"
                  >
                    {q.label} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer / CTA */}
            <div className="p-6 pt-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-gold text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 shadow-[0_10px_20px_rgba(238,177,73,0.2)]"
              >
                <MessageCircle className="w-4 h-4" /> Démarrer la discussion
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotification(false);
        }}
        className="relative w-16 h-16 rounded-full bg-black border-2 border-gold flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] group overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {isOpen ? (
          <X className="w-8 h-8 text-gold" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-8 h-8 text-gold" />
            {showNotification && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-black flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </motion.div>
            )}
          </div>
        )}
      </motion.button>
    </div>
  );
}
