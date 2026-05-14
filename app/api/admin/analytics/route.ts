import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d'; // today, 7d, 30d, 12m, year

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // 1. Views today
    const { count: viewsToday } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // 2. Views yesterday (for comparison)
    const { count: viewsYesterday } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString());

    // 3. Active visitors (last 5 minutes)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const { count: activeVisitors } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fiveMinAgo.toISOString());

    // 4. Total views all time
    const { count: totalViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    // 5. Chart data based on range
    let chartData: { label: string; views: number }[] = [];
    let rangeStart: Date;

    if (range === 'today') {
      // Hourly for today
      rangeStart = todayStart;
      const { data: hourlyData } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', rangeStart.toISOString());

      const hourBuckets: Record<number, number> = {};
      for (let h = 0; h <= now.getHours(); h++) hourBuckets[h] = 0;
      (hourlyData || []).forEach(row => {
        const hour = new Date(row.created_at).getHours();
        hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
      });
      chartData = Object.entries(hourBuckets).map(([h, count]) => ({
        label: `${h}h`,
        views: count,
      }));

    } else if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      rangeStart = new Date(now);
      rangeStart.setDate(rangeStart.getDate() - days);

      const { data: dailyData } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', rangeStart.toISOString());

      const dayBuckets: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayBuckets[d.toISOString().split('T')[0]] = 0;
      }
      (dailyData || []).forEach(row => {
        const day = new Date(row.created_at).toISOString().split('T')[0];
        if (dayBuckets[day] !== undefined) dayBuckets[day]++;
      });
      chartData = Object.entries(dayBuckets).map(([date, count]) => {
        const d = new Date(date);
        const label = range === '7d'
          ? d.toLocaleDateString('fr-FR', { weekday: 'short' })
          : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        return { label, views: count };
      });

    } else if (range === '12m') {
      rangeStart = new Date(now);
      rangeStart.setMonth(rangeStart.getMonth() - 12);

      const { data: monthlyData } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', rangeStart.toISOString());

      const monthBuckets: Record<string, number> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthBuckets[key] = 0;
      }
      (monthlyData || []).forEach(row => {
        const d = new Date(row.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthBuckets[key] !== undefined) monthBuckets[key]++;
      });
      chartData = Object.entries(monthBuckets).map(([key, count]) => {
        const [y, m] = key.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return { label: d.toLocaleDateString('fr-FR', { month: 'short' }), views: count };
      });

    } else if (range === 'year') {
      rangeStart = new Date(now.getFullYear(), 0, 1);

      const { data: yearData } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', rangeStart.toISOString());

      const monthBuckets: Record<number, number> = {};
      for (let m = 0; m <= now.getMonth(); m++) monthBuckets[m] = 0;
      (yearData || []).forEach(row => {
        const month = new Date(row.created_at).getMonth();
        monthBuckets[month] = (monthBuckets[month] || 0) + 1;
      });
      chartData = Object.entries(monthBuckets).map(([m, count]) => {
        const d = new Date(now.getFullYear(), parseInt(m));
        return { label: d.toLocaleDateString('fr-FR', { month: 'short' }), views: count };
      });
    }

    // 6. Top pages (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: topPagesRaw } = await supabase
      .from('page_views')
      .select('path')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const pageCounts: Record<string, number> = {};
    (topPagesRaw || []).forEach(row => {
      pageCounts[row.path] = (pageCounts[row.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, views: count }));

    // 7. Top referrers (last 30 days)
    const { data: referrersRaw } = await supabase
      .from('page_views')
      .select('referrer')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('referrer', 'is', null)
      .neq('referrer', '');

    const refCounts: Record<string, number> = {};
    (referrersRaw || []).forEach(row => {
      if (row.referrer) {
        try {
          const host = new URL(row.referrer).hostname || row.referrer;
          refCounts[host] = (refCounts[host] || 0) + 1;
        } catch {
          refCounts[row.referrer] = (refCounts[row.referrer] || 0) + 1;
        }
      }
    });
    const topReferrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, views: count }));

    // 8. Funnel data based on range start
    const funnelRangeStart = rangeStart || thirtyDaysAgo;
    
    // Total views in range
    const { count: funnelViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', funnelRangeStart.toISOString())
      .is('event', null);

    // Total buy clicks in range
    const { count: funnelClicks } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', funnelRangeStart.toISOString())
      .eq('event', 'click_buy_button');

    // Total checkout submits in range
    const { count: funnelCheckouts } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', funnelRangeStart.toISOString())
      .eq('event', 'submit_email_checkout');

    // Total sales in range
    const { count: funnelSales } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', funnelRangeStart.toISOString())
      .eq('status', 'PAID');

    return NextResponse.json({
      kpis: {
        viewsToday: viewsToday || 0,
        viewsYesterday: viewsYesterday || 0,
        activeVisitors: activeVisitors || 0,
        totalViews: totalViews || 0,
      },
      chartData,
      topPages,
      topReferrers,
      funnel: {
        views: funnelViews || 0,
        clicks: funnelClicks || 0,
        checkouts: funnelCheckouts || 0,
        sales: funnelSales || 0,
      }
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    // If table doesn't exist, return empty data with a flag
    if (error?.message?.includes('page_views') || error?.code === '42P01') {
      return NextResponse.json({ tableNotFound: true }, { status: 200 });
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
