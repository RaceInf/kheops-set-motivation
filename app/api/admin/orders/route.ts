import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 30;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('id, created_at, total_amount, status, customer_name, whatsapp_number, users(email), order_items(product_id)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) query = query.gte('created_at', d.toISOString());
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) query = query.lte('created_at', d.toISOString());
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      orders: (orders || []).map(o => ({
        id: o.id,
        date: o.created_at,
        amount: o.total_amount,
        status: o.status,
        email: (o.users as any)?.email || 'N/A',
        productId: (o.order_items as any)?.[0]?.product_id || 'N/A',
        customerName: o.customer_name,
        whatsappNumber: o.whatsapp_number,
      })),
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
