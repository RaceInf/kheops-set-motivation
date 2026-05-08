import { MetadataRoute } from 'next';
import { tools, blogPosts } from '@/lib/data';
import { getSiteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  // Core pages
  const routes = [
    '', 
    '/arsenal', 
    '/articles',
    '/mentions-legales',
    '/politique-de-confidentialite'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Tool pages
  const toolRoutes = tools.map((tool) => ({
    url: `${baseUrl}/arsenal/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Blog pages
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/articles/${post.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...toolRoutes, ...blogRoutes];
}
