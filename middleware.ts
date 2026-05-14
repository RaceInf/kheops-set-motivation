import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /chantier-ksm7 routes (except login page and API auth)
  if (!pathname.startsWith('/chantier-ksm7')) {
    return NextResponse.next();
  }

  // Allow login page and auth API
  if (pathname === '/chantier-ksm7/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/chantier-ksm7/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session format (token:timestamp)
  const parts = sessionCookie.value.split(':');
  if (parts.length !== 2) {
    const loginUrl = new URL('/chantier-ksm7/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const timestamp = parseInt(parts[1], 10);
  const maxAge = 4 * 60 * 60 * 1000; // 4 hours in ms

  if (Date.now() - timestamp > maxAge) {
    // Session expired
    const response = NextResponse.redirect(new URL('/chantier-ksm7/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  // Activity detected: refresh the session to "slide" the 4-hour window
  const response = NextResponse.next();
  const freshSession = `${parts[0]}:${Date.now()}`;
  
  response.cookies.set('admin_session', freshSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60, // 4 hours in seconds
    path: '/',
  });

  return response;
}

export const config = {
  matcher: ['/chantier-ksm7/:path*'],
};
