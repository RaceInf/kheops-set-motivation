'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/chantier-ksm7');
      } else {
        setError('Accès refusé. Mot de passe incorrect.');
        setPassword('');
      }
    } catch {
      setError('Erreur réseau. Impossible de se connecter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden selection:bg-gold selection:text-black">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10">
        {/* Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-gold text-[10px] font-black tracking-[0.5em] uppercase mb-4 opacity-60">
            KHEOPS SET MOTIVATION
          </div>
          <h1 className="font-display text-5xl uppercase tracking-tighter text-white">
            LE CHANTIER<span className="text-gold">.</span>
          </h1>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form 
            onSubmit={handleSubmit} 
            className="border border-white/10 bg-zinc-950 p-10 flex flex-col gap-8 shadow-[0_0_50px_-12px_rgba(238,177,73,0.1)] relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />
            
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
              <div className="w-10 h-10 bg-gold/10 flex items-center justify-center rounded-sm">
                <Lock className="w-5 h-5 text-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  Identification
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                  Accès Terminal Sécurisé
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="admin-password" className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black">
                Clé d'Accès
              </label>
              <div className="relative group">
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="MOT DE PASSE"
                  className="w-full bg-black border border-white/10 p-5 text-sm text-white font-mono placeholder:text-white/10 focus:outline-none focus:border-gold/50 transition-all group-hover:border-white/20"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/5 py-3 border border-red-500/10"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-5 bg-gold text-black font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-all flex justify-center items-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authentification...</>
              ) : (
                <>
                  Entrer dans le système
                  <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-[10px] text-white/10 font-black uppercase tracking-[0.4em] mt-10"
        >
          Zone Militarisée • Kheops Set {new Date().getFullYear()}
        </motion.p>
      </div>
    </div>
  );
}
