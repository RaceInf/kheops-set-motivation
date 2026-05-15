"use client";

import { motion } from "motion/react";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { tools } from "@/lib/data";
import * as gtag from '@/lib/gtag';
import { trackEvent } from '@/lib/analytics';
import StickyCTA from "@/components/StickyCTA";

const brutalEase = [0.85, 0, 0.15, 1] as const;

export default function ArsenalClient() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black font-sans p-4 md:p-8 flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-white/20 pb-6 mb-4 px-2 w-full max-w-[1600px] mx-auto gap-4">
        <div className="flex flex-col">
          <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-1">
            Matériel
          </span>
          <div className="font-display text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            L&apos;Arsenal
          </div>
        </div>
        <Link
          href="/"
          className="md:mb-1 inline-flex px-4 py-2 border border-white/20 text-white/50 text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3" /> Retour à l&apos;accueil
        </Link>
      </header>

      <main className="flex flex-col gap-4 flex-grow w-full max-w-[1600px] mx-auto mt-4 md:mt-8">
        <section className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12 border border-white/20 bg-gold text-black p-8 md:p-12 flex flex-col md:flex-row justify-between items-center md:items-end">
            <div>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.8] tracking-tighter uppercase flex flex-col">
                <span>L&apos;Arsenal</span>
              </h2>
            </div>
            <div className="md:max-w-sm text-center md:text-right mt-4 md:mt-0">
              <p className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
                Outils, stratégies, et protocoles réservés à ceux qui sont prêts
                à payer le prix de l&apos;excellence.
              </p>
            </div>
          </div>

          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 border border-white/10 bg-white/5 mb-8">
            <div className="flex flex-col gap-4">
              <span className="text-gold font-display text-2xl uppercase">01. Terrain</span>
              <p className="text-white/60 text-sm leading-relaxed">Pas de théorie abstraite. Ces outils ont été forgés sur le terrain. Ils résolvent des problèmes concrets pour des Bâtisseurs réels.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-gold font-display text-2xl uppercase">02. Radical</span >
              <p className="text-white/60 text-sm leading-relaxed">Aucun ménagement pour la médiocrité. Préparez-vous à des électrochocs destinés à purger ce qui vous ralentit.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-gold font-display text-2xl uppercase">03. Immédiat</span>
              <p className="text-white/60 text-sm leading-relaxed">Téléchargement immédiat. Application immédiate. Des résultats dès les premières heures de mise en œuvre.</p>
            </div>
          </div>

          <div id="liste-arsenal" className="md:col-span-12 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-white/20 flex-grow" />
              <h3 className="font-display text-2xl uppercase tracking-widest text-gold px-4">Inventaire Disponible</h3>
              <div className="h-px bg-white/20 flex-grow" />
            </div>
          </div>

          {tools.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: brutalEase, delay: idx * 0.1 }}
              className="group flex flex-col relative border transition-all duration-500 min-h-[350px] md:col-span-6 lg:col-span-4 border-white/20 bg-white/5 hover:border-gold hover:bg-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-[80px] font-display text-white/5 leading-none transition-colors group-hover:text-gold/10 z-20 pointer-events-none">
                0{idx + 1}
              </div>

              {product.image && (
                <div className="relative w-full aspect-[4/3] border-b border-white/10 overflow-hidden shrink-0 bg-zinc-950">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    priority={idx < 2}
                    className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}

              <div className="p-8 flex flex-col flex-grow">
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <h3 className="text-xs font-bold tracking-widest uppercase">
                    Boutique Digitale
                  </h3>
                  <span className="text-gold text-[10px] font-mono">
                    [DISPONIBLE]
                  </span>
                </div>

                <div className="relative z-10 mb-8 flex-grow">
                  <Link
                    href={`/arsenal/${product.id}`}
                    onClick={() => {
                      gtag.event({ action: 'click_arsenal_item', category: 'ecommerce', label: product.title });
                      trackEvent('click_product_card', { productId: product.id });
                    }}
                  >
                    <h3 className="font-display text-4xl uppercase leading-none mb-4 group-hover:text-gold transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="font-sans text-xs text-white/50 line-clamp-3">
                    {product.desc}
                  </p>
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center group-hover:border-gold/30 transition-colors">
                    <span className="font-display text-2xl">
                      {product.price}
                    </span>
                    <span className="text-[10px] uppercase text-white/40 tracking-widest">
                      {product.category}
                    </span>
                  </div>

                  <Link
                    href={`/arsenal/${product.id}`}
                    onClick={() => {
                      gtag.event({ action: 'click_arsenal_cta', category: 'ecommerce', label: product.cta + ' - ' + product.title });
                      trackEvent('click_buy_button', { productId: product.id, source: 'arsenal_list' });
                    }}
                    className="w-full py-4 bg-gold text-black font-black text-xs text-center uppercase tracking-[0.2em] hover:bg-white transition-colors"
                  >
                    {product.cta}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="mt-16 w-full border border-white/10 bg-white/5 p-8 md:p-12 mb-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="font-display text-4xl uppercase tracking-tighter text-gold mb-4">Base de Données / F.A.Q</h2>
            <p className="text-white/50 text-sm max-w-xl">Les réponses aux questions les plus fréquentes. Lisez attentivement avant d&apos;ouvrir un ticket au Bureau de l&apos;Architecte.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Comment vais-je recevoir l&apos;outil ?</h4>
              <p className="text-white/60 text-sm leading-relaxed">Tous nos protocoles temporels et fichiers opérationnels sont numériques. L&apos;accès vous est transmis par e-mail immédiatement après la confirmation du paiement.</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Ces protocoles sont-ils adaptés à tout le monde ?</h4>
              <p className="text-white/60 text-sm leading-relaxed">Absolument pas. Ils sont destinés uniquement aux Bâtisseurs. Si vous cherchez des solutions de facilité ou si vous êtes facilement offusqué par la réalité brutale, passez votre chemin.</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Les prix vont-ils augmenter ?</h4>
              <p className="text-white/60 text-sm leading-relaxed">Oui. L&apos;inventaire de l&apos;Arsenal prend de la valeur au fur et à mesure que les retours du terrain s&apos;accumulent. Sécurisez vos outils maintenant.</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Politique de remboursement</h4>
              <p className="text-white/60 text-sm leading-relaxed">Ceci est une forge de Bâtisseurs, pas une association caritative. Le savoir est transmis de manière instantanée, il n&apos;y a donc aucun remboursement.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyCTA targetId="liste-arsenal" />
    </div>
  );
}
