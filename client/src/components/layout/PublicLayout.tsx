import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { SiteBackdrop } from './SiteBackdrop';
import { WhatsAppFab } from './WhatsAppFab';

export function PublicLayout() {
  // The public site is dark-only; the admin panel keeps the light theme.
  // On <html> (not a wrapper div) so menus, toasts and lightboxes get it too.
  useEffect(() => {
    document.documentElement.classList.add('theme-dark');
    return () => document.documentElement.classList.remove('theme-dark');
  }, []);

  return (
    <div className="relative isolate">
      <SiteBackdrop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppFab />
    </div>
  );
}
