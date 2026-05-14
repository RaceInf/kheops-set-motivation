'use client';

import { useEffect, useState } from 'react';
import { tools } from '@/lib/data';
import { 
  TrendingUp, ShoppingBag, DollarSign, Clock, 
  RefreshCw, ArrowUpRight
} from 'lucide-react';

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
    // Auto-refresh every 60 seconds
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { 
      label: 'Chiffre d\'affaires', 
      value: formatCFA(data.kpis.totalRevenue), 
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      trend: data.kpis.revenueTrend,
    },
    { 
      label: 'Ventes confirmées', 
      value: data.kpis.totalSales.toString(), 
      icon: ShoppingBag,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    { 
      label: 'Panier moyen', 
      value: formatCFA(data.kpis.averageOrder), 
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    { 
      label: 'En attente', 
      value: data.kpis.pendingOrders.toString(), 
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
  ];

  const maxRevenue = Math.max(...data.revenueByDay.map(d => d.revenue), 1);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Tableau de Bord
          </h1>
          <p className="text-white/40 text-xs mt-1">
            {lastRefresh 
              ? `Dernière mise à jour : ${lastRefresh.toLocaleTimeString('fr-FR')}`
              : 'Chargement...'
            }
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-4 hover:border-white/20 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                {kpi.label}
              </span>
              <div className={`w-8 h-8 ${kpi.bgColor} flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-display text-2xl md:text-3xl tracking-tight">
                {kpi.value}
              </div>
              {kpi.trend !== undefined && (
                <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${kpi.trend > 0 ? 'text-emerald-400' : kpi.trend < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  {kpi.trend > 0 ? '↑' : kpi.trend < 0 ? '↓' : '—'} {Math.abs(kpi.trend)}% vs 7 derniers jours
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart (7 days) */}
        <div className="lg:col-span-2 border border-white/10 bg-zinc-950 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">
            Revenus — 7 derniers jours
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.revenueByDay.map((day, idx) => {
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const dateLabel = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' });
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <span className="text-[9px] text-white/40 font-mono shrink-0">
                    {day.revenue > 0 ? formatCFA(day.revenue).replace(' FCFA', '') : '—'}
                  </span>
                  <div className="w-full flex-1 flex justify-center items-end relative group">
                    <div
                      className="w-full max-w-16 bg-gradient-to-t from-gold/10 to-gold/40 hover:from-gold/20 hover:to-gold/60 border-t border-gold/50 transition-all duration-500"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {day.count > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 text-[9px] text-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                        {day.count} vente{day.count > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-white/30 uppercase font-bold">{dateLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="border border-white/10 bg-zinc-950 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">
            Ventes par Produit
          </h3>
          <div className="flex flex-col gap-4">
            {tools.map(tool => {
              const stats = data.productStats[tool.id] || { count: 0, revenue: 0 };
              const totalProductSales = Object.values(data.productStats).reduce((sum, s) => sum + s.count, 0) || 1;
              const percentage = Math.round((stats.count / totalProductSales) * 100);
              return (
                <div key={tool.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/70 truncate">{tool.title}</span>
                    <span className="text-[10px] text-gold font-mono">{stats.count}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5">
                    <div 
                      className="h-full bg-gold/60 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-white/30">{formatCFA(stats.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="border border-white/10 bg-zinc-950 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Dernières Ventes
          </h3>
          <a 
            href="/admin-ksm/orders" 
            className="text-[10px] text-gold uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">Aucune vente enregistrée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold pb-3 pr-4">Date</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold pb-3 pr-4">Client</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold pb-3 pr-4">Produit</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold pb-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 text-xs text-white/60 font-mono whitespace-nowrap">
                      {formatDate(order.date)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-white/80">
                      {order.email}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gold font-bold truncate max-w-[200px]">
                      {getProductName(order.productId)}
                    </td>
                    <td className="py-3 text-xs text-white font-bold text-right whitespace-nowrap">
                      {formatCFA(order.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
