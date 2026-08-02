import { ArrowUpRight, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mailtoLink, navLinks, site, telLink } from '@/config/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pitch text-paper">
      <div className="shell edge py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-[0.95] tracking-tight">
              {site.name}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">
              {site.tagline} Run out of {site.basedAt} since {site.founded}.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow text-paper/55">Explore</p>
            <ul className="mt-6 space-y-3.5">
              <li>
                <Link to="/" className="link-underline text-sm text-paper/80 hover:text-paper">
                  Home
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-underline text-sm text-paper/80 hover:text-paper">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow text-paper/55">Reach us</p>
            <ul className="mt-6 space-y-3.5 text-sm">
              <li>
                <a href={telLink()} className="link-underline text-paper/80 hover:text-paper">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={mailtoLink()} className="link-underline text-paper/80 hover:text-paper">
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={site.social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-paper/80 hover:text-paper"
                >
                  <Instagram size={15} strokeWidth={1.5} />
                  @{site.social.instagram}
                  <ArrowUpRight size={13} strokeWidth={1.5} />
                </a>
              </li>
              <li className="pt-1 text-paper/55">{site.contact.address}</li>
            </ul>
          </div>
        </div>

        <hr className="mt-20 border-0 border-t border-hairline-invert" />

        <div className="mt-7 flex flex-col gap-2 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>Made by students, in Roorkee.</p>
        </div>
      </div>
    </footer>
  );
}
