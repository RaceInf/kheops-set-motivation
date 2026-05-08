"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Filter, Activity, ShieldCheck, Database, Zap, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { blogPosts } from '@/lib/data';
import * as gtag from '@/lib/gtag';

const brutalEase = [0.85, 0, 0.15, 1] as const;

const categories = ["Tous", "Dossier", "Stratégie", "Analyse", "Tactique", "Mindset", "Système", "Fondation"];

export default function ArticlesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Tous" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPosts = filteredPosts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    gtag.event({ action: 'filter_category', category: 'engagement', label: cat });
    setActiveCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black font-sans flex flex-col relative overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-12 py-6">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase">Notes de l&apos;Architecte</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              Les Archives <span className="text-white/20">Publiques</span>
            </h1>
          </div>

          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full xl:w-auto">
            <Link href="/" className="px-6 py-3 border border-white/10 text-white/50 text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all flex justify-center items-center gap-3">
              <ArrowLeft className="w-3 h-3" /> <span>ACCUEIL</span>
            </Link>
            <div className="relative w-full xl:w-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-gold transition-colors" />
              <input 
                type="text" 
                placeholder="RECHERCHER UN PROTOCOLE..." 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full xl:w-64 bg-white/5 border border-white/10 px-12 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-gold transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-12 py-12">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-16 border border-white/10">
          {[
            { label: "Transmissions", value: blogPosts.length, icon: Activity },
            { label: "Statut", value: "OPÉRATIONNEL", icon: ShieldCheck },
            { label: "Accès", value: "PUBLIC", icon: Zap },
            { label: "Capacité", value: "98.2%", icon: Database },
          ].map((stat, i) => (
            <div key={i} className="bg-black p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3 text-white/30">
                <stat.icon className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-xl md:text-2xl font-display uppercase tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0 space-y-12">
            <div>
              <h2 className="text-white/20 text-[10px] font-bold tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
                <Filter className="w-3 h-3" /> Filtres Stratégiques
              </h2>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all text-left ${
                      activeCategory === cat 
                        ? "bg-gold border-gold text-black" 
                        : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block p-6 border border-white/5 bg-white/[0.02]">
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Attention: Les informations contenues dans ce Q.G sont destinées à une application immédiate. Le savoir sans exécution est un poison lent.
              </p>
            </div>
          </aside>

          {/* Listing Grid */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {currentPosts.length > 0 ? (
                  currentPosts.map((post, _) => (
                    <motion.div
                      layout
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: brutalEase }}
                      className="group"
                    >
                      <Link 
                        href={`/articles/${post.id}`} 
                        onClick={() => gtag.event({ action: 'view_article', category: 'engagement', label: post.title })}
                        className="block h-full border border-white/10 bg-white/[0.01] p-8 md:p-10 hover:border-gold/50 hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden"
                      >
                        {/* Decorative corner */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/0 group-hover:border-gold group-hover:w-12 group-hover:h-12 transition-all duration-500" />
                        
                        <div className="flex justify-between items-start mb-12">
                          <div className="flex flex-col gap-1">
                            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">{post.category}</span>
                            <span className="text-white/20 text-[10px] font-mono">{post.date}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-white/10 text-[8px] font-bold uppercase tracking-[0.3em] mb-1">Niveau d&apos;Accès</span>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] font-bold text-white/40 uppercase tracking-widest">Lvl_01_Public</span>
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="font-display text-3xl md:text-4xl uppercase leading-[0.85] tracking-tighter mb-4 group-hover:translate-x-2 transition-transform duration-500 group-hover:text-gold">
                            {post.title}
                          </h3>
                          <p className="text-sm text-white/40 leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-white/5 group-hover:border-gold/20 transition-colors">
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Examiner le Dossier</span>
                          <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="md:col-span-2 py-24 text-center border border-dashed border-white/10">
                    <div className="text-white/20 font-display text-4xl uppercase tracking-tighter mb-4">Aucune transmission trouvée</div>
                    <button 
                      onClick={() => { setSearchQuery(""); setActiveCategory("Tous"); }}
                      className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline"
                    >
                      Réinitialiser les paramètres
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`p-3 border border-white/10 flex items-center justify-center transition-all ${page === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:border-gold hover:text-gold'}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 border text-[10px] font-bold transition-all ${
                        page === i + 1 
                          ? "bg-gold border-gold text-black" 
                          : "border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`p-3 border border-white/10 flex items-center justify-center transition-all ${page === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:border-gold hover:text-gold'}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full max-w-[1600px] mx-auto pt-24 pb-12 px-4 md:px-8 flex flex-col gap-12 border-t border-white/5 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-6 flex flex-col gap-6">
            <div className="font-display text-4xl font-black tracking-tighter uppercase leading-none">
              Kheops<span className="text-gold">.</span>
            </div>
            <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest max-w-xs">
              L&apos;excellence n&apos;est pas une option. C&apos;est un système. 
              Bâtis ton empire brique par brique, dans le silence et la discipline.
            </p>
          </div>
          
          <div className="md:col-span-6 flex flex-wrap gap-12 md:justify-end">
            <div className="flex flex-col gap-4">
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Navigation</span>
              <div className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-white/40">
                <Link href="/#accueil" className="hover:text-gold transition-colors">Accueil</Link>
                <Link href="/#manifeste" className="hover:text-gold transition-colors">Manifeste</Link>
                <Link href="/#arsenal" className="hover:text-gold transition-colors">Arsenal</Link>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Social</span>
              <div className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-white/40">
                <a href="https://www.facebook.com/KheopsSetMotivation" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a>
                <a href="https://www.youtube.com/@kheopset.motivation" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">YouTube</a>
                <a href="https://wa.me/237654172703" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <div className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-white/20">
            © {new Date().getFullYear()} KHEOPS SET MOTIVATION — PROTÉGÉ PAR L&apos;ORDRE DU BÂTISSEUR
          </div>
          <div className="flex gap-8 text-[8px] uppercase tracking-widest text-white/30">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
