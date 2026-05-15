'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, ShoppingBag, Users, Activity, Package, 
  LogOut, Menu, X, ChevronRight, Eye, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NAV_ITEMS = [
  { href: '/chantier-ksm7', label: 'Dashboard', icon: BarChart3 },
  { href: '/chantier-ksm7/analytics', label: 'Analytique', icon: Eye },
  { href: '/chantier-ksm7/marketing', label: 'Marketing', icon: TrendingUp },
  { href: '/chantier-ksm7/orders', label: 'Commandes', icon: ShoppingBag },
  { href: '/chantier-ksm7/leads', label: 'Leads', icon: Users },
  { href: '/chantier-ksm7/webhooks', label: 'Webhooks', icon: Activity },
  { href: '/chantier-ksm7/products', label: 'Produits', icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/chantier-ksm7/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/chantier-ksm7/login');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex selection:bg-gold selection:text-black">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-zinc-950 border-r border-white/5 
        flex flex-col z-50 transition-transform duration-500 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Branding */}
        <div className="p-8 border-b border-white/5 bg-zinc-950">
          <Link href="/chantier-ksm7" className="flex flex-col group">
            <span className="text-gold text-[9px] font-black tracking-[0.5em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
              LE CHANTIER
            </span>
            <span className="font-display text-3xl uppercase tracking-tighter mt-1 group-hover:text-gold transition-colors">
              KHEOPS<span className="text-gold">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  relative flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em]
                  transition-all duration-300 group rounded-sm
                  ${isActive 
                    ? 'text-gold bg-gold/5' 
                    : 'text-white/30 hover:text-white hover:bg-white/[0.03]'
                  }
                `}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-2/3 bg-gold rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'text-gold scale-110' : 'text-white/20 group-hover:text-white group-hover:scale-110'}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-auto"
                  >
                    <ChevronRight className="w-3 h-3 text-gold/40" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-zinc-950/50 flex flex-col gap-4">
          <Link 
            href="/" 
            target="_blank"
            className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] hover:text-gold transition-colors text-center py-2 border border-white/5 hover:border-gold/20"
          >
            Site Public <span className="ml-1">↗</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all border border-red-500/10 hover:border-red-500/30 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quitter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-white/40 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-display text-xl uppercase tracking-tighter">
            KHEOPS<span className="text-gold">.</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Page Content with Transition */}
        <main className="flex-1 p-6 md:p-10 lg:p-16 max-w-[1600px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer subtle text */}
        <footer className="px-10 py-8 text-center text-[9px] font-bold uppercase tracking-[0.5em] text-white/10 pointer-events-none">
          Kheops Set Motivation • Système d'Administration v2.0
        </footer>
      </div>
    </div>
  );
}
