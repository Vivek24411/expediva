import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Seo } from '@/components/layout/Seo';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { Eyebrow } from '@/components/ui/primitives';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noIndex />
      <Navbar />

      <main className="flex min-h-[85svh] items-center bg-ivory pt-[68px]">
        <div className="shell edge">
          <Eyebrow>Error 404</Eyebrow>

          <h1 className="mt-6 max-w-3xl font-display text-display-lg tracking-tight text-ink">
            Off the trail.
          </h1>

          <p className="mt-8 max-w-sm text-sm leading-relaxed text-ink-soft">
            This page doesn&apos;t exist — the trip may have been taken down, or the link picked up a
            typo somewhere along the way.
          </p>

          <div className="mt-11 flex flex-wrap gap-3">
            <Link
              to="/trips"
              className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-sm font-medium tracking-wide text-paper transition-colors duration-300 hover:bg-ember"
            >
              See all trips
              <ArrowRight
                size={16}
                strokeWidth={1.6}
                className="transition-transform duration-500 ease-editorial group-hover:translate-x-1.5"
              />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center border border-hairline px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:border-ink"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFab />
    </>
  );
}
