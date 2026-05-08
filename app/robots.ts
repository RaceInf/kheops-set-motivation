import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/static/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'anthropic-ai', 'PerplexityBot'],
        allow: '/',
      }
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
