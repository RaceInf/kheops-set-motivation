'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef('');

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin-ksm')) return;
    // Don't double-track same page
    if (pathname === lastTracked.current) return;

    lastTracked.current = pathname;

    // Fire and forget - non-blocking
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      // Silent fail - tracking should never break the UX
    });
  }, [pathname]);

  return null;
}
