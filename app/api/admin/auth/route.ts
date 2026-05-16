import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  // Rate limiting distribué (Upstash Redis si configuré, sinon in-memory)
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`admin:login:${ip}`);

  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback_secret';

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Génère le token de session (SHA-256 du secret + timestamp)
    const timestamp = Date.now();
    const encoder = new TextEncoder();
    const data = encoder.encode(`${sessionSecret}:${timestamp}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const sessionValue = `${token}:${timestamp}`;

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4, // 4 heures
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
