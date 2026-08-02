import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { site } from '@/config/site';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  /** Trip pages emit TouristTrip structured data. */
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
}

const DEFAULT_OG = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';

export function Seo({ title, description = site.description, image = DEFAULT_OG, jsonLd, noIndex }: SeoProps) {
  const { pathname } = useLocation();
  const url = `${site.url.replace(/\/+$/, '')}${pathname}`;
  const fullTitle = pathname === '/' ? title : `${title} · ${site.name}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}
