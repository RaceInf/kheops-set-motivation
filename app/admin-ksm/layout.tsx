'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, ShoppingBag, Users, Activity, Package, 
  LogOut, Menu, X, ChevronRight, Eye 
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin-ksm', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin-ksm/analytics', label: 'Analytique', icon: Eye },
  { href: '/admin-ksm/orders', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin-ksm/leads', label: 'Leads', icon: Users },
  { href: '/admin-ksm/webhooks', label: 'Webhooks', icon: Activity },
  { href: '/admin-ksm/products', label: 'Produits', icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Don't show layout on login page
  if (pathname === '/admin-ksm/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin-ksm/login');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-zinc-950 border-r border-white/10 
        flex flex-col z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Branding */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin-ksm" className="flex flex-col">
            <span className="text-gold text-[8px] font-bold tracking-[0.4em] uppercase">
              Admin Panel
            </span>
            <span className="font-display text-2xl uppercase tracking-tighter">
              Kheops<span className="text-gold">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gold/10 text-gold border-l-2 border-gold' 
                    : 'text-white/40 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-white/30 group-hover:text-white/60'}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <Link 
            href="/" 
            target="_blank"
            className="text-[9px] text-white/30 uppercase tracking-widest hover:text-gold transition-colors text-center"
          >
            Voir le site public →
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all border border-red-900/30"
          >
            <LogOut className="w-3 h-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/60 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-gold text-[9px] font-bold tracking-[0.3em] uppercase">
            KSM Admin
          </span>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
