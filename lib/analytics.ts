/**
 * Utilitaire de tracking personnalisé pour KSM
 */

import { getVisitorId } from './visitor';

export const trackEvent = (eventName: string, metadata: any = {}) => {
  // Don't track in SSR
  if (typeof window === 'undefined') return;

  // Fire and forget
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      path: window.location.pathname,
      referrer: document.referrer || null,
      visitor_id: getVisitorId(),
      ...metadata
    }),
  }).catch(() => {
    // Silent fail
  });
};
