import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Check, MapPin, Minus, Users } from 'lucide-react';
import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@shared/types';
import { Seo } from '@/components/layout/Seo';
import { Reveal, RevealImage } from '@/components/motion/Reveal';
import { Countdown } from '@/components/trips/Countdown';
import { SwipeGallery } from '@/components/trips/SwipeGallery';
import { Accordion } from '@/components/ui/Accordion';
import { Eyebrow, Img, Notice, cx } from '@/components/ui/primitives';
import { site } from '@/config/site';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { api, queryKeys } from '@/lib/api';
import {
  closedReason,
  formatDate,
  formatDateRange,
  formatPrice,
  isEnrollable,
  ordinal,
  urgencyFor,
} from '@/lib/format';
import { sizes } from '@/lib/image';

export default function TripDetail() {
  const { slug = '' } = useParams();
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { data: trip, isPending, isError, error } = useQuery({
    queryKey: queryKeys.trip(slug),
    queryFn: () => api.getTrip(slug),
    enabled: Boolean(slug),
  });

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  if (isPending) return <TripDetailSkeleton />;

  if (isError || !trip) {
    return (
      <div className="shell edge py-40">
        <Seo title="Trip not found" noIndex />
        <Notice
          title="We couldn't find that trip"
          body={error?.message ?? 'It may have been removed, or the link might be out of date.'}
          action={
            <Link to="/trips" className="bg-ink px-7 py-3.5 text-sm text-paper hover:bg-ember">
              Browse all trips
            </Link>
          }
        />
      </div>
    );
  }

  const open = isEnrollable(trip);
  const urgency = urgencyFor(trip);
  const galleryImages = [trip.heroImage, ...trip.gallery];

  const enrollLabel = open ? 'Enroll Now' : 'Enrollment Closed';

  return (
    <>
      <Seo
        title={trip.title}
        description={`${trip.durationDays} days in ${trip.destination}, ${formatDateRange(trip.startDate, trip.endDate)}. ${formatPrice(trip.price)} per student, departing from ${trip.pickupPoint}.`}
        image={trip.heroImage}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: trip.title,
          description: trip.highlights.join(' '),
          image: galleryImages,
          url: `${site.url}/trips/${trip.slug}`,
          touristType: 'College students',
          itinerary: {
            '@type': 'ItemList',
            numberOfItems: trip.itinerary.length,
            itemListElement: trip.itinerary.map((day) => ({
              '@type': 'ListItem',
              position: day.day,
              name: day.title,
              description: day.description,
            })),
          },
          offers: {
            '@type': 'Offer',
            price: trip.price,
            priceCurrency: 'INR',
            availability:
              open ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url: trip.formLink,
            validThrough: trip.enrollmentDeadline,
          },
          provider: { '@type': 'Organization', name: site.name, url: site.url },
        }}
      />

      {/* ------------------------------------------------------------- hero */}
      <section ref={heroRef} className="relative h-[78svh] min-h-[500px] overflow-hidden">
        <motion.div className="absolute inset-0 -bottom-[14%]" style={reduced ? undefined : { y: heroY }}>
          <Img
            src={trip.heroImage}
            alt={trip.title}
            sizes={sizes.hero}
            priority
            baseWidth={1024}
            className="h-full w-full object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-pitch/50 via-pitch/20 to-pitch/85" />
        <div className="grain absolute inset-0" />

        <div className="relative flex h-full items-end pb-14">
          <div className="shell edge">
            <Eyebrow className="text-paper/65">
              {CATEGORY_LABELS[trip.category]} · {DIFFICULTY_LABELS[trip.difficulty]} ·{' '}
              {trip.durationDays} days
            </Eyebrow>

            <h1 className="mt-5 max-w-4xl font-display text-display-md tracking-tight text-paper">
              {trip.title}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-paper/75">
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} strokeWidth={1.5} />
                {trip.destination}
              </span>
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              <span className="inline-flex items-center gap-2">
                <Users size={15} strokeWidth={1.5} />
                {trip.seatsLeft} of {trip.seatsTotal} seats left
              </span>
              {urgency ? (
                <span
                  className={cx(
                    'px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em]',
                    urgency.tone === 'critical' ? 'bg-ember text-paper' : 'bg-paper/15 text-paper',
                  )}
                >
                  {urgency.label}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ price + enrollment */}
      <section className="border-b border-hairline bg-ivory">
        <div className="shell edge grid gap-10 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:py-14">
          <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
            <div>
              <p className="eyebrow">Per student</p>
              <p className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-[clamp(2rem,5vw,2.75rem)] leading-none tracking-tight text-ink">
                  {formatPrice(trip.price)}
                </span>
                {trip.originalPrice ? (
                  <span className="text-sm text-ink-muted line-through">
                    {formatPrice(trip.originalPrice)}
                  </span>
                ) : null}
              </p>
            </div>

            {open ? <Countdown deadline={trip.enrollmentDeadline} /> : null}
          </div>

          <div className="lg:text-right">
            {open ? (
              <a
                href={trip.formLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-center gap-3 bg-ember px-10 py-4 text-sm font-medium tracking-wide text-paper transition-colors duration-300 hover:bg-ember-deep sm:w-auto"
              >
                {enrollLabel}
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                  className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ) : (
              <div>
                <span className="inline-flex w-full cursor-not-allowed items-center justify-center gap-3 border border-hairline bg-sand px-10 py-4 text-sm font-medium tracking-wide text-ink-muted sm:w-auto">
                  {enrollLabel}
                </span>
                <p className="mt-2.5 text-xs text-ink-muted lg:text-right">{closedReason(trip)}</p>
              </div>
            )}

            {open ? (
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-muted lg:ml-auto lg:text-right">
                Payment QR and screenshot upload are inside the form.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- highlights */}
      {trip.highlights.length > 0 ? (
        <section className="bg-ivory py-20 lg:py-28">
          <div className="shell edge grid gap-12 lg:grid-cols-[0.6fr_1.4fr]">
            <Reveal>
              <Eyebrow>Highlights</Eyebrow>
              <h2 className="mt-4 font-display text-display-sm tracking-tight text-ink">
                What you&apos;ll remember.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <ul className="border-t border-hairline">
                {trip.highlights.map((item, i) => (
                  <li key={item} className="flex gap-5 border-b border-hairline py-5">
                    <span className="eyebrow mt-1 w-8 shrink-0 text-ember">{ordinal(i)}</span>
                    <span className="text-[0.95rem] leading-relaxed text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ----------------------------------------------------------- gallery */}
      {galleryImages.length > 1 ? (
        <section className="bg-paper py-20 lg:py-28">
          <div className="shell edge mb-10">
            <Eyebrow>The place</Eyebrow>
          </div>
          <RevealImage>
            <SwipeGallery images={galleryImages} title={trip.title} />
          </RevealImage>
        </section>
      ) : null}

      {/* --------------------------------------------------------- itinerary */}
      {trip.itinerary.length > 0 ? (
        <section className="bg-ivory py-20 lg:py-28">
          <div className="shell edge grid gap-12 lg:grid-cols-[0.6fr_1.4fr]">
            <Reveal>
              <Eyebrow>Day by day</Eyebrow>
              <h2 className="mt-4 font-display text-display-sm tracking-tight text-ink">
                The plan.
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
                Weather and road conditions can move things around. Your trip captain will tell you
                before anything changes.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <Accordion
                defaultOpen={0}
                items={trip.itinerary.map((day) => ({
                  id: `day-${day.day}`,
                  marker: `Day ${String(day.day).padStart(2, '0')}`,
                  label: day.title,
                  content: <p>{day.description}</p>,
                }))}
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------- inclusions / exclusions */}
      <section className="bg-pitch py-20 text-paper lg:py-28">
        <div className="shell edge">
          <Eyebrow className="text-paper/55">The fine print, in plain words</Eyebrow>

          <div className="mt-12 grid gap-14 md:grid-cols-2">
            <Reveal>
              <h3 className="font-display text-2xl tracking-tight">What&apos;s included</h3>
              <ul className="mt-7 space-y-4">
                {trip.inclusions.map((item) => (
                  <li key={item} className="flex gap-3.5 text-sm leading-relaxed text-paper/75">
                    <Check size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-moss" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <h3 className="font-display text-2xl tracking-tight">What&apos;s not</h3>
              <ul className="mt-7 space-y-4">
                {trip.exclusions.map((item) => (
                  <li key={item} className="flex gap-3.5 text-sm leading-relaxed text-paper/55">
                    <Minus size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ember" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- pickup + things to carry */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell edge grid gap-14 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Departure</Eyebrow>
            <h3 className="mt-4 font-display text-2xl tracking-tight text-ink">
              {trip.pickupPoint}
            </h3>
            <dl className="mt-8 border-t border-hairline text-sm">
              {[
                ['Leaves', formatDate(trip.startDate)],
                ['Returns', formatDate(trip.endDate)],
                ['Duration', `${trip.durationDays} days`],
                ['Enrollment closes', formatDate(trip.enrollmentDeadline)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 border-b border-hairline py-4">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {trip.thingsToCarry.length > 0 ? (
            <Reveal delay={0.08}>
              <Eyebrow>Pack this</Eyebrow>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-ink">
                Things to carry
              </h3>
              <ul className="mt-8 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {trip.thingsToCarry.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* -------------------------------------------------------------- FAQs */}
      {trip.faqs.length > 0 ? (
        <section className="bg-paper py-20 lg:py-28">
          <div className="shell edge grid gap-12 lg:grid-cols-[0.6fr_1.4fr]">
            <Reveal>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 font-display text-display-sm tracking-tight text-ink">
                About this trip.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <Accordion
                items={trip.faqs.map((faq, i) => ({
                  id: `trip-faq-${i}`,
                  marker: ordinal(i),
                  label: faq.q,
                  content: <p>{faq.a}</p>,
                }))}
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ivory/97 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              <span className="font-display text-xl leading-none text-ink">
                {formatPrice(trip.price)}
              </span>
              {trip.originalPrice ? (
                <span className="text-xs text-ink-muted line-through">
                  {formatPrice(trip.originalPrice)}
                </span>
              ) : null}
            </p>
            <p className="mt-1 truncate text-[0.7rem] text-ink-muted">
              {open ? 'QR + screenshot are inside the form' : closedReason(trip)}
            </p>
          </div>

          {open ? (
            <a
              href={trip.formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-ember px-7 py-3.5 text-sm font-medium text-paper"
            >
              {enrollLabel}
            </a>
          ) : (
            <span className="shrink-0 cursor-not-allowed border border-hairline bg-sand px-6 py-3.5 text-sm font-medium text-ink-muted">
              {enrollLabel}
            </span>
          )}
        </div>
      </div>

      {/* Keeps the footer clear of the sticky bar. */}
      <div className="h-[76px] lg:hidden" />
    </>
  );
}

function TripDetailSkeleton() {
  return (
    <div>
      <div className="h-[78svh] min-h-[500px] animate-pulse bg-sand" />
      <div className="shell edge space-y-6 py-14">
        <div className="h-3 w-28 animate-pulse bg-sand" />
        <div className="h-12 w-2/3 animate-pulse bg-sand" />
        <div className="h-4 w-1/2 animate-pulse bg-sand" />
        <div className="grid gap-4 pt-8 sm:grid-cols-2">
          <div className="h-40 animate-pulse bg-sand" />
          <div className="h-40 animate-pulse bg-sand" />
        </div>
      </div>
    </div>
  );
}
