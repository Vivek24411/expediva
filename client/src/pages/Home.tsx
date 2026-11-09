import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PastTripCard, PastTripCardSkeleton, tripPhotos } from '@/components/gallery/PastTripCard';
import { CustomizeTrip } from '@/components/home/CustomizeTrip';
import { Hero } from '@/components/home/Hero';
import { UpcomingTrips } from '@/components/home/UpcomingTrips';
import { Seo } from '@/components/layout/Seo';
import { useLenis } from '@/components/motion/SmoothScroll';
import { Reveal } from '@/components/motion/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { Eyebrow } from '@/components/ui/primitives';
import { generalFaqs, site } from '@/config/site';
import { api, queryKeys } from '@/lib/api';
import { ordinal } from '@/lib/format';
import { scrollToSection } from '@/lib/scrollToSection';

/**
 * The homepage is one continuous page over the site-wide fixed background (SiteBackdrop).
 * Sections are transparent and use the same glass-card style so nothing looks like a
 * separate page.
 */
export default function Home() {
  const upcoming = useQuery({
    queryKey: queryKeys.trips({ status: 'upcoming' }),
    queryFn: () => api.listTrips({ status: 'upcoming' }),
  });

  const past = useQuery({
    queryKey: queryKeys.trips({ status: 'past' }),
    queryFn: () => api.listTrips({ status: 'past' }),
  });

  const upcomingTrips = upcoming.data ?? [];
  const pastTrips = (past.data ?? []).filter((trip) => tripPhotos(trip).length > 0).slice(0, 3);
  const lenis = useLenis();

  return (
    <>
      <Seo
        title={`${site.name} — ${site.tagline}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: site.name,
          url: site.url,
          description: site.description,
          email: site.contact.email,
          telephone: site.contact.phone,
          address: { '@type': 'PostalAddress', streetAddress: site.contact.address },
          sameAs: [site.social.instagramUrl],
        }}
      />

      <Hero />

      <UpcomingTrips
        trips={upcomingTrips}
        isPending={upcoming.isPending}
        isError={upcoming.isError}
        onRetry={() => upcoming.refetch()}
      />

      <CustomizeTrip trips={upcomingTrips} isPending={upcoming.isPending} />

      {/* ------------------------------------------ gallery (past trips) */}
      <section id="gallery" className="scroll-mt-[68px] py-20 text-white lg:py-28">
        <div className="shell edge">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-3xl uppercase tracking-widest underline decoration-white/60 underline-offset-8 md:text-5xl">
              Past Trips
            </h2>
            <Link
              to="/gallery"
              className="text-sm tracking-wide text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Full gallery →
            </Link>
          </div>

            {past.isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PastTripCardSkeleton key={i} />
              ))}
            </div>
          ) : pastTrips.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastTrips.map((trip) => (
                <PastTripCard key={trip._id} trip={trip} />
              ))}
            </div>
          ) : (
            // Always shown, so the section never disappears from the page.
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-white/15 bg-black/35 p-8 text-center backdrop-blur-md">
              <p className="text-white/80">
                {past.isError
                  ? 'Past trips could not be loaded.'
                  : 'Photos from our trips will appear here soon.'}
              </p>
              {past.isError ? (
                <button
                  type="button"
                  onClick={() => past.refetch()}
                  className="mt-5 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                >
                  Try again
                </button>
              ) : null}
            </div>
          )}
        </div>
        </section>

      {/* ------------------------------------------------------------ merch */}
      <section id="merch" className="scroll-mt-[68px] py-20 text-white lg:py-28">
        <div className="shell edge">
          <div className="grid items-center gap-10 rounded-3xl border border-white/20 bg-black/40 p-7 backdrop-blur-md md:grid-cols-[0.9fr_1.1fr] md:p-12">
            <div>
              <h2 className="font-serif text-3xl uppercase tracking-widest underline decoration-white/60 underline-offset-8 md:text-5xl">
                Expediva Merch
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/80">
                Take a piece of the trail home. Tees designed by the team, worn on every summit.
              </p>
              <Link
                to="/merch"
                className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-amber-400"
              >
                View Merch
              </Link>
            </div>
            <Link to="/merch" aria-label="View Expediva merch" className="block">
              <img
                src="/merch.png"
                alt="Expediva t-shirts"
                loading="lazy"
                decoding="async"
                className="mx-auto max-h-[380px] w-full rounded-2xl object-contain"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQs */}
      <section className="py-20 lg:py-28">
        <div className="shell edge">
          <div className="grid gap-10 rounded-3xl border border-white/20 bg-black/40 p-7 backdrop-blur-md md:p-12 lg:grid-cols-[0.7fr_1.3fr]">
            <Reveal>
              <Eyebrow>Common questions</Eyebrow>
              <h2 className="mt-4 max-w-xs font-display text-display-sm tracking-tight text-ink">
                Before you ask.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <Accordion
                items={generalFaqs.map((faq, i) => ({
                  id: `faq-${i}`,
                  label: faq.q,
                  marker: ordinal(i),
                  content: <p>{faq.a}</p>,
                }))}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- final CTA */}
      <section className="relative py-24 lg:py-36">
        <div className="shell edge relative text-center">
          <Reveal>
            <Eyebrow className="text-white/60">Seats go fast</Eyebrow>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-display-md tracking-tight text-white">
              Your next trip is already on the calendar.
            </h2>
            <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-white/75">
              Pick a departure, open the form, pay inside it. That&apos;s the whole process.
            </p>

            <a
              href="/#trips"
              onClick={(event) => {
                event.preventDefault();
                window.history.replaceState(null, '', '/#trips');
                scrollToSection('trips', lenis);
              }}
              className="group mt-11 inline-flex items-center gap-3 rounded-full bg-amber-400 px-9 py-4 text-sm font-bold uppercase tracking-wider text-black transition-colors duration-300 hover:bg-white"
            >
              Explore Trips
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="transition-transform duration-500 ease-editorial group-hover:translate-x-1.5"
              />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
