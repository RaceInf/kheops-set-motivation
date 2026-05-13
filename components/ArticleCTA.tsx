import Link from "next/link";
import Image from "next/image";
import { tools } from "@/lib/data";
import { Zap, ChevronRight, ShieldCheck } from "lucide-react";

interface ArticleCTAProps {
  productId: string;
}

export default function ArticleCTA({ productId }: ArticleCTAProps) {
  const tool = tools.find((t) => t.id === productId);

  if (!tool) return null;

  return (
    <section className="my-16 border-2 border-gold bg-zinc-950 p-1">
      <div className="border border-white/10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
        
        {/* Product Visual */}
        <div className="relative w-full md:w-1/3 aspect-[4/3] bg-black border border-white/5 overflow-hidden group">
          {tool.mockupImage ? (
            <Image 
              src={tool.mockupImage} 
              alt={tool.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-12 h-12 text-gold/20" />
             </div>
          )}
          <div className="absolute top-2 left-2 bg-gold text-black text-[8px] font-black px-2 py-1 uppercase tracking-tighter">
            Outil d&apos;Élite
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 text-center md:text-left">
          <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
            Passez du savoir à l&apos;action
          </span>
          <h3 className="font-display text-3xl md:text-5xl uppercase leading-none mb-4 text-white">
            {tool.title}
          </h3>
          <p className="text-white/60 text-sm md:text-base mb-8 font-light italic">
            &quot;{tool.desc}&quot;
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link 
              href={`/arsenal/${tool.id}`}
              className="w-full sm:w-auto bg-white text-black px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-gold transition-colors flex items-center justify-center gap-3 group"
            >
              Accéder au Dossier <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-2 text-white/40">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">{tool.price} • Transmission Sécurisée</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
