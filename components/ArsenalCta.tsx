"use client";

import { ArrowLeft } from "lucide-react";
import * as gtag from '@/lib/gtag';

export default function ArsenalCta({ 
  checkoutUrl, 
  cta, 
  title 
}: { 
  checkoutUrl: string; 
  cta: string; 
  title: string;
}) {
  return (
    <a 
      href={checkoutUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={() => gtag.event({ 
        action: 'begin_checkout', 
        category: 'ecommerce', 
        label: `${cta} - ${title}` 
      })}
      className="w-full py-6 bg-gold text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-white transition-colors group flex justify-center items-center gap-3"
    >
      {cta}
      <ArrowLeft className="w-4 h-4 rotate-135 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
    </a>
  );
}
