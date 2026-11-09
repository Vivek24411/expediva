import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { navLinks, site } from '@/config/site';
import { cx } from '@/components/ui/primitives';
import { useLenis } from '@/components/motion/SmoothScroll';
import { homeSectionId, scrollToSection } from '@/lib/scrollToSection';

const TRANSPARENT_ON = new Set(['/', '/gallery']);

const moreLinks = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'Merch', to: '/merch' },
] as const;

export function Navbar() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const overHero = TRANSPARENT_ON.has(pathname) || pathname.startsWith('/trips/');
  // The homepage sits on one dark photo throughout, so its bar turns to dark glass when
  // scrolled instead of switching to the light bar the other pages use.
  const onHome = pathname === '/';
  const solid = (!onHome && (scrolled || !overHero)) || menuOpen;
  const darkGlass = onHome && scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname, hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Arriving on "/#about", "/#customize", "/#reviews" from another page: wait for the
  // homepage to render (and the route-change scroll reset to finish), then scroll.
  useEffect(() => {
    if (pathname !== '/' || !hash) return;
    const id = hash.slice(1);
    let tries = 0;
    let settle: number | undefined;
    const timer = window.setInterval(() => {
      if (scrollToSection(id, lenis)) {
        window.clearInterval(timer);
        // Trips load in above lower sections (e.g. reviews) and push them down — re-aim once.
        settle = window.setTimeout(() => scrollToSection(id, lenis), 900);
      } else if (++tries > 20) {
        window.clearInterval(timer);
      }
    }, 150);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(settle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);

  /** Click handler for links that point at a homepage section (e.g. "/#about"). */
  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    const id = homeSectionId(to);
    if (!id) return;

    event.preventDefault();
    setMenuOpen(false);
    const details = event.currentTarget.closest('details');
    if (details) details.open = false;

    if (pathname !== '/') {
      navigate(to);
      return;
    }

    window.history.replaceState(null, '', to);
    scrollToSection(id, lenis);
  };

  const closeMoreMenu = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    const details = event.currentTarget.closest('details');
    if (details) details.open = false;
    handleSectionClick(event, to);
  };

  /** NavLink ignores the hash, so "/", "/#about" and "/#customize" would all light up on home. */
  const isLinkActive = (to: string) => {
    const id = homeSectionId(to);
    if (id) return pathname === '/' && hash === `#${id}`;
    if (to === '/') return pathname === '/' && !hash;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-editorial',
          solid
            ? 'border-b border-hairline bg-ivory/95 backdrop-blur-sm'
            : darkGlass
              ? 'border-b border-white/10 bg-black/45 backdrop-blur-md'
              : 'bg-transparent',
        )}
      >
        <nav
          className="shell edge flex h-[68px] items-center justify-between"
          aria-label="Primary"
        >
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Expediva"
              // Fits inside the 68px bar (it used to hang over the page below it).
              className="h-[58px] w-auto object-contain"
            />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks
              .filter((link) => link.label !== 'More')
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={(event) => handleSectionClick(event, link.to)}
                  className={cx(
                    'link-underline text-sm tracking-wide transition-colors duration-500',
                    solid ? 'text-ink-soft hover:text-ink' : 'text-paper/85 hover:text-paper',
                    isLinkActive(link.to) && (solid ? 'text-ink' : 'text-paper'),
                  )}
                >
                  {link.label}
                </NavLink>
              ))}

            <details className="group relative">
              <summary
                className={cx(
                  'flex cursor-pointer list-none items-center gap-1 text-sm tracking-wide transition-colors duration-300',
                  solid ? 'text-ink-soft hover:text-ink' : 'text-paper/85 hover:text-paper',
                )}
              >
                More
                <ChevronDown
                  size={14}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="absolute right-0 top-full z-50 mt-3 min-w-48 border border-hairline bg-ivory py-2 shadow-xl">
                {moreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={(event) => closeMoreMenu(event, link.to)}
                    className="block px-5 py-3 text-sm text-ink-soft transition-colors hover:bg-sand hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
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
            <div className="edge flex h-full flex-col justify-between overflow-y-auto pb-12 pt-10">
              <ul className="space-y-1">
                {navLinks
                  .filter((link) => link.label !== 'More')
                  .map((link, index) => (
                    <motion.li
                      key={link.to}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.05 + index * 0.06,
                        duration: 0.5,
                        ease: [0.65, 0, 0.35, 1],
                      }}
                      className="border-b border-hairline"
                    >
                      <Link
                        to={link.to}
                        onClick={(event) => handleSectionClick(event, link.to)}
                        className="block py-5 font-display text-4xl tracking-tight text-ink"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}

                <li className="border-b border-hairline py-4">
                  <details>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-display text-4xl tracking-tight text-ink">
                      More
                      <ChevronDown size={22} />
                    </summary>
                    <div className="space-y-1 pb-3 pl-4 pt-2">
                      {moreLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={(event) => {
                            setMenuOpen(false);
                            handleSectionClick(event, link.to);
                          }}
                          className="block py-3 text-lg text-ink-soft"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                </li>
              </ul>

              <div className="mt-10">
                <p className="eyebrow mb-3">Get in touch</p>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, '')}`}
                  className="block text-lg text-ink"
                >
                  {site.contact.phone}
                </a>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="block text-lg text-ink-soft"
                >
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
