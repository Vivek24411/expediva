import { useQuery } from '@tanstack/react-query';
import { ArrowRight, GraduationCap, MapPin, Receipt, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/home/Hero';
import { Marquee, MarqueeSkeleton } from '@/components/home/Marquee';
import { Testimonials } from '@/components/home/Testimonials';
import { Seo } from '@/components/layout/Seo';
import { Reveal, RevealChild, RevealGroup } from '@/components/motion/Reveal';
import { TripCard, TripCardSkeleton } from '@/components/trips/TripCard';
import { Accordion } from '@/components/ui/Accordion';
import { Eyebrow, Notice } from '@/components/ui/primitives';
import { generalFaqs, site, trustPoints } from '@/config/site';
import { api, queryKeys } from '@/lib/api';
import { ordinal } from '@/lib/format';

/** Explicit map — a namespace import would pull every Lucide icon into the bundle. */
const TRUST_ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  MapPin,
  ShieldCheck,
  Receipt,
};

export default function Home() {
  const upcoming = useQuery({
    queryKey: queryKeys.trips({ status: 'upcoming' }),
    queryFn: () => api.listTrips({ status: 'upcoming' }),
  });

  const past = useQuery({
    queryKey: queryKeys.trips({ status: 'past' }),
    queryFn: () => api.listTrips({ status: 'past' }),
  });

  const featured = upcoming.data?.slice(0, 3) ?? [];
  const marqueeImages = (past.data ?? []).flatMap((trip) => [trip.heroImage, ...trip.gallery]);

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

      {/* ---------------------------------------------- upcoming departures */}
      <section className="bg-ivory py-24 lg:py-36">
        <div className="shell edge">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Upcoming departures</Eyebrow>
              <h2 className="mt-4 max-w-xl font-display text-display-sm tracking-tight text-ink">
                Three trips leaving campus soon.
              </h2>
            </div>

            <Link
              to="/trips"
              className="group inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              All trips
              <ArrowRight
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-500 ease-editorial group-hover:translate-x-1"
              />
            </Link>
          </div>

          <hr className="hairline mt-10" />

          <div className="mt-12">
            {upcoming.isPending ? (
              <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            ) : upcoming.isError ? (
              <Notice
                title="We couldn't load the trips"
                body={upcoming.error.message}
                action={
                  <button
                    type="button"
                    onClick={() => upcoming.refetch()}
                    className="bg-ink px-7 py-3.5 text-sm text-paper transition-colors hover:bg-ember"
                  >
                    Try again
                  </button>
                }
              />
            ) : featured.length === 0 ? (
              <Notice
                title="Nothing on the calendar yet"
                body="The next set of departures is being planned. Follow us on Instagram — that's where they go up first."
              />
            ) : (
              <RevealGroup className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((trip, i) => (
                  <RevealChild key={trip._id}>
                    <TripCard trip={trip} index={i} />
                  </RevealChild>
                ))}
                {/* Home cards sit well below the hero fold — no priority needed. */}
              </RevealGroup>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- why Expediva */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="shell edge">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <Eyebrow>Why Expediva</Eyebrow>
              <h2 className="mt-4 max-w-md font-display text-display-sm tracking-tight text-ink">
                Built for the way students actually travel.
              </h2>
            </Reveal>

            <RevealGroup className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
              {trustPoints.map((point, i) => {
                const Icon = TRUST_ICONS[point.icon] ?? MapPin;

                return (
                  <RevealChild key={point.title}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-xs text-ember">{ordinal(i)}</span>
                      <Icon size={17} strokeWidth={1.4} className="text-ink-soft" />
                    </div>
                    <h3 className="mt-4 font-display text-xl leading-tight tracking-tight text-ink">
                      {point.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{point.body}</p>
                  </RevealChild>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* ------------------------------------------------------- past trips */}
      {past.isPending ? <MarqueeSkeleton /> : <Marquee images={marqueeImages} />}

      {/* ------------------------------------------------------------ FAQs */}
      <section className="bg-ivory py-24 lg:py-36">
        <div className="shell edge grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
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
      </section>

      {/* -------------------------------------------------------- final CTA */}
      <section className="relative overflow-hidden bg-pitch py-28 lg:py-40">
        <div className="shell edge relative text-center">
          <Reveal>
            <Eyebrow className="text-paper/55">Seats go fast</Eyebrow>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-display-md tracking-tight text-paper">
              Your next trip is already on the calendar.
            </h2>
            <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-paper/60">
              Pick a departure, open the form, pay inside it. That&apos;s the whole process.
            </p>

            <Link
              to="/trips"
              className="group mt-11 inline-flex items-center gap-3 bg-ember px-9 py-4 text-sm font-medium tracking-wide text-paper transition-colors duration-300 hover:bg-ember-bright"
            >
              Explore Trips
              <ArrowRight
                size={16}
                strokeWidth={1.6}
                className="transition-transform duration-500 ease-editorial group-hover:translate-x-1.5"
              />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
