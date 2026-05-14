import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { path, referrer, event } = await req.json();

    if (!path && !event) {
      return NextResponse.json({ error: 'Path or Event required' }, { status: 400 });
    }

    // Insert page view or event
    const { error } = await supabase
      .from('page_views')
      .insert([{
        path: path || 'event',
        referrer: referrer || null,
        event: event || null,
      }]);

    if (error) {
      // Don't crash the app if the table doesn't exist yet
      console.error('Track error (table may not exist):', error.message);
      return NextResponse.json({ tracked: false }, { status: 200 });
    }

    return NextResponse.json({ tracked: true });
  } catch (error) {
    return NextResponse.json({ tracked: false }, { status: 200 });
  }
}
