"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Download, Zap } from "lucide-react";

const VILLES = [
  "Douala", "Yaoundé", "Abidjan", "Dakar", "Cotonou", "Libreville", "Brazzaville", "Kinshasa", 
  "Paris", "Bruxelles", "Bamako", "Lomé", "Ouagadougou", "Casablanca", "Alger", "Tunis", 
  "Montréal", "Lyon", "Marseille", "Bordeaux", "Toulouse", "Genève", "Luxembourg", "Port-Louis", 
  "Antananarivo", "Niamey", "N'Djamena", "Bangui", "Malabo", "Bujumbura", "Kigali", "Djibouti", 
  "Nouakchott", "Conakry", "Port-Gentil", "Bouaké", "San-Pédro", "Korhogo", "Bobo-Dioulasso", 
  "Pointe-Noire", "Lubumbashi", "Goma", "Garoua", "Maroua", "Bafoussam", "Nantes", "Lille", "Strasbourg"
];

const PRODUITS = [
  { id: "le-code-du-batisseur", name: "Le Code du Bâtisseur" },
  { id: "le-protocole-disolation", name: "Le Protocole d'Isolation" },
  { id: "le-capital-du-batisseur", name: "Le Capital du Bâtisseur" }
];

const PHRASES = [
  "Un Bâtisseur de {ville} vient de s'équiper de {produit}.",
  "Accès débloqué : {produit} ({ville}).",
  "Nouvelle acquisition : {produit} ({ville}).",
  "Équipement validé pour un Bâtisseur de {ville}.",
  "Le dossier {produit} a été transmis à {ville}.",
  "Transmission terminée : {produit} vers {ville}.",
  "Système mis à jour : {produit} acquis à {ville}.",
  "Un nouveau membre de {ville} a débloqué {produit}.",
  "Arsenal complété : {produit} (Bâtisseur de {ville}).",
  "Nouveau téléchargement de {produit} à {ville}."
];

export default function SalesFlux() {
  const [currentNotification, setCurrentNotification] = useState<{
    text: string;
    productName: string;
    city: string;
  } | null>(null);

  const generateNotification = () => {
    const ville = VILLES[Math.floor(Math.random() * VILLES.length)];
    const produit = PRODUITS[Math.floor(Math.random() * PRODUITS.length)];
    const phraseTemplate = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    
    const text = phraseTemplate
      .replace("{ville}", ville)
      .replace("{produit}", produit.name);

    setCurrentNotification({
      text,
      productName: produit.name,
      city: ville
    });
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNext = (delay: number) => {
      timeoutId = setTimeout(() => {
        generateNotification();
        
        // Après avoir affiché une notif, on planifie la suivante avec un délai aléatoire
        // Entre 15 et 45 secondes
        const nextDelay = Math.floor(Math.random() * (45000 - 15000) + 15000);
        scheduleNext(nextDelay);
      }, delay);
    };

    // Premier affichage après 10 secondes
    scheduleNext(10000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Effacer la notification après 7 secondes d'affichage
  useEffect(() => {
    if (currentNotification) {
      const hideTimer = setTimeout(() => {
        setCurrentNotification(null);
      }, 7000);
      return () => clearTimeout(hideTimer);
    }
  }, [currentNotification]);

  return (
    <div className="fixed bottom-6 left-6 z-[9998] pointer-events-none sm:pointer-events-auto">
      <AnimatePresence>
        {currentNotification && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="flex items-center gap-4 bg-black border border-gold/40 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] max-w-[300px] md:max-w-[380px] backdrop-blur-md"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-gold/10 flex items-center justify-center border border-gold/20">
              <ShieldCheck className="w-5 h-5 text-gold" />
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                  Flux Arsenal Direct
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-white/90 leading-tight font-medium">
                {currentNotification.text.split(currentNotification.productName)[0]}
                <span className="text-gold font-bold">{currentNotification.productName}</span>
                {currentNotification.text.split(currentNotification.productName)[1]}
              </p>
            </div>

            {/* Micro-animation de barre de progression en bas */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 7, ease: "linear" }}
              className="absolute bottom-0 left-0 h-[1px] bg-gold/50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
