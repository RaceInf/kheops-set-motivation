import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, FileText, Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { blogPosts, tools } from '@/lib/data';
import ArticleActions from '@/components/ArticleActions';
import JsonLd from '@/components/seo/JsonLd';
import { constructMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) return {};

  // Find a related tool to use its cover image if available
  const relatedTool = tools.find(t => t.title === post.title || post.id.includes(t.id));

  return constructMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/articles/${slug}`,
    image: `/images/og/og-${slug}.jpg`,
    type: 'article',
    ogTypeLabel: 'ARCHIVE',
  });
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.id,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.id === slug);

  if (!post) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": "Kheops Set"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kheops Set Motivation",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/articles/${post.id}`
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
        "name": "Archives",
        "item": "https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/articles"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://ais-pre-a36fbywvihynxexq42vuem-20309527964.europe-west2.run.app/articles/${post.id}`
      }
    ]
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black font-sans flex flex-col relative">
      {/* Structural Watermarks */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[10px] font-bold tracking-[1em] text-white/[0.03] uppercase pointer-events-none select-none hidden lg:block">
        KHEOPS_SYSTÈME_INTEL_STRATÉGIQUE_v2.4
      </div>
      <div className="fixed right-8 top-1/2 translate-y-1/2 rotate-90 origin-right text-[10px] font-bold tracking-[1em] text-white/[0.03] uppercase pointer-events-none select-none hidden lg:block">
        BÂTISSEUR_ARCHIVE_TRANSMISSION_#{post.id.toUpperCase()}
      </div>

      <div className="flex-grow flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full border-x border-white/5 bg-zinc-950/30">
        
        {/* Main Content Area */}
        <main className="flex-grow lg:border-r border-white/10 flex flex-col">
          <header className="p-6 md:p-12 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
            <Link href="/articles" className="inline-flex px-4 py-2 border border-white/10 text-white/40 text-[9px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all items-center gap-3">
              <ArrowLeft className="w-3 h-3" /> RETOUR ARCHIVES
            </Link>
            
            <ArticleActions title={post.title} />
          </header>

          <article className="p-8 md:p-16 lg:p-24 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-6 mb-12">
              <div className="px-4 py-1.5 bg-gold text-black text-[10px] font-black uppercase tracking-widest">
                {post.category}
              </div>
              <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3" /> 4 MIN DE LECTURE
              </div>
              <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                <FileText className="w-3 h-3" /> DOC_{post.id.toUpperCase()}
              </div>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.8] tracking-tighter mb-16 text-white">
              {post.title}
            </h1>

            <div className="prose prose-invert prose-zinc max-w-none">
              <div 
                className="font-sans text-white/70 text-lg md:text-xl leading-relaxed space-y-12" 
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    .replace(/\n\n/g, '</div><div class="mb-12">')
                    .replace(/^/, '<div class="mb-12">')
                    .replace(/$/, '</div>') 
                }} 
              />
            </div>

            <div className="mt-24 pt-16 border-t border-white/10">
              <div className="flex flex-col items-center text-center">
                 <div className="w-24 h-px bg-gold/50 mb-12"></div>
                 <h3 className="font-display text-5xl uppercase mb-4 tracking-tighter">Transmission Terminée.</h3>
                 <p className="font-sans text-[10px] text-white/30 uppercase tracking-[0.5em] mb-12">BÂTIS TON EMPIRE DANS LE SILENCE.</p>
                 
                 <div className="p-12 border border-white/5 bg-white/[0.02] w-full flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Signal d&apos;Identification</div>
                      <div className="font-mono text-xs text-gold">K_SET_ARCHIVE_VERIFIEE</div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Horodatage</div>
                      <div className="font-mono text-xs text-white/40">{post.date} {"//"} 23:59:59</div>
                    </div>
                 </div>
              </div>
            </div>
          </article>
        </main>

        {/* Tactical Sidebar */}
        <aside className="lg:w-80 shrink-0 bg-black/30 p-8 lg:p-12 space-y-16">
          <div className="space-y-6">
            <h4 className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Lock className="w-3 h-3" /> Confidentialité
            </h4>
            <div className="p-6 border border-white/10 bg-white/[0.02]">
              <div className="text-2xl font-display mb-2 uppercase">Lvl_01</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest">Niveau d&apos;Accès Public</div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Métadonnées</h4>
            <div className="space-y-6 text-[10px] uppercase tracking-widest font-bold">
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-white/20">Sujet</span>
                <span className="text-white/60">{post.category}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-white/20">Status</span>
                <span className="text-green-500/50">DÉCLASSIFIÉ</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-white/20">Auteur</span>
                <span className="text-white/60">KHEOPS SET</span>
              </div>
            </div>
          </div>

          <div className="pt-12">
            <Link 
              href="/arsenal" 
              className="block p-6 border border-gold/30 bg-gold/5 hover:bg-gold hover:text-black transition-all duration-500 group"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Équipement Recommandé</div>
              <div className="text-xl font-display uppercase tracking-tighter mb-6 group-hover:translate-x-2 transition-transform">Le Capital du Bâtisseur</div>
              <ArrowUpRight className="w-6 h-6" />
            </Link>
          </div>
        </aside>
      </div>

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
    </>
  );
}
