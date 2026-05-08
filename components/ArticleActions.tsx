"use client";

import { Share2, Printer, Check, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import * as gtag from '@/lib/gtag';

export default function ArticleActions({ title = "KHEOPS SET MOTIVATION" }: { title?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    try {
      gtag.event({ action: 'share', category: 'engagement', label: 'copy_link' });
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setIsOpen(false), 2500);
    } catch(err) {
      console.error('Clipboard failed', err);
    }
  }

  const handlePrint = () => {
    gtag.event({ action: 'share', category: 'engagement', label: 'print' });
    setIsOpen(false);
    try {
      window.print();
    } catch(err) {
      console.error('Print failed', err);
    }
  };

  const getShareUrl = (network: string) => {
    if (typeof window === 'undefined') return '#';
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    
    switch (network) {
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'twitter': return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      case 'linkedin': return `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
      case 'whatsapp': return `https://api.whatsapp.com/send?text=${text}%20${url}`;
      case 'mail': return `mailto:?subject=${text}&body=${url}`;
      default: return '#';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
       <button 
         onClick={() => setIsOpen(!isOpen)} 
         className={`flex items-center justify-center p-2 rounded-full transition-colors ${isOpen ? 'bg-gold text-black' : 'text-white/30 hover:text-gold hover:bg-white/5'}`}
         title="Partager l'article"
       >
          <Share2 className="w-5 h-5" />
       </button>

       {isOpen && (
         <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-white/10 shadow-xl shadow-black z-50 overflow-hidden flex flex-col">
           <div className="px-4 py-3 border-b border-white/10 bg-white/5">
             <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Partager</span>
           </div>
           
           <a 
             href={getShareUrl('facebook')} 
             target="_blank" 
             rel="noopener noreferrer" 
             onClick={() => gtag.event({ action: 'share', category: 'engagement', label: 'facebook' })}
             className="flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
           >
             <Facebook className="w-4 h-4" /> Facebook
           </a>
           <a 
             href={getShareUrl('twitter')} 
             target="_blank" 
             rel="noopener noreferrer" 
             onClick={() => gtag.event({ action: 'share', category: 'engagement', label: 'twitter' })}
             className="flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
           >
             <Twitter className="w-4 h-4" /> Twitter
           </a>
           <a 
             href={getShareUrl('whatsapp')} 
             target="_blank" 
             rel="noopener noreferrer" 
             onClick={() => gtag.event({ action: 'share', category: 'engagement', label: 'whatsapp' })}
             className="flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
           >
             <MessageCircle className="w-4 h-4" /> WhatsApp
           </a>
           <a 
             href={getShareUrl('linkedin')} 
             target="_blank" 
             rel="noopener noreferrer" 
             onClick={() => gtag.event({ action: 'share', category: 'engagement', label: 'linkedin' })}
             className="flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/10"
           >
             <Linkedin className="w-4 h-4" /> LinkedIn
           </a>
           
           <button onClick={handleCopy} className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs text-white/70 hover:text-gold hover:bg-white/5 transition-colors">
             {copied ? <Check className="w-4 h-4 text-gold" /> : <LinkIcon className="w-4 h-4" />} 
             {copied ? 'Lien copié !' : 'Copier le lien'}
           </button>
           <button onClick={handlePrint} className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs text-white/70 hover:text-gold hover:bg-white/5 transition-colors">
             <Printer className="w-4 h-4" /> Imprimer
           </button>
           <a 
             href={getShareUrl('mail')} 
             onClick={() => gtag.event({ action: 'share', category: 'engagement', label: 'email' })}
             className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs text-white/70 hover:text-gold hover:bg-white/5 transition-colors border-t border-white/10"
           >
             <Mail className="w-4 h-4" /> Par Email
           </a>
         </div>
       )}
    </div>
  );
}
