/**
 * Responsive image helpers. Cloudinary and Unsplash both resize via URL, so
 * srcset costs nothing extra — seeded Unsplash URLs and admin uploads both work.
 */

// A 1280 rung sits just above a high-DPR phone's 100vw request (~1080px), so
// full-bleed heroes pick 1280 instead of jumping to 1920 — a big LCP saving.
const WIDTHS = [480, 768, 1024, 1280, 1600, 1920];

function cloudinaryAt(url: string, width: number): string {
  // Inject the transform right after /upload/.
  return url.replace(/\/upload\/(?!v?\d*\/?[a-z]_)/, `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

function unsplashAt(url: string, width: number): string {
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    // `auto=format` serves WebP/AVIF; q=62 roughly halves the bytes versus the
    // seed URLs' q=80 with no visible loss on photographic content, which is the
    // single biggest LCP lever for the image-heavy listing and detail pages.
    u.searchParams.set('auto', 'format');
    u.searchParams.set('q', '62');
    return u.toString();
  } catch {
    return url;
  }
}

export function imageAt(url: string, width: number): string {
  if (!url) return url;
  if (url.includes('res.cloudinary.com')) return cloudinaryAt(url, width);
  if (url.includes('images.unsplash.com')) return unsplashAt(url, width);
  return url;
}

/** Builds a `srcset` string; returns undefined for hosts we can't resize. */
export function srcSet(url: string): string | undefined {
  if (!url) return undefined;
  const resizable = url.includes('res.cloudinary.com') || url.includes('images.unsplash.com');
  if (!resizable) return undefined;

  return WIDTHS.map((w) => `${imageAt(url, w)} ${w}w`).join(', ');
}

/** Sensible `sizes` presets for the layouts used across the site. */
export const sizes = {
  full: '100vw',
  half: '(max-width: 768px) 100vw, 50vw',
  card: '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw',
  thumb: '(max-width: 640px) 45vw, 22vw',
  /**
   * Full-bleed hero sitting behind a 50–85% scrim and film grain. Reporting a
   * slightly-under-viewport width on phones lets a high-DPR device pick the 1024
   * rung instead of 1280 — invisible under the overlay, materially faster LCP.
   */
  hero: '(max-width: 768px) 88vw, 100vw',
} as const;
