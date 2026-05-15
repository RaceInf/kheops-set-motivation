import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // ── Determine date range ──────────────────────────────────────────────────
    let rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - 7); // default 7d

    if (from) {
      const parsed = new Date(from);
      if (!isNaN(parsed.getTime())) rangeStart = parsed;
    }

    const rangeEnd = (to && !isNaN(new Date(to).getTime())) ? new Date(to) : now;

    // ── 1. Fetch page views for the selected range ────────────────────────────
    const { data: allViews, error: viewsError } = await supabase
      .from('page_views')
      .select('path, referrer, event, created_at, visitor_id')
      .gte('created_at', rangeStart.toISOString())
      .lte('created_at', rangeEnd.toISOString());

    if (viewsError) throw viewsError;
    const views = allViews || [];

    // ── 2. KPIs (always relative to today, not the filter) ────────────────────
    const viewsToday = views.filter(v => new Date(v.created_at) >= todayStart).length;
    const viewsYesterday = views.filter(v => {
      const d = new Date(v.created_at);
      return d >= yesterdayStart && d < todayStart;
    }).length;

    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeData = views.filter(v => new Date(v.created_at) >= fiveMinAgo);
    const activePageViews = activeData.length;
    const activePeople = new Set(activeData.map(v => v.visitor_id).filter(Boolean)).size;

    const { count: totalViewsCount } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    // ── 3. Chart Data (adapts to range length) ────────────────────────────────
    const diffMs = rangeEnd.getTime() - rangeStart.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let chartData: { label: string; views: number }[] = [];

    if (diffDays <= 1) {
      // Show hours for single-day ranges
      const hourBuckets: Record<number, number> = {};
      for (let h = 0; h < 24; h++) hourBuckets[h] = 0;
      views.forEach(v => {
        const hour = new Date(v.created_at).getHours();
        if (hourBuckets[hour] !== undefined) hourBuckets[hour]++;
      });
      chartData = Object.entries(hourBuckets).map(([h, count]) => ({ label: `${h}h`, views: count }));
    } else if (diffDays <= 90) {
      // Show days
      const dayBuckets: Record<string, number> = {};
      const curr = new Date(rangeStart);
      while (curr <= rangeEnd) {
        dayBuckets[curr.toISOString().split('T')[0]] = 0;
        curr.setDate(curr.getDate() + 1);
      }
      views.forEach(v => {
        const day = new Date(v.created_at).toISOString().split('T')[0];
        if (dayBuckets[day] !== undefined) dayBuckets[day]++;
      });
      chartData = Object.entries(dayBuckets).map(([date, count]) => {
        const d = new Date(date);
        const label = diffDays <= 14
          ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })
          : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        return { label, views: count };
      });
    } else {
      // Show months for ranges > 90 days
      const monthBuckets: Record<string, number> = {};
      const curr = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
      const endMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth() + 1, 0);
      while (curr <= endMonth) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        monthBuckets[key] = 0;
        curr.setMonth(curr.getMonth() + 1);
      }
      views.forEach(v => {
        const d = new Date(v.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthBuckets[key] !== undefined) monthBuckets[key]++;
      });
      chartData = Object.entries(monthBuckets).map(([key, count]) => {
        const [y, m] = key.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return { label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), views: count };
      });
    }

    // ── 4. Top Pages & Referrers (from filtered views) ────────────────────────
    const pageCounts: Record<string, number> = {};
    const refCounts: Record<string, number> = {};
    views.forEach(v => {
      pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
      if (v.referrer) {
        try {
          const host = new URL(v.referrer).hostname || v.referrer;
          refCounts[host] = (refCounts[host] || 0) + 1;
        } catch {
          refCounts[v.referrer] = (refCounts[v.referrer] || 0) + 1;
        }
      }
    });

    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, views: count }));
    const topReferrers = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([source, count]) => ({ source, views: count }));

    // ── 5. Funnel (from filtered views + orders in range) ─────────────────────
    const funnelViews = views.filter(v => !v.event).length;
    const funnelClicks = views.filter(v => v.event === 'click_buy_button').length;
    const funnelCheckouts = views.filter(v => v.event === 'submit_email_checkout').length;

    const { count: funnelSales } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', rangeStart.toISOString())
      .lte('created_at', rangeEnd.toISOString())
      .eq('status', 'PAID');

    // ── 6. Revenue Chart (from orders in the selected range) ──────────────────
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'PAID')
      .gte('created_at', rangeStart.toISOString())
      .lte('created_at', rangeEnd.toISOString());

    let revenueChartData: { label: string; revenue: number }[] = [];

    if (diffDays <= 1) {
      // Revenue per hour
      const revHours: Record<number, number> = {};
      for (let h = 0; h < 24; h++) revHours[h] = 0;
      (paidOrders || []).forEach(o => {
        const h = new Date(o.created_at).getHours();
        revHours[h] = (revHours[h] || 0) + (o.total_amount || 0);
      });
      revenueChartData = Object.entries(revHours).map(([h, r]) => ({ label: `${h}h`, revenue: r }));
    } else if (diffDays <= 90) {
      // Revenue per day
      const revDays: Record<string, number> = {};
      const curr = new Date(rangeStart);
      while (curr <= rangeEnd) {
        revDays[curr.toISOString().split('T')[0]] = 0;
        curr.setDate(curr.getDate() + 1);
      }
      (paidOrders || []).forEach(o => {
        const day = new Date(o.created_at).toISOString().split('T')[0];
        if (revDays[day] !== undefined) revDays[day] += o.total_amount || 0;
      });
      revenueChartData = Object.entries(revDays).map(([date, revenue]) => {
        const d = new Date(date);
        const label = diffDays <= 14
          ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })
          : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        return { label, revenue };
      });
    } else {
      // Revenue per month
      const revMonths: Record<string, number> = {};
      const curr = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
      const endMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth() + 1, 0);
      while (curr <= endMonth) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        revMonths[key] = 0;
        curr.setMonth(curr.getMonth() + 1);
      }
      (paidOrders || []).forEach(o => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (revMonths[key] !== undefined) revMonths[key] += o.total_amount || 0;
      });
      revenueChartData = Object.entries(revMonths).map(([key, revenue]) => {
        const [y, m] = key.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return { label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), revenue };
      });
    }

    return NextResponse.json({
      kpis: { viewsToday, viewsYesterday, activePeople, activePageViews, totalViews: totalViewsCount || 0 },
      chartData,
      revenueChartData,
      topPages,
      topReferrers,
      funnel: { views: funnelViews, clicks: funnelClicks, checkouts: funnelCheckouts, sales: funnelSales || 0 },
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    if (error?.message?.includes('page_views') || error?.code === '42P01') {
      return NextResponse.json({ tableNotFound: true }, { status: 200 });
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
