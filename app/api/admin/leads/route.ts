import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const API_KEY = process.env.BREVO_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Brevo API key missing' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const isExport = searchParams.get('export') === 'true';
    const limit = isExport ? 1000 : parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const response = await fetch(
      `https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&sort=desc`,
      {
        headers: {
          'accept': 'application/json',
          'api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      contacts: (data.contacts || []).map((c: any) => ({
        email: c.email,
        createdAt: c.createdAt,
        modifiedAt: c.modifiedAt,
      })),
      total: data.count || 0,
    });

  } catch (error) {
    console.error('Admin leads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
