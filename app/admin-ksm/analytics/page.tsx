'use client';

import { useEffect, useState } from 'react';
import {
  RefreshCw, Eye, Users, TrendingUp, Globe,
  ArrowUp, ArrowDown, Minus, AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  kpis: {
    viewsToday: number;
    viewsYesterday: number;
    activeVisitors: number;
    totalViews: number;
  };
  chartData: { label: string; views: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  tableNotFound?: boolean;
}

const RANGES = [
  { key: 'today', label: "Aujourd'hui" },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '12m', label: '12 mois' },
  { key: 'year', label: 'Année' },
];

const PAGE_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/arsenal': 'Arsenal (Catalogue)',
  '/articles': 'Articles (Blog)',
  '/mentions-legales': 'Mentions Légales',
  '/politique-de-confidentialite': 'Politique de Confidentialité',
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [range]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [range]);

  const getPageLabel = (path: string) => {
    if (PAGE_LABELS[path]) return PAGE_LABELS[path];
    if (path.startsWith('/arsenal/')) return path.replace('/arsenal/', 'Produit: ');
    if (path.startsWith('/articles/')) return path.replace('/articles/', 'Article: ');
    return path;
  };

  const getTrend = () => {
    if (!data) return null;
    const { viewsToday, viewsYesterday } = data.kpis;
    if (viewsYesterday === 0) return { icon: Minus, color: 'text-white/40', text: '—' };
    const pct = Math.round(((viewsToday - viewsYesterday) / viewsYesterday) * 100);
    if (pct > 0) return { icon: ArrowUp, color: 'text-emerald-400', text: `+${pct}%` };
    if (pct < 0) return { icon: ArrowDown, color: 'text-red-400', text: `${pct}%` };
    return { icon: Minus, color: 'text-white/40', text: '0%' };
  };

  // Table not found - show setup instructions
  if (data?.tableNotFound) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">Analytique</h1>
        <div className="border border-amber-500/30 bg-amber-500/5 p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-amber-400">Configuration requise</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                La table <code className="bg-white/10 px-2 py-0.5 text-gold">page_views</code> n'existe pas encore dans votre base Supabase. 
                Créez-la en exécutant le SQL suivant dans votre <strong>Supabase Dashboard → SQL Editor</strong> :
              </p>
              <pre className="bg-black border border-white/10 p-4 text-[11px] text-gold font-mono overflow-x-auto whitespace-pre">{`CREATE TABLE page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Index pour les requêtes rapides par date
CREATE INDEX idx_page_views_created_at ON page_views (created_at DESC);

-- Index pour les requêtes par chemin
CREATE INDEX idx_page_views_path ON page_views (path);`}</pre>
              <p className="text-white/40 text-xs">
                Une fois la table créée, rechargez cette page. Le tracking commencera automatiquement.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(...data.chartData.map(d => d.views), 1);
  const totalChartViews = data.chartData.reduce((sum, d) => sum + d.views, 0);
  const trend = getTrend();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Analytique
          </h1>
          <p className="text-white/40 text-xs mt-1">
            {lastRefresh
              ? `Mis à jour : ${lastRefresh.toLocaleTimeString('fr-FR')} • Auto-refresh 30s`
              : 'Chargement...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Range Selector */}
          <div className="flex border border-white/10 overflow-hidden">
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all
                  ${range === r.key
                    ? 'bg-gold text-black'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 border border-white/10 text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Visitors */}
        <div className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">En ligne</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-bold">LIVE</span>
            </div>
          </div>
          <div className="font-display text-4xl text-emerald-400">{data.kpis.activeVisitors}</div>
          <span className="text-[9px] text-white/30">dernières 5 minutes</span>
        </div>

        {/* Views Today */}
        <div className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Aujourd'hui</span>
            <Eye className="w-4 h-4 text-gold/40" />
          </div>
          <div className="font-display text-4xl">{data.kpis.viewsToday}</div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend.color}`}>
              <trend.icon className="w-3 h-3" />
              <span className="text-[9px] font-bold">{trend.text} vs hier</span>
            </div>
          )}
        </div>

        {/* Yesterday */}
        <div className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Hier</span>
            <Users className="w-4 h-4 text-blue-400/40" />
          </div>
          <div className="font-display text-4xl text-white/60">{data.kpis.viewsYesterday}</div>
          <span className="text-[9px] text-white/30">vues totales</span>
        </div>

        {/* Total All Time */}
        <div className="border border-white/10 bg-zinc-950 p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total</span>
            <TrendingUp className="w-4 h-4 text-gold/40" />
          </div>
          <div className="font-display text-4xl text-gold">{data.kpis.totalViews.toLocaleString('fr-FR')}</div>
          <span className="text-[9px] text-white/30">toutes périodes</span>
        </div>
      </div>

      {/* Chart */}
      <div className="border border-white/10 bg-zinc-950 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Pages vues — {RANGES.find(r => r.key === range)?.label}
          </h3>
          <span className="text-[10px] text-gold font-mono">{totalChartViews.toLocaleString('fr-FR')} vues</span>
        </div>
        <div className="flex items-end gap-1 h-52">
          {data.chartData.map((point, idx) => {
            const height = maxViews > 0 ? (point.views / maxViews) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[8px] text-white/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {point.views}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-8 bg-gold/20 hover:bg-gold/50 transition-all duration-200 rounded-t-sm"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
                <span className="text-[7px] md:text-[8px] text-white/25 font-bold uppercase truncate max-w-full">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="border border-white/10 bg-zinc-950 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
            Top Pages (30 jours)
          </h3>
          {data.topPages.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">Pas encore de données</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.topPages.map((page, idx) => {
                const maxPageViews = data.topPages[0]?.views || 1;
                const width = (page.views / maxPageViews) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3 group">
                    <span className="text-[10px] text-white/20 font-mono w-5 text-right">{idx + 1}</span>
                    <div className="flex-1 relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-gold/5 group-hover:bg-gold/10 transition-colors"
                        style={{ width: `${width}%` }}
                      />
                      <div className="relative flex justify-between items-center py-2 px-3">
                        <span className="text-xs text-white/70 truncate">{getPageLabel(page.path)}</span>
                        <span className="text-[10px] text-gold font-mono font-bold ml-2">{page.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="border border-white/10 bg-zinc-950 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Sources de Trafic (30 jours)
          </h3>
          {data.topReferrers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/20 text-sm">Pas encore de données</p>
              <p className="text-white/10 text-[10px] mt-2">Les sources apparaîtront quand des visiteurs arriveront depuis des liens externes</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.topReferrers.map((ref, idx) => {
                const maxRefViews = data.topReferrers[0]?.views || 1;
                const width = (ref.views / maxRefViews) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/20 font-mono w-5 text-right">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/70 truncate">{ref.source}</span>
                        <span className="text-[10px] text-gold font-mono font-bold">{ref.views}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5">
                        <div className="h-full bg-gold/40" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
