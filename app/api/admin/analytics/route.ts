import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch ALL needed page views in one or two queries to avoid multiple roundtrips
    const { data: allViews, error: viewsError } = await supabase
      .from('page_views')
      .select('path, referrer, event, created_at, visitor_id')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (viewsError) throw viewsError;

    const views = allViews || [];

    // 2. KPIs
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

    // 3. Chart Data
    let chartData: { label: string; views: number }[] = [];
    let rangeStart: Date = thirtyDaysAgo;

    if (range === 'today') {
      rangeStart = todayStart;
      const hourBuckets: Record<number, number> = {};
      for (let h = 0; h <= now.getHours(); h++) hourBuckets[h] = 0;
      views.filter(v => new Date(v.created_at) >= todayStart).forEach(v => {
        const hour = new Date(v.created_at).getHours();
        if (hourBuckets[hour] !== undefined) hourBuckets[hour]++;
      });
      chartData = Object.entries(hourBuckets).map(([h, count]) => ({ label: `${h}h`, views: count }));
    } else if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      rangeStart = new Date(now);
      rangeStart.setDate(rangeStart.getDate() - days);
      const dayBuckets: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayBuckets[d.toISOString().split('T')[0]] = 0;
      }
      views.filter(v => new Date(v.created_at) >= rangeStart).forEach(v => {
        const day = new Date(v.created_at).toISOString().split('T')[0];
        if (dayBuckets[day] !== undefined) dayBuckets[day]++;
      });
      chartData = Object.entries(dayBuckets).map(([date, count]) => {
        const d = new Date(date);
        const label = range === '7d' ? d.toLocaleDateString('fr-FR', { weekday: 'short' }) : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        return { label, views: count };
      });
    }

    // 4. Top Pages & Referrers
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

    // 5. Funnel
    const funnelViews = views.filter(v => new Date(v.created_at) >= rangeStart && !v.event).length;
    const funnelClicks = views.filter(v => new Date(v.created_at) >= rangeStart && v.event === 'click_buy_button').length;
    const funnelCheckouts = views.filter(v => new Date(v.created_at) >= rangeStart && v.event === 'submit_email_checkout').length;

    const { count: funnelSales } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', rangeStart.toISOString())
      .eq('status', 'PAID');

    // 6. Revenue Chart
    const yearAgo = new Date(now);
    yearAgo.setMonth(yearAgo.getMonth() - 12);
    const { data: paidOrdersYear } = await supabase.from('orders').select('total_amount, created_at').eq('status', 'PAID').gte('created_at', yearAgo.toISOString());
    const revenueMonthBuckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueMonthBuckets[key] = 0;
    }
    (paidOrdersYear || []).forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (revenueMonthBuckets[key] !== undefined) revenueMonthBuckets[key] += o.total_amount || 0;
    });
    const revenueChartData = Object.entries(revenueMonthBuckets).map(([key, revenue]) => {
      const [y, m] = key.split('-');
      const d = new Date(parseInt(y), parseInt(m) - 1);
      return { label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), revenue };
    });

    // 7. Hourly Dist
    const hourBucketsDist: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourBucketsDist[h] = 0;
    views.forEach(v => {
      const hour = new Date(v.created_at).getHours();
      hourBucketsDist[hour]++;
    });
    const hourlyDistribution = Object.entries(hourBucketsDist).map(([hour, count]) => ({ hour: parseInt(hour), count }));

    return NextResponse.json({
      kpis: { viewsToday, viewsYesterday, activePeople, activePageViews, totalViews: totalViewsCount || 0 },
      chartData,
      revenueChartData,
      topPages,
      topReferrers,
      funnel: { views: funnelViews, clicks: funnelClicks, checkouts: funnelCheckouts, sales: funnelSales || 0 }
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    if (error?.message?.includes('page_views') || error?.code === '42P01') {
      return NextResponse.json({ tableNotFound: true }, { status: 200 });
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
