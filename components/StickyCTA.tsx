"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function StickyCTA({ targetId = "boutique" }: { targetId?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Apparaît après 500px de scroll
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCheckout = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] lg:hidden"
        >
          <button
            onClick={scrollToCheckout}
            className="w-full bg-zinc-950 text-gold h-14 flex items-center justify-between px-6 border-b border-gold/50 backdrop-blur-md active:bg-gold active:text-black transition-all relative overflow-hidden shadow-[0_5px_20px_rgba(238,177,73,0.15)]"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
            />

            <div className="flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse shadow-[0_0_10px_#eeb149]" />
              <span className="font-display text-sm md:text-base uppercase tracking-[0.2em] font-black">DÉVERROUILLER MON ACCÈS</span>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <span className="hidden sm:inline text-[9px] uppercase tracking-widest text-white/40 font-bold">Action Immédiate</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
