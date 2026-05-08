export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-YS40780W8W';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_TRACKING_ID) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
      environment: process.env.NODE_ENV,
      hostname: window.location.hostname,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value, ...rest }: {
  action: string;
  category: string;
  label: string;
  value?: number;
  [key: string]: any;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_TRACKING_ID) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      environment: process.env.NODE_ENV,
      hostname: window.location.hostname,
      ...rest,
    });
  }
};
