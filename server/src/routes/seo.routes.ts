import { Router } from 'express';
import { env } from '../config/env';
import { TripModel } from '../models/Trip';
import { asyncHandler } from '../utils/http';

export const seoRouter = Router();

const SITE = env.PUBLIC_SITE_URL.replace(/\/+$/, '');

const STATIC_PATHS: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/trips', changefreq: 'daily', priority: '0.9' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
];

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** GET /sitemap.xml — static pages plus one entry per trip. */
seoRouter.get(
  '/sitemap.xml',
  asyncHandler(async (_req, res) => {
    const trips = await TripModel.find({}, { slug: 1, updatedAt: 1 }).lean();

    const urls = [
      ...STATIC_PATHS.map(
        (p) =>
          `  <url>\n    <loc>${xmlEscape(SITE + p.path)}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
      ),
      ...trips.map(
        (t) =>
          `  <url>\n    <loc>${xmlEscape(`${SITE}/trips/${t.slug}`)}</loc>\n    <lastmod>${new Date(t.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      ),
    ].join('\n');

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    );
  }),
);

/** GET /robots.txt */
seoRouter.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', '', `Sitemap: ${SITE}/sitemap.xml`, ''].join(
      '\n',
    ),
  );
});
