import type Lenis from 'lenis';

/** Height of the fixed navbar, so section headings don't land underneath it. */
const NAV_OFFSET = 68;

/**
 * Smooth-scrolls to a homepage section by id (about, trips, customize, reviews…).
 * Returns false when the section isn't on the page (yet).
 */
export function scrollToSection(id: string, lenis: Lenis | null): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  if (lenis) {
    // Lenis already honours the section's CSS scroll-margin-top (scroll-mt-[68px]),
    // so only add the navbar offset when the section doesn't set one.
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    lenis.scrollTo(el, { offset: margin ? 0 : -NAV_OFFSET });
  } else {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
      behavior: 'smooth',
    });
  }

  return true;
}

/** "/#about" → "about"; anything that isn't a homepage hash link → null. */
export function homeSectionId(to: string): string | null {
  return to.startsWith('/#') ? to.slice(2) : null;
}
