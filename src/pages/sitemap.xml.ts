import type { APIRoute } from 'astro';
import { getPortfolioData } from '../lib/db';

const STATIC_ROUTES = ['/', '/resume.pdf'];

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://portfolio.relapri.my.id').replace(/\/$/, '');
  const { projects } = await getPortfolioData();

  const urls = [
    ...STATIC_ROUTES,
    ...projects.map((p) => `/projects/${encodeURIComponent(p.id)}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((path) => `  <url><loc>${base}${path}</loc><changefreq>weekly</changefreq></url>`)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      // Project list changes only via admin; cache a day at the edge.
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
};
