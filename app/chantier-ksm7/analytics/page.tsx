'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw, Eye, Users, TrendingUp, Globe,
  ArrowUp, ArrowDown, Minus, AlertTriangle, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DateRangePicker from '@/components/admin/DateRangePicker';
import AreaChart from '@/components/admin/AreaChart';
import AnimatedNumber from '@/components/admin/AnimatedNumber';
import { Skeleton, CardSkeleton, ChartSkeleton } from '@/components/admin/AdminSkeletons';

interface AnalyticsData {
  kpis: {
    viewsToday: number;
    viewsYesterday: number;
    activePeople: number;
    activePageViews: number;
    totalViews: number;
  };
  chartData: { label: string; views: number }[];
  revenueChartData: { label: string; revenue: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  funnel: {
    views: number;
    clicks: number;
    checkouts: number;
    sales: number;
  };
  tableNotFound?: boolean;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/arsenal': 'Arsenal (Catalogue)',
  '/articles': 'Articles (Blog)',
  '/mentions-legales': 'Mentions Légales',
  '/politique-de-confidentialite': 'Politique de Confidentialité',
};



// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customDates, setCustomDates] = useState<{ from: Date; to: Date } | null>(null);
  const [rangeLabel, setRangeLabel] = useState('7 derniers jours');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('range', 'custom');
      if (customDates) {
        params.set('from', customDates.from.toISOString());
        params.set('to', customDates.to.toISOString());
      } else {
        // Default 7 days
        const now = new Date();
        const from = new Date(now); from.setDate(from.getDate() - 7);
        params.set('from', from.toISOString());
        params.set('to', now.toISOString());
      }
      const res = await fetch(`/api/admin/analytics?${params}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [customDates]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [customDates]);

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

  // Derived chart data
  const chartInfo = useMemo(() => {
    if (!data?.chartData?.length) return { max: 1, total: 0, maxLabels: 30 };
    return {
      max: Math.max(...data.chartData.map(d => d.views), 1),
      total: data.chartData.reduce((s, d) => s + d.views, 0),
      maxLabels: data.chartData.length > 45 ? Math.floor(data.chartData.length / 10) : data.chartData.length,
    };
  }, [data?.chartData]);

  const revenueInfo = useMemo(() => {
    if (!data?.revenueChartData?.length) return { max: 1, total: 0 };
    return {
      max: Math.max(...data.revenueChartData.map(d => d.revenue), 1),
      total: data.revenueChartData.reduce((s, d) => s + d.revenue, 0),
    };
  }, [data?.revenueChartData]);

  // Table not found
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
  event text,
  visitor_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON page_views (created_at DESC);
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

  const trend = data ? getTrend() : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Analytique
          </h1>
          <p className="text-white/30 text-[10px] mt-1 font-mono">
            {lastRefresh
              ? `${lastRefresh.toLocaleTimeString('fr-FR')} · Auto-refresh 30s`
              : 'Chargement...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker 
            onRangeChange={(newRange, label) => {
              if (newRange) {
                setCustomDates(newRange);
                setRangeLabel(label);
              }
            }}
          />
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="h-[38px] w-[38px] flex items-center justify-center border border-white/10 text-white/30 hover:text-gold hover:border-gold/40 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {!data ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            {/* Active Visitors */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="border border-white/10 bg-zinc-950 p-5 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">En ligne</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] text-emerald-400 font-black tracking-widest">LIVE</span>
                </div>
              </div>
              <div className="font-display text-3xl text-emerald-400"><AnimatedNumber value={data.kpis.activePeople} /></div>
              <span className="text-[9px] text-white/20">{data.kpis.activePageViews} pages vues (5 min)</span>
            </motion.div>

            {/* Views Today */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="border border-white/10 bg-zinc-950 p-5 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Aujourd'hui</span>
                <Eye className="w-3.5 h-3.5 text-gold/30" />
              </div>
              <div className="font-display text-3xl"><AnimatedNumber value={data.kpis.viewsToday} /></div>
              {trend && (
                <div className={`flex items-center gap-1 ${trend.color}`}>
                  <trend.icon className="w-3 h-3" />
                  <span className="text-[9px] font-bold">{trend.text} vs hier</span>
                </div>
              )}
            </motion.div>

            {/* Yesterday */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="border border-white/10 bg-zinc-950 p-5 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Hier</span>
                <Users className="w-3.5 h-3.5 text-blue-400/30" />
              </div>
              <div className="font-display text-3xl text-white/50"><AnimatedNumber value={data.kpis.viewsYesterday} /></div>
              <span className="text-[9px] text-white/20">vues totales</span>
            </motion.div>

            {/* Total */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="border border-white/10 bg-zinc-950 p-5 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Total</span>
                <TrendingUp className="w-3.5 h-3.5 text-gold/30" />
              </div>
              <div className="font-display text-3xl text-gold"><AnimatedNumber value={data.kpis.totalViews} /></div>
              <span className="text-[9px] text-white/20">toutes périodes</span>
            </motion.div>
          </>
        )}
      </div>

      {/* ── Conversion Funnel ── */}
      <motion.div
        key={`funnel-${rangeLabel}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="border border-white/10 bg-zinc-950 p-6"
      >
        <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25 mb-6 flex items-center gap-2">
          <Activity className="w-3 h-3" /> Entonnoir de Conversion — <span className="text-gold/60">{rangeLabel}</span>
        </h3>
        
        {!data ? (
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Visites', value: data.funnel.views, bg: 'bg-white/[0.03]', accent: 'text-white' },
              { label: 'Clics Achat', value: data.funnel.clicks, bg: 'bg-gold/[0.04]', accent: 'text-gold', parent: data.funnel.views },
              { label: 'Checkouts', value: data.funnel.checkouts, bg: 'bg-gold/[0.07]', accent: 'text-gold', parent: data.funnel.clicks },
              { label: 'Ventes', value: data.funnel.sales, bg: 'bg-emerald-500/[0.08]', accent: 'text-emerald-400', parent: data.funnel.checkouts },
            ].map((step, idx) => {
              const ratio = step.parent && step.parent > 0 ? Math.round((step.value / step.parent) * 100) : null;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`${step.bg} border border-white/5 p-5 flex flex-col items-center justify-center gap-2 relative`}
                >
                  <div className={`font-display text-3xl ${step.accent}`}>
                    <AnimatedNumber value={step.value} />
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/30">{step.label}</div>
                  {ratio !== null && (
                    <div className="absolute top-2 right-2">
                      <span className={`text-[9px] font-mono font-bold ${ratio > 10 ? 'text-emerald-400/60' : 'text-white/15'}`}>
                        {ratio}%
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Traffic Chart (fixed container) ── */}
      <motion.div
        key={`chart-${rangeLabel}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="border border-white/10 bg-zinc-950 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25 flex items-center gap-2">
            <Eye className="w-3 h-3" /> Pages vues — <span className="text-gold/60">{rangeLabel}</span>
          </h3>
          <span className="text-[10px] text-gold/60 font-mono font-bold">
            {chartInfo.total.toLocaleString('fr-FR')} vues
          </span>
        </div>

        {!data ? (
          <Skeleton className="h-52 w-full" />
        ) : data.chartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-white/15 text-sm">Aucune donnée pour cette période</div>
        ) : (
          <AreaChart
            data={data.chartData.map(d => ({ label: d.label, value: d.views }))}
            color="gold"
            height={220}
          />
        )}
      </motion.div>

      {/* ── Revenue Chart (fixed container) ── */}
      <motion.div
        key={`rev-${rangeLabel}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="border border-white/10 bg-zinc-950 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400/60 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Revenus — <span className="text-white/30">{rangeLabel}</span>
          </h3>
          <span className="text-[10px] text-emerald-400/60 font-mono font-bold">
            {revenueInfo.total.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        {!data?.revenueChartData?.length ? (
          <div className="h-52 flex items-center justify-center text-white/15 text-sm">Données insuffisantes</div>
        ) : (
          <AreaChart
            data={data.revenueChartData.map(d => ({ label: d.label, value: d.revenue }))}
            color="emerald"
            suffix=" FCFA"
            height={220}
          />
        )}
      </motion.div>

      {/* ── Bottom: Top Pages & Referrers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <motion.div
          key={`pages-${rangeLabel}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="border border-white/10 bg-zinc-950 p-6"
        >
          <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25 mb-5">
            Top Pages — <span className="text-gold/50">{rangeLabel}</span>
          </h3>
          {!data ? (
            <div className="flex flex-col gap-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : data.topPages.length === 0 ? (
            <p className="text-white/15 text-sm text-center py-8">Pas encore de données</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {data.topPages.map((page, idx) => {
                const maxP = data.topPages[0]?.views || 1;
                const w = (page.views / maxP) * 100;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-2.5 group"
                  >
                    <span className="text-[9px] text-white/15 font-mono w-4 text-right">{idx + 1}</span>
                    <div className="flex-1 relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-gold/[0.04] group-hover:bg-gold/[0.08] transition-colors"
                        style={{ width: `${w}%` }}
                      />
                      <div className="relative flex justify-between items-center py-2 px-3">
                        <span className="text-[11px] text-white/60 truncate">{getPageLabel(page.path)}</span>
                        <span className="text-[10px] text-gold/70 font-mono font-bold ml-2 shrink-0">{page.views}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Top Referrers */}
        <motion.div
          key={`ref-${rangeLabel}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="border border-white/10 bg-zinc-950 p-6"
        >
          <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25 mb-5 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Sources de Trafic — <span className="text-gold/50">{rangeLabel}</span>
          </h3>
          {!data ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : data.topReferrers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/15 text-sm">Pas encore de données</p>
              <p className="text-white/8 text-[10px] mt-2">Les sources apparaîtront quand des visiteurs arriveront via des liens externes</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.topReferrers.map((ref, idx) => {
                const maxR = data.topReferrers[0]?.views || 1;
                const w = (ref.views / maxR) * 100;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-2.5"
                  >
                    <span className="text-[9px] text-white/15 font-mono w-4 text-right">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] text-white/60 truncate">{ref.source}</span>
                        <span className="text-[10px] text-gold/70 font-mono font-bold">{ref.views}</span>
                      </div>
                      <div className="w-full h-0.5 bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${w}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.05 }}
                          className="h-full bg-gold/30"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
