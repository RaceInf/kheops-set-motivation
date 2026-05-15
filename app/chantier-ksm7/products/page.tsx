'use client';

import { useEffect, useState } from 'react';
import { tools } from '@/lib/data';
import Image from 'next/image';
import { RefreshCw, Package, TrendingUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '@/components/admin/AdminSkeletons';
import AnimatedNumber from '@/components/admin/AnimatedNumber';

interface ProductMetrics {
  [productId: string]: { count: number; revenue: number };
}

export default function AdminProductsPage() {
  const [metrics, setMetrics] = useState<ProductMetrics>({});
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setMetrics(data.productStats || {});
    } catch (err) {
      console.error('Failed to fetch product metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const formatCFA = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const totalRevenue = Object.values(metrics).reduce((sum, m) => sum + m.revenue, 0);
  const totalSales = Object.values(metrics).reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Catalogue
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {tools.length} produits forgés dans l'Arsenal
          </p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50 group"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          Actualiser
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 bg-zinc-950 p-8 flex items-center gap-8 group hover:border-white/20 transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/50" />
          <div className="w-16 h-16 bg-gold/10 flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform duration-500">
            <Package className="w-8 h-8 text-gold" />
          </div>
          <div>
            <div className="font-display text-4xl tracking-tight text-white group-hover:text-gold transition-colors">
              {!loading ? <AnimatedNumber value={totalSales} /> : <Skeleton className="h-8 w-16" />}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Ventes totales</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-white/10 bg-zinc-950 p-8 flex items-center gap-8 group hover:border-white/20 transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
          <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="font-display text-4xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              {!loading ? <AnimatedNumber value={totalRevenue} suffix=" FCFA" /> : <Skeleton className="h-8 w-32" />}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Revenu total généré</div>
          </div>
        </motion.div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {tools.map((tool, idx) => {
            const stats = metrics[tool.id] || { count: 0, revenue: 0 };
            const share = totalSales > 0 ? Math.round((stats.count / totalSales) * 100) : 0;

            return (
              <motion.div 
                key={tool.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="border border-white/10 bg-zinc-950 overflow-hidden hover:border-white/20 transition-all flex flex-col group shadow-2xl relative"
              >
                {/* Product Image */}
                {tool.image && (
                  <div className="relative w-full aspect-[16/10] bg-zinc-900 overflow-hidden">
                    <Image
                      src={tool.image}
                      alt={tool.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                  </div>
                )}

                {/* Info */}
                <div className="p-6 flex flex-col gap-5 flex-1 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-black font-black bg-gold px-2.5 py-1 uppercase tracking-widest">
                      {tool.category}
                    </span>
                    <div className="text-[10px] text-white/20 font-mono font-bold uppercase tracking-tighter">ID: {tool.id}</div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-3xl uppercase tracking-tighter text-white group-hover:text-gold transition-colors">{tool.title}</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 font-medium">{tool.desc}</p>
                  </div>

                  {/* Metrics */}
                  <div className="mt-auto pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col gap-1">
                      <div className="font-display text-2xl text-gold">
                        {!loading ? <AnimatedNumber value={stats.count} /> : <Skeleton className="h-6 w-8 mx-auto" />}
                      </div>
                      <div className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black">Ventes</div>
                    </div>
                    <div className="flex flex-col gap-1 border-x border-white/5 px-2">
                      <div className="font-display text-2xl text-white">
                        {tool.price.split(' ')[0]}
                      </div>
                      <div className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black">Prix</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="font-display text-2xl text-emerald-400">
                        {!loading ? <AnimatedNumber value={share} suffix="%" /> : <Skeleton className="h-6 w-10 mx-auto" />}
                      </div>
                      <div className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black">Part</div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-white/[0.03] p-4 flex justify-between items-center rounded-sm border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">CA GÉNÉRÉ</span>
                    <span className="text-sm font-black text-white group-hover:text-gold transition-colors">
                      {!loading ? formatCFA(stats.revenue) : <Skeleton className="h-5 w-24" />}
                    </span>
                  </div>

                  {/* Link */}
                  <a
                    href={`/arsenal/${tool.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all pt-2 border-t border-transparent hover:border-white/5"
                  >
                    Voir sur le site <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
