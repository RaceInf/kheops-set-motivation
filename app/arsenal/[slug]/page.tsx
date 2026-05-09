import { Metadata } from 'next';
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Shield, X, Target, Zap, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { tools } from "@/lib/data";
import ArsenalCta from '@/components/ArsenalCta';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((t) => t.id === slug);

  if (!tool) return {};

  return constructMetadata({
    title: tool.title,
    description: tool.desc,
    image: `/images/og/og-${slug}.jpg`,
    type: 'website',
    path: `/arsenal/${slug}`,
    ogTypeLabel: 'OUTIL DE L\'ARSENAL',
  });
}

export function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.id,
  }));
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = tools.find((t) => t.id === slug);

  if (!tool) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tool.title,
    "description": tool.desc,
    "image": tool.image ? `https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app${tool.image}` : undefined,
    "brand": {
      "@type": "Brand",
      "name": "Kheops Set Motivation"
    },
    "offers": {
      "@type": "Offer",
      "price": tool.price.replace('€', '').replace(' ', ''),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Arsenal",
        "item": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/arsenal"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.title,
        "item": `https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/arsenal/${tool.id}`
      }
    ]
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="flex flex-col gap-4 md:flex-row justify-between items-center md:items-end border-b-2 border-white/20 pb-6 mb-8 w-full max-w-[1200px] mx-auto text-center md:text-left">
        <Link
          href="/arsenal"
          className="inline-flex px-4 py-2 border border-white/20 text-white/50 text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3" /> Retour à l&apos;Arsenal
        </Link>
        <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
          Dossier du Bâtisseur
        </span>
      </header>

      <main className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 flex flex-col justify-start">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-black text-[10px] font-mono bg-gold px-3 py-1 font-bold">
              {tool.category}
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl uppercase leading-[0.85] tracking-tighter mb-8 text-white">
            {tool.title}
          </h1>

          {tool.image && (
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] mb-12 border border-white/20 p-2 bg-white/5">
              <div className="relative w-full h-full overflow-hidden bg-zinc-950">
                 <Image
                   src={tool.image}
                   alt={tool.title}
                   fill
                   priority
                   loading="eager"
                   className="object-cover object-center"
                 />
              </div>
            </div>
          )}

          <p className="font-sans text-xl md:text-2xl text-white/80 font-light leading-relaxed mb-12 border-l-4 border-gold pl-6">
            {tool.desc}
          </p>

          <div className="font-sans text-white/70 text-base md:text-lg leading-relaxed space-y-6 mb-16">
            <p>{tool.content}</p>
          </div>

          {/* S1: TU TE RECONNAIS */}
          {tool.recognition && (
            <section className="mb-16 border border-white/10 bg-white/[0.02] p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-gold" />
                <h2 className="font-display text-3xl uppercase tracking-widest">Tu te reconnais ?</h2>
              </div>
              <ul className="space-y-4">
                {tool.recognition.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2 shrink-0" />
                    <span className="text-white/70 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-16">
            {/* S2: CE N'EST PAS */}
            {tool.notThis && (
              <section className="border border-red-900/30 bg-red-950/10 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <X className="w-6 h-6 text-red-500" />
                  <h2 className="font-display text-2xl uppercase tracking-widest text-red-500">Ce n&apos;est pas</h2>
                </div>
                <ul className="space-y-4">
                  {tool.notThis.map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <X className="w-4 h-4 text-red-500/50 mt-1 shrink-0" />
                      <span className="text-white/60 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* S3: CE QUE C'EST */}
            {tool.isThis && (
              <section className="border border-gold/30 bg-gold/5 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Check className="w-6 h-6 text-gold" />
                  <h2 className="font-display text-2xl uppercase tracking-widest text-gold">Ce que c&apos;est</h2>
                </div>
                <ul className="space-y-4">
                  {tool.isThis.map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <Check className="w-4 h-4 text-gold/50 mt-1 shrink-0" />
                      <span className="text-white/80 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* S4: IL EST FAIT POUR VOUS SI... */}
          {tool.forYouIf && (
            <section className="mb-16 border border-white/20 bg-white/5 p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <Target className="w-8 h-8 text-gold" />
                <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter">Il est fait pour vous si...</h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {tool.forYouIf.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-black/40 p-4 border border-white/5">
                    <Zap className="w-5 h-5 text-gold shrink-0" />
                    <span className="text-white/90 font-bold tracking-wide text-sm md:text-base uppercase">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* S5: PREUVES SOCIALES / RETOURS */}
          {tool.testimonials && tool.testimonials.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <Shield className="w-8 h-8 text-gold" />
                <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter">Retours du Terrain</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tool.testimonials.map((testimonial: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                    <p className="text-white/80 italic mb-6">&quot;{testimonial.text}&quot;</p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                      <span className="font-bold text-gold uppercase text-xs tracking-widest">{testimonial.name}</span>
                      <span className="text-white/40 text-[10px] uppercase tracking-widest">{testimonial.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* S6: FAQ */}
          {tool.faq && tool.faq.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <Zap className="w-8 h-8 text-gold" />
                <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter">F.A.Q.</h2>
              </div>
              <div className="space-y-4">
                {tool.faq.map((faqItem: any, idx: number) => (
                  <div key={idx} className="bg-black border border-white/10 p-6">
                    <h3 className="text-gold font-bold text-sm md:text-base uppercase tracking-widest mb-3">{faqItem.q}</h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">{faqItem.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-8 flex flex-col gap-6">
            
            {/* BLOC PRIX & CTA */}
            <div className="border border-white/10 bg-white/5 p-8 flex flex-col gap-8 backdrop-blur-sm">
              <div className="text-center pb-8 border-b border-white/10">
                <h3 className="font-sans text-xs text-white/50 uppercase tracking-widest mb-4">
                  Investissement Requis
                </h3>
                <div className="font-display text-5xl md:text-6xl text-gold">
                  {tool.price}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-sm text-white/80">Accès immédiat après validation</p>
                </div>
              </div>

              <ArsenalCta 
                checkoutUrl={(tool as any).checkoutUrl} 
                cta={tool.cta} 
                title={tool.title} 
              />

              <p className="text-[9px] text-center text-white/40 uppercase tracking-widest leading-relaxed">
                En cliquant, vous acceptez les conditions de transmission KSM.
                En accédant immédiatement au contenu numérique, vous renoncez expressément à votre droit de rétractation (Art. L221-28).
              </p>
            </div>

            {/* BLOC MOYENS DE PAIEMENT (EN DEHORS DU BLOC PRIX) */}
            <div className="flex flex-col gap-6 items-center justify-center pt-8 pb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium flex items-center gap-2">
                <Shield className="w-3 h-3 text-white/30" /> Paiement 100% Sécurisé
              </span>
              
              <div className="flex gap-3 md:gap-4 items-center justify-center flex-wrap">
                
                {/* VISA */}
                <div className="h-[34px] w-[54px] md:h-[40px] md:w-[64px] bg-white rounded flex items-center justify-center opacity-[0.6] hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="relative h-[40%] w-[65%]">
                    <Image src="/images/visa.png" alt="Visa" fill sizes="(max-width: 768px) 54px, 64px" className="object-contain drop-shadow-sm" />
                  </div>
                </div>

                {/* Mastercard */}
                <div className="h-[34px] w-[54px] md:h-[40px] md:w-[64px] bg-white rounded flex items-center justify-center opacity-[0.6] hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="relative h-[55%] w-[60%]">
                    <Image src="/images/mastercard.png" alt="Mastercard" fill sizes="(max-width: 768px) 54px, 64px" className="object-contain drop-shadow-sm" />
                  </div>
                </div>

                {/* MTN MoMo */}
                <div className="h-[34px] w-[54px] md:h-[40px] md:w-[64px] bg-white rounded flex items-center justify-center opacity-[0.6] hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="relative h-[75%] w-[75%]">
                    <Image src="/images/mtn.png" alt="MTN Mobile Money" fill sizes="(max-width: 768px) 54px, 64px" className="object-contain drop-shadow-sm" />
                  </div>
                </div>

                {/* Orange Money */}
                <div className="h-[34px] w-[54px] md:h-[40px] md:w-[64px] bg-white rounded flex items-center justify-center opacity-[0.6] hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="relative h-[75%] w-[80%]">
                    <Image src="/images/orange.png" alt="Orange Money" fill sizes="(max-width: 768px) 54px, 64px" className="object-contain drop-shadow-sm" />
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </main>

      <footer className="w-full max-w-[1200px] mx-auto pt-24 pb-12 px-4 md:px-8 flex flex-col gap-12 border-t border-white/5 mt-12">
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
    </>
  );
}

