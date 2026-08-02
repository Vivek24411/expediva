import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navLinks, site } from '@/config/site';
import { cx } from '@/components/ui/primitives';

/** Routes whose hero sits under a transparent navbar. */
const TRANSPARENT_ON = new Set(['/', '/gallery']);

export function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const overHero = TRANSPARENT_ON.has(pathname) || pathname.startsWith('/trips/');
  const solid = scrolled || !overHero || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Never leave the mobile sheet open across a navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-editorial',
          solid ? 'border-b border-hairline bg-ivory/95 backdrop-blur-sm' : 'bg-transparent',
        )}
      >
        <nav
          className="shell edge flex h-[68px] items-center justify-between"
          aria-label="Primary"
        >
          <Link
            to="/"
            className={cx(
              'font-display text-[1.6rem] leading-none tracking-tight transition-colors duration-500',
              solid ? 'text-ink' : 'text-paper',
            )}
          >
            {site.name}
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'link-underline text-sm tracking-wide transition-colors duration-500',
                    solid ? 'text-ink-soft hover:text-ink' : 'text-paper/85 hover:text-paper',
                    isActive && (solid ? 'text-ink' : 'text-paper'),
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/trips"
              className={cx(
                'px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-300',
                solid ? 'bg-ink text-paper hover:bg-ember' : 'bg-paper text-ink hover:bg-ember hover:text-paper',
              )}
            >
              Book a trip
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={cx(
              '-mr-2 p-2 transition-colors duration-500 md:hidden',
              solid ? 'text-ink' : 'text-paper',
            )}
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-ivory pt-[68px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="edge flex h-full flex-col justify-between pb-12 pt-10">
              <ul className="space-y-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
                    className="border-b border-hairline"
                  >
                    <Link
                      to={link.to}
                      className="block py-5 font-display text-4xl tracking-tight text-ink"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div>
                <p className="eyebrow mb-3">Get in touch</p>
                <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="block text-lg text-ink">
                  {site.contact.phone}
                </a>
                <a href={`mailto:${site.contact.email}`} className="block text-lg text-ink-soft">
                  {site.contact.email}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
