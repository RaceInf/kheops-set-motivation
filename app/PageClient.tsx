"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { ChevronRight, ArrowDownRight, Shield, Target, Flame, ArrowUpRight, Zap, Hammer, Users, Wrench, Settings, Ban, BookOpen, Ruler, EyeOff, ChevronLeft, Youtube, Instagram, Facebook, MessageCircle } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { tools, blogPosts } from '@/lib/data';
import * as gtag from '@/lib/gtag';

const brutalEase = [0.85, 0, 0.15, 1] as const;

export default function PageClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-gold selection:text-black overflow-x-hidden relative flex flex-col font-sans">
      <Navbar />
      <main className="flex flex-col flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-8">
        <Hero />
        <div className="h-32 md:h-64" /> {/* Spacer */}
        <Manifesto />
        <div className="h-32 md:h-64" /> {/* Spacer */}
        <Blog />
        <div className="h-32 md:h-64" /> {/* Spacer */}
        <Boutique />
        <div className="h-32 md:h-64" /> {/* Spacer */}
        <Contact />
        <div className="h-32 md:h-64" /> {/* Spacer */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: brutalEase, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-black/90 backdrop-blur-md py-4 border-b border-white/10" : "bg-transparent py-8 md:py-12"
        }`}
    >
      <div className="flex justify-between items-end px-4 md:px-12 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col">
          <span className="text-gold text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase mb-1">Kheops Set Motivation</span>
          <div className="font-display text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            Kheops<span className="text-gold">.</span>
          </div>
        </div>
        <nav className="hidden lg:flex gap-10 text-[10px] font-bold tracking-widest uppercase mb-1">
          <a href="#accueil" className="hover:text-gold transition-colors duration-200">Accueil</a>
          <a href="#manifeste" className="hover:text-gold transition-colors duration-200">Manifeste</a>
          <a href="#articles" className="hover:text-gold transition-colors duration-200">Les Archives</a>
          <a href="#arsenal" className="hover:text-gold transition-colors duration-200">Arsenal</a>
          <a href="#reseau" className="hover:text-gold transition-colors duration-200">Le Réseau</a>
        </nav>
        <div className="mb-1 hidden md:block">
          <Link
            href="/arsenal"
            onClick={() => gtag.event({ action: 'click_navbar_cta', category: 'engagement', label: 'Accéder à l\'Arsenal' })}
            className="px-5 py-2.5 border border-gold text-gold text-[10px] font-bold tracking-widest uppercase hover:bg-gold hover:text-black transition-all cursor-pointer flex items-center gap-2 group"
          >
            ACCÉDER À L&apos;ARSENAL <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  const titleWords = ["Deviens", "Un", "Bâtisseur"];

  return (
    <section id="accueil" className="w-full pt-32 md:pt-64 relative">
      {/* Background Image that covers the hero section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-full z-0 pointer-events-none opacity-40 bg-zinc-950">
        <Image
          src="/images/hero-principal.jpg"
          alt="Bâtisseur background"
          fill
          className="object-cover grayscale mix-blend-luminosity"
          priority
          loading="eager"
          unoptimized
        />
        {/* Gradients pour garder la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/60 to-zinc-950"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10">
        <div className="lg:col-span-8 flex flex-col">
          <div className="overflow-hidden mb-6">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: brutalEase, delay: 0.4 }}
              className="flex items-center gap-4 text-gold font-sans text-xs uppercase tracking-[0.4em] font-bold"
            >
              <div className="w-12 h-[2px] bg-gold"></div>
              Ordre, Discipline, Souveraineté
            </motion.div>
          </div>

          <h1 className="font-display text-7xl md:text-[12vw] lg:text-[10vw] leading-[0.8] tracking-tighter uppercase flex flex-col">
            {titleWords.map((word, index) => (
              <span key={index} className="overflow-hidden block relative">
                <motion.span
                  initial={{ y: "110%", skewY: 5 }}
                  animate={{ y: 0, skewY: 0 }}
                  transition={{ duration: 1, ease: brutalEase, delay: 0.5 + index * 0.15 }}
                  className="block transform-origin-bottom-left"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 pb-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: brutalEase, delay: 1 }}
            className="font-sans text-white/50 text-base md:text-xl leading-relaxed font-light lg:max-w-[400px]"
          >
            L&apos;élite n&apos;attend pas. <span className="text-white">La complaisance est un poison.</span> Forge ton esprit, accumule le capital et bâtis ton empire sans demander la permission.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: brutalEase, delay: 1.2 }}
          >
            <Link
              href="#newsletter"
              onClick={() => gtag.event({ action: 'click_hero_cta', category: 'engagement', label: 'Rejoindre le Q.G.' })}
              className="inline-flex py-5 px-10 bg-gold text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all duration-500 items-center gap-4 group"
            >
              REJOINDRE LE Q.G. <ArrowDownRight className="w-5 h-5 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="mt-24 md:mt-48 w-full border-t border-white/10 pt-8 flex justify-between items-center overflow-hidden h-12">
        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-white/20 whitespace-nowrap animate-marquee flex gap-12">
          <span>CONSTRUIS OU SUBIS</span>
          <span>•</span>
          <span>SOUVERAINETÉ FINANCIÈRE</span>
          <span>•</span>
          <span>DISCIPLINE RADICALE</span>
          <span>•</span>
          <span>ORDRE DU BÂTISSEUR</span>
          <span>•</span>
          <span>ZÉRO EXCUSE</span>
          <span>•</span>
          <span>ARCHITECTURE MENTALE</span>
          <span>•</span>
          <span>DISCIPLINE RADICALE</span>
          <span>•</span>
          <span>ORDRE DU BÂTISSEUR</span>
          <span>•</span>
          <span>CONSTRUIS OU SUBIS</span>
        </div>
      </div>
    </section>
  );
}


function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [200, -200]);

  const laws = [
    { title: "TU NE MENDIES PAS TA VIE. TU LA CONSTRUIS.", desc: "Personne ne viendra te sauver. Personne ne te doit rien. Le jour où tu acceptes ça, tu deviens dangereux.", icon: Hammer },
    { title: "TON ENTOURAGE EST TON PREMIER PLAFOND.", desc: "Montre-moi les 5 personnes que tu fréquentes le plus, et je te montrerai ton avenir. Si elles ne construisent pas, elles te ralentissent.", icon: Users },
    { title: "L'ARGENT N'EST PAS UN OBJECTIF. C'EST UN OUTIL.", desc: "L'objectif, c'est la liberté. L'argent n'est que le matériau. Si tu cours après l'argent sans plan, tu seras toujours fauché.", icon: Wrench },
    { title: "LA DISCIPLINE REMPLACE LA MOTIVATION.", desc: "La motivation est un feu de paille. La discipline est un générateur. Tu ne te demandes pas si tu as envie. Tu l'exécutes.", icon: Settings },
    { title: "TU NE CHERCHES PAS LE CONFORT. TU CHERCHES LA SOLIDITÉ.", desc: "Le confort te rend mou. La solidité te rend libre. Construis une base que rien ne peut ébranler.", icon: Shield },
    { title: "TU DIS NON POUR POUVOIR DIRE OUI.", desc: "Chaque oui que tu donnes aux autres est un non que tu donnes à toi-même. Apprends à refuser sans culpabiliser.", icon: Ban },
    { title: "TU NE CONSOMMES PAS DU CONTENU. TU APPLIQUES LES OUTILS.", desc: "Lire sans agir est du divertissement déguisé en productivité. Chaque contenu est un outil. Si tu ne l'utilises pas, tu perds ton temps.", icon: BookOpen },
    { title: "TU NE TE COMPARES PAS. TU TE MESURES.", desc: "La comparaison est une prison. La mesure est un GPS. Ton seul adversaire, c'est la version de toi qui a arrêté d'avancer hier.", icon: Ruler },
    { title: "TU CONSTRUIS EN SILENCE. LES RÉSULTATS PARLENT.", desc: "Pas d'annonces. Pas de projets partagés avant l'exécution. Tu poses tes briques dans le silence. Quand le mur est debout, personne ne peut contester.", icon: EyeOff },
  ];

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(laws.length / 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 15000); // Augmenté de 8s à 15s pour un meilleur confort de lecture
    return () => clearInterval(timer);
  }, [totalPages]);

  const currentLaws = laws.slice(page * 3, page * 3 + 3);

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <section id="manifeste" ref={ref} className="w-full relative py-12">
      <div className="absolute -left-20 top-0 text-[35vw] font-display text-white/[0.02] leading-none select-none pointer-events-none hidden lg:block">
        02
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        <div className="lg:col-span-5 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gold"></span> Architecture Mentale
            </div>
            <h2 className="font-display text-6xl md:text-8xl tracking-tighter leading-[0.8] uppercase mb-12">
              Le <span className="text-white/30">Code</span> <br />Du Bâtisseur
            </h2>

            <div className="p-8 border-l border-white/20 bg-white/5 backdrop-blur-sm">
              <p className="font-sans text-sm md:text-base leading-relaxed text-white/70 italic">
                &quot;La société moderne encourage la faiblesse, l&apos;endettement et l&apos;excuse permanente.
                Chez Kheops Set Motivation, nous rejetons ce narratif. Nous construisons une génération de Bâtisseurs.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-px bg-white/30"></div>
                <span className="text-[10px] uppercase tracking-widest text-white/50">Kheops Set</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-7 flex flex-col pt-4">
          <div className="flex flex-col flex-1 min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: brutalEase }}
                className="flex flex-col gap-4"
              >
                {currentLaws.map((item, i) => (
                  <div
                    key={page * 3 + i}
                    className="flex flex-col md:flex-row md:items-center gap-6 p-8 border border-white/10 bg-white/[0.02] group hover:border-gold/50 hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="font-display text-5xl text-white/10 group-hover:text-gold transition-colors w-16 shrink-0 leading-none">0{page * 3 + i + 1}</div>
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-bold mb-2 uppercase tracking-wide group-hover:text-gold transition-colors">{item.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed max-w-lg">{item.desc}</p>
                    </div>
                    <item.icon className="w-8 h-8 text-white/10 group-hover:text-gold transition-all duration-500 shrink-0 absolute -right-2 -bottom-2 md:relative md:right-0 md:bottom-0" />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-12 py-6 border-t border-white/10">
            <button onClick={prevPage} className="p-4 border border-white/10 hover:border-gold hover:text-gold text-white/30 transition-all group cursor-pointer rounded-full">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`relative h-1 transition-all duration-500 cursor-pointer ${i === page ? 'w-12 bg-gold' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                  aria-label={`Aller à la page ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={nextPage} className="p-4 border border-white/10 hover:border-gold hover:text-gold text-white/30 transition-all group cursor-pointer rounded-full">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Blog() {
  const posts = blogPosts.slice(0, 3);
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="articles" ref={ref} className="w-full relative py-12 overflow-hidden bg-zinc-950 -mx-4 md:-mx-8 px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start py-12 md:py-24">
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gold"></span> Zone de Transmission
            </div>
            <h2 className="font-display text-7xl md:text-[8vw] lg:text-[6vw] tracking-tighter leading-[0.8] uppercase mb-8">
              Les Archives <br /><span className="text-white/20">Publiques</span>
            </h2>
            <p className="font-sans text-sm md:text-lg text-white/40 leading-relaxed mb-12 max-w-sm">
              Archives publiques. Études de cas, analyses et démonstrations de l&apos;ingénierie financière du Bâtisseur.
            </p>
            <Link
              href="/articles"
              onClick={() => gtag.event({ action: 'view_all_blog', category: 'navigation', label: 'Toutes les archives' })}
              className="inline-flex py-4 px-8 bg-white/5 hover:bg-gold hover:text-black transition-all duration-500 font-bold uppercase tracking-[0.34em] text-[10px] items-center gap-3 border border-white/10 hover:border-gold group"
            >
              Toutes les archives <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: brutalEase, delay: idx * 0.1 }}
              className="group relative overflow-hidden"
            >
              <Link href={`/articles/${post.id}`} className="block border border-white/5 bg-white/[0.01] p-8 md:p-12 hover:bg-white/[0.04] transition-all duration-500 hover:border-white/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                      <span className="text-gold">{post.category}</span>
                      <span className="text-white/20">—</span>
                      <span className="text-white/40">{post.date}</span>
                    </div>
                    <h3 className="font-display text-4xl md:text-6xl uppercase leading-none tracking-tighter group-hover:translate-x-4 transition-transform duration-500">{post.title}</h3>
                  </div>
                  <div className="p-4 border border-white/10 rounded-full group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-500">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex justify-center lg:justify-start mt-8"
          >
            <div className="font-display text-[15vw] text-white/[0.02] leading-none select-none pointer-events-none">03</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function Boutique() {
  const products = tools.slice(0, 3);
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="arsenal" ref={ref} className="w-full py-12">
      <div className="flex flex-col mb-24">
        <div className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-gold"></span> Ressources de l&apos;Élite
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <h2 className="font-display text-7xl md:text-9xl tracking-tighter leading-[0.8] uppercase">
            L&apos;<span className="text-white/30">Arsenal</span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-white/50 uppercase tracking-[0.2em] max-w-xs lg:text-right leading-relaxed">
            Outils, stratégies, et protocoles réservés à ceux qui sont prêts à payer le prix de l&apos;excellence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: brutalEase, delay: idx * 0.1 }}
            className="group relative flex flex-col p-8 md:p-10 lg:p-14 bg-zinc-900/50 border border-white/5 hover:bg-white/[0.04] hover:border-gold/30 transition-all duration-700 min-h-[500px]"
          >
            <div className="absolute top-0 right-0 p-8 text-8xl font-display text-white/5 leading-none transition-all group-hover:text-gold/10 group-hover:-translate-y-2">
              0{idx + 1}
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-12">
                <span className="text-gold text-[10px] font-mono tracking-widest px-3 py-1 border border-gold/20 rounded-full uppercase">
                  {idx === 0 ? "CODE" : idx === 1 ? "PROTOCOLE" : "CAPITAL"}
                </span>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <Link
                  href={`/arsenal/${product.id}`}
                  onClick={() => gtag.event({ action: 'click_boutique_item', category: 'ecommerce', label: product.title })}
                >
                  <h3 className="font-display text-5xl md:text-6xl uppercase leading-[0.9] mb-6 group-hover:text-gold transition-colors duration-500">{product.title}</h3>
                </Link>
                <p className="font-sans text-xs md:text-sm text-white/40 leading-relaxed max-w-xs">{product.desc}</p>
              </div>

              <div className="mt-12 space-y-8">
                <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
                  <span className="font-display text-3xl">{product.price}</span>
                  <span className="text-[10px] uppercase text-white/30 tracking-[0.2em]">{product.category}</span>
                </div>

                <Link
                  href={`/arsenal/${product.id}`}
                  onClick={() => gtag.event({ action: 'click_boutique_cta', category: 'ecommerce', label: product.cta + ' - ' + product.title })}
                  className="block w-full py-5 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-500 font-bold text-center uppercase tracking-[0.3em] text-[10px]"
                >
                  {product.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Link href="/arsenal" className="group flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 hover:text-gold transition-colors">
          <span className="h-px w-12 bg-white/10 group-hover:bg-gold transition-colors"></span>
          Voir tout l&apos;arsenal
          <span className="h-px w-12 bg-white/10 group-hover:bg-gold transition-colors"></span>
        </Link>
      </div>
    </section>
  );
}

function Contact() {
  const socials = [
    { name: "Facebook", url: "https://www.facebook.com/KheopsSetMotivation", icon: Facebook },
    { name: "WhatsApp", url: "https://wa.me/237654172703", icon: MessageCircle },
    { name: "YouTube", url: "https://www.youtube.com/@kheopset.motivation", icon: Youtube },
    { name: "Instagram", url: "https://www.instagram.com/kheopset.motivation", icon: Instagram },
  ];
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="reseau" ref={ref} className="w-full relative py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-4 border-l border-white/10 p-12 bg-zinc-950 flex flex-col justify-center min-h-[400px] relative overflow-hidden group">
          {/* Background image */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 transition-opacity duration-700 bg-zinc-950">
            <Image
              src="/images/section-reseau.jpg"
              alt="Background réseau"
              fill
              className="object-cover grayscale mix-blend-luminosity"
              unoptimized
              loading="eager"
            />
            {/* Gradients pour garder la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20"></div>
          </div>

          <div className="absolute top-0 right-0 p-8 text-9xl font-display text-white/5 leading-none transition-colors group-hover:text-gold/10 z-10">04</div>
          <div className="relative z-10">
            <h2 className="font-display text-6xl md:text-8xl uppercase leading-[0.8] tracking-tighter mb-6 transition-transform duration-700 group-hover:-translate-y-2">
              Le <br /><span className="text-white/30">Réseau</span>
            </h2>
            <p className="text-[10px] uppercase text-white/40 tracking-[0.4em] mb-12">Transmissions Publiques</p>
            <div className="w-16 h-1 bg-gold"></div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10">
          {socials.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Suivre Kheops Set Motivation sur ${s.name}`}
              onClick={() => gtag.event({ action: 'click_social', category: 'social', label: s.name })}
              className="bg-black p-12 md:p-16 hover:bg-gold hover:text-black transition-all duration-700 flex flex-col items-center justify-center text-center group relative overflow-hidden"
            >
              <s.icon className="w-10 h-10 mb-6 opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 relative z-10" />
              <span className="font-display text-3xl md:text-5xl uppercase tracking-tighter relative z-10">{s.name}</span>
              <div className="absolute bottom-4 text-[8px] uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">Connecter</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Client-side validation: must have @ and a dot in the domain part
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage("Format d'email invalide. (ex: name@domain.com)");
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        gtag.event({ action: 'generate_lead', category: 'engagement', label: 'Newsletter Signup' });
        setStatus('success');
        setEmail("");
      } else {
        setStatus('error');
        setMessage(data.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
      setMessage("Une erreur est survenue.");
    }
  };

  return (
    <section id="newsletter" className="w-full py-12 lg:py-24">
      <div className="relative overflow-hidden border border-white/10 bg-zinc-950 p-12 md:p-24 flex flex-col lg:flex-row items-center gap-16 group">

        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30 transition-opacity duration-1000 bg-zinc-950">
          <Image
            src="/images/section-capture-email.jpg"
            alt="Protocole background"
            fill
            className="object-cover grayscale mix-blend-luminosity"
            unoptimized
            loading="eager"
          />
          {/* Gradients pour garder la lisibilité maximale du texte */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50 z-10"></div>

        <div className="flex-1 flex flex-col gap-8 relative z-10">
          <div className="flex items-center gap-4 text-gold text-[10px] font-bold tracking-[0.5em] uppercase">
            <Zap className="w-4 h-4" /> Le Journal du Bâtisseur
          </div>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.8] tracking-tighter">
            Reçois <br /><span className="text-white/30">Le Protocole.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-white/40 leading-relaxed max-w-lg">
            Une fois par semaine, un email brutal d&apos;éducation financière et stratégique. <span className="text-white">Pas de bullshit.</span> Juste de l&apos;exécution pure.
          </p>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-12 relative z-10">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="border-b border-white/20 focus-within:border-gold transition-colors">
              <input
                type="email"
                placeholder="TON EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-4 text-sm focus:outline-none placeholder:text-white/20 uppercase tracking-[0.3em] font-bold"
                required
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full py-6 font-black text-xs uppercase tracking-[0.4em] transition-all duration-500 ${status === 'success'
                ? 'bg-gold text-black'
                : 'bg-white text-black hover:bg-gold'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === 'loading' ? 'ENREGISTREMENT...' : status === 'success' ? 'ACCÈS AUTORISÉ' : "S'ABONNER AU PROTOCOLE"}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">{message}</p>
            )}
            {status === 'success' && (
              <p className="text-gold text-[10px] uppercase font-bold tracking-widest text-center">Ton entrée a été consignée.</p>
            )}
          </form>

          <div className="flex items-center gap-6 justify-center lg:justify-start">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-display text-white">100%</span>
              <span className="text-[8px] uppercase tracking-widest text-white/30">Souverain</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-display text-white">0%</span>
              <span className="text-[8px] uppercase tracking-widest text-white/30">Bullshit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


