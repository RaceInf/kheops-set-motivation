'use client';

import { useEffect, useState } from 'react';
import { tools } from '@/lib/data';
import { 
  TrendingUp, ShoppingBag, DollarSign, Clock, 
  RefreshCw, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AreaChart from '@/components/admin/AreaChart';
import AnimatedNumber from '@/components/admin/AnimatedNumber';
import { Skeleton, CardSkeleton, ChartSkeleton } from '@/components/admin/AdminSkeletons';

interface StatsData {
  kpis: {
    totalRevenue: number;
    totalSales: number;
    averageOrder: number;
    pendingOrders: number;
    revenueTrend: number;
  };
  revenueByDay: { date: string; revenue: number; count: number }[];
  productStats: Record<string, { count: number; revenue: number }>;
  recentOrders: {
    id: string;
    date: string;
    amount: number;
    status: string;
    email: string;
    productId: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProductName = (productId: string) => {
    return tools.find(t => t.id === productId)?.title || productId;
  };

  const kpiDefinitions = data ? [
    { 
      label: 'Chiffre d\'affaires', 
      value: data.kpis.totalRevenue, 
      isCurrency: true,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      trend: data.kpis.revenueTrend,
    },
    { 
      label: 'Ventes confirmées', 
      value: data.kpis.totalSales, 
      icon: ShoppingBag,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    { 
      label: 'Panier moyen', 
      value: data.kpis.averageOrder, 
      isCurrency: true,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    { 
      label: 'Attente', 
      value: data.kpis.pendingOrders, 
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
  ] : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Tableau de Bord
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {lastRefresh 
              ? `Dernière mise à jour : ${lastRefresh.toLocaleTimeString('fr-FR')}`
              : 'Chargement...'
            }
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50 group"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-gold' : 'group-hover:text-gold'}`} />
          Actualiser
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!data ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          kpiDefinitions.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-4 hover:border-white/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {kpi.label}
                </span>
                <div className={`w-10 h-10 ${kpi.bgColor} flex items-center justify-center rounded-sm transition-transform group-hover:scale-110`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-display text-3xl md:text-4xl tracking-tight text-white group-hover:text-gold transition-colors">
                  <AnimatedNumber value={kpi.value} suffix={kpi.isCurrency ? ' FCFA' : ''} />
                </div>
                {kpi.trend !== undefined && (
                  <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${kpi.trend > 0 ? 'text-emerald-400' : kpi.trend < 0 ? 'text-red-400' : 'text-white/40'}`}>
                    {kpi.trend > 0 ? '↑' : kpi.trend < 0 ? '↓' : '—'} {Math.abs(kpi.trend)}% vs 7j
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Area Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 border border-white/10 bg-zinc-950 p-6 flex flex-col gap-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Revenus — 7 derniers jours
            </h3>
            {data && (
              <span className="text-[10px] text-gold font-mono font-bold">
                {formatCFA(data.revenueByDay.reduce((s, d) => s + d.revenue, 0))}
              </span>
            )}
          </div>
          
          <div className="h-52 w-full">
            {!data ? (
              <ChartSkeleton />
            ) : (
              <AreaChart 
                data={data.revenueByDay.map(d => ({
                  label: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
                  value: d.revenue
                }))}
                color="gold"
                suffix=" FCFA"
                height={200}
              />
            )}
          </div>
        </motion.div>

        {/* Product Breakdown */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-6"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Ventes par Produit
          </h3>
          <div className="flex flex-col gap-5">
            {!data ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              tools.map((tool, idx) => {
                const stats = data.productStats[tool.id] || { count: 0, revenue: 0 };
                const totalProductSales = Object.values(data.productStats).reduce((sum, s) => sum + s.count, 0) || 1;
                const percentage = Math.round((stats.count / totalProductSales) * 100);
                return (
                  <motion.div 
                    key={tool.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex flex-col gap-2 group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{tool.title}</span>
                      <span className="text-[10px] text-gold font-mono font-bold">{stats.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gold/60"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider">{formatCFA(stats.revenue)}</span>
                      <span className="text-[9px] text-white/20 font-mono">{percentage}%</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="border border-white/10 bg-zinc-950 p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
            <ShoppingBag className="w-3 h-3" /> Dernières Ventes
          </h3>
          <a 
            href="/chantier-ksm7/orders" 
            className="text-[10px] text-gold uppercase tracking-[0.2em] font-black hover:text-white transition-colors flex items-center gap-2 group"
          >
            Voir tout <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {!data ? (
          <Skeleton className="h-48 w-full" />
        ) : data.recentOrders.length === 0 ? (
          <p className="text-white/20 text-[11px] font-bold uppercase tracking-widest text-center py-12">Aucune vente enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-black p-4">Date</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-black p-4">Client</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-black p-4">Produit</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-black p-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {data.recentOrders.map((order, idx) => (
                    <motion.tr 
                      key={order.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group cursor-default"
                    >
                      <td className="p-4 text-[11px] text-white/50 font-mono whitespace-nowrap">
                        {formatDate(order.date)}
                      </td>
                      <td className="p-4 text-[11px] text-white/80 font-bold">
                        {order.email}
                      </td>
                      <td className="p-4 text-[11px] text-gold font-black uppercase tracking-wider truncate max-w-[200px]">
                        {getProductName(order.productId)}
                      </td>
                      <td className="p-4 text-[11px] text-white font-mono font-bold text-right whitespace-nowrap group-hover:text-gold transition-colors">
                        {formatCFA(order.amount)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
