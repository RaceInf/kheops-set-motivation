"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Target, ChevronRight } from "lucide-react";

interface SummaryCarouselProps {
  items: string[];
}

export default function SummaryCarousel({ items }: SummaryCarouselProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Pour "Le Capital du Bâtisseur", on divise en 3 parties
  // Partie 1: 0-3 (Partie 1 + Ch 1, 2, 3)
  // Partie 2: 4-7 (Partie 2 + Ch 4, 5, 6)
  // Partie 3: 8-11 (Partie 3 + Ch 7, 8 + Conclusion)
  
  const sections = [
    {
      title: "LA DÉFENSE",
      icon: <Shield className="w-5 h-5" />,
      content: items.slice(0, 4)
    },
    {
      title: "L'OFFENSIVE",
      icon: <Zap className="w-5 h-5" />,
      content: items.slice(4, 8)
    },
    {
      title: "L'ARMURE",
      icon: <Target className="w-5 h-5" />,
      content: items.slice(8)
    }
  ];

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex flex-col md:flex-row items-center justify-center gap-2 p-4 border transition-all duration-500 ${
              activeTab === idx 
                ? "bg-gold border-gold text-black" 
                : "bg-zinc-900 border-white/10 text-white/40 hover:border-white/30"
            }`}
          >
            {section.icon}
            <span className="font-display text-[10px] md:text-xs tracking-widest font-black uppercase">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="relative border border-white/10 bg-black p-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-black p-6 md:p-8 min-h-[350px] flex flex-col"
          >
            {/* Main Part Title */}
            <div className="flex items-center gap-4 mb-8 text-gold border-b border-gold/20 pb-4">
              <span className="font-display text-4xl opacity-20">{(activeTab + 1).toString().padStart(2, '0')}</span>
              <h3 className="font-display text-2xl md:text-3xl tracking-tight uppercase">{sections[activeTab].content[0]}</h3>
            </div>

            {/* Chapters List */}
            <div className="space-y-4">
              {sections[activeTab].content.slice(1).map((chapter, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="mt-1.5 w-1 h-1 bg-gold rounded-full shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-white/80 text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                    {chapter}
                  </p>
                </div>
              ))}
            </div>

            {/* Hint */}
            <div className="mt-12 flex items-center gap-2 text-[9px] text-white/20 uppercase tracking-[0.3em] font-medium">
               <div className="w-8 h-[1px] bg-white/10" />
               Système validé par l&apos;Ordre
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
