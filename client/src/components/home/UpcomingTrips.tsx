import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { cx } from '@/components/ui/primitives';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { isEnrollable } from '@/lib/format';
import { imageAt, srcSet } from '@/lib/image';

const AUTOPLAY_MS = 6000;

/* ------------------------------------------------------------- formatting */

function daySuffix(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return 'TH';
  return ({ 1: 'ST', 2: 'ND', 3: 'RD' } as Record<number, string>)[day % 10] ?? 'TH';
}

const month = (d: Date) => d.toLocaleString('en-IN', { month: 'short' }).toUpperCase();

/** "14TH–17TH MAY (4D/3N)" — or "31ST DEC – 5TH JAN (6D/5N)" across months. */
export function tripDates(trip: Trip): string {
  const s = new Date(trip.startDate);
  const e = new Date(trip.endDate);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';

  const sd = `${s.getDate()}${daySuffix(s.getDate())}`;
  const ed = `${e.getDate()}${daySuffix(e.getDate())}`;
  const range =
    s.getMonth() === e.getMonth() ? `${sd}–${ed} ${month(e)}` : `${sd} ${month(s)} – ${ed} ${month(e)}`;

  return `${range} (${trip.durationDays}D/${Math.max(0, trip.durationDays - 1)}N)`;
}

const rupees = (n: number) => `Rs. ${n.toLocaleString('en-IN')}/-`;

/* ---------------------------------------------------------------- section */

export function UpcomingTrips({
  trips,
  isPending,
  isError,
  onRetry,
}: {
  trips: Trip[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <section id="trips" className="scroll-mt-[68px] py-20 text-white lg:py-28">
      <div className="shell edge">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl uppercase tracking-widest underline decoration-white/60 underline-offset-8 md:text-5xl">
            Upcoming Trips
          </h2>
          <Link
            to="/trips"
            className="text-sm tracking-wide text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            See all trips →
          </Link>
        </div>

        {isPending ? (
          <Panel>
            <p className="text-white/80">Loading upcoming trips…</p>
          </Panel>
        ) : isError ? (
          <Panel>
            <p className="text-white/80">Upcoming trips could not be loaded.</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-amber-400"
            >
              Try again
            </button>
          </Panel>
        ) : trips.length === 0 ? (
          <Panel>
            <p className="text-white/80">New trips are being planned. Check back soon.</p>
          </Panel>
        ) : (
          <>
            <div className="hidden md:block">
              <DesktopCarousel trips={trips} />
            </div>
            <div className="md:hidden">
              <MobileCarousel trips={trips} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-white/15 bg-black/35 p-8 text-center backdrop-blur-md">
      {children}
    </div>
  );
}

function Dots({
  count,
  active,
  onSelect,
}: {
  count: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  if (count < 2) return null;
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show trip ${i + 1}`}
          aria-current={i === active}
          className={cx(
            'h-2 rounded-full transition-all duration-300',
            i === active ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/70',
          )}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- desktop */

function DesktopCarousel({ trips }: { trips: Trip[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + trips.length) % trips.length),
    [trips.length],
  );

  useEffect(() => {
    if (paused || reduced || trips.length < 2) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, go, trips.length]);

  const trip = trips[index] ?? trips[0];

  return (
    <div
      className="relative h-[68vh] min-h-[480px] max-h-[720px] overflow-hidden rounded-[28px] border border-white/15 shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Upcoming trips"
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={trip.slug}
          src={imageAt(trip.heroImage, 1600)}
          srcSet={srcSet(trip.heroImage)}
          sizes="(max-width: 1280px) 100vw, 1240px"
          alt=""
          initial={{ opacity: 0, scale: reduced ? 1 : 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.65, 0, 0.35, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative flex h-full items-center justify-center px-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={trip.slug}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-800/50 px-10 py-12 text-center backdrop-blur-md"
          >
            <h3 className="text-balance font-sans text-4xl font-semibold uppercase leading-tight tracking-[0.22em] text-white xl:text-5xl">
              {trip.title}
            </h3>
            <p className="mt-6 text-xl font-medium uppercase tracking-wide text-white xl:text-2xl">
              {tripDates(trip)}
            </p>
            <p className="mt-4 text-xl font-medium text-white xl:text-2xl">{rupees(trip.price)}</p>
            <Link
              to={`/trips/${trip.slug}`}
              className="mt-8 inline-block rounded-full bg-white px-7 py-2.5 text-base font-semibold text-black transition-colors hover:bg-amber-400"
            >
              View Details
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {trips.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous trip"
            className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ChevronLeft size={44} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next trip"
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ChevronRight size={44} strokeWidth={1.5} />
          </button>
          <div className="absolute inset-x-0 bottom-6">
            <Dots count={trips.length} active={index} onSelect={setIndex} />
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- mobile */

/**
 * Swipeable row of cards; the one in the middle is enlarged. Tapping a side card
 * brings it to the middle, tapping the middle card opens the trip.
 */
function MobileCarousel({ trips }: { trips: Trip[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const centre = rail.scrollLeft + rail.clientWidth / 2;
        let best = 0;
        let bestDistance = Infinity;
        Array.from(rail.children).forEach((child, i) => {
          const el = child as HTMLElement;
          const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = i;
          }
        });
        setActive(best);
      });
    };

    measure();
    rail.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [trips.length]);

  const centre = (i: number) => {
    const rail = railRef.current;
    const el = rail?.children[i] as HTMLElement | undefined;
    if (!rail || !el) return;
    rail.scrollTo({ left: el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
  };

  const trip = trips[active] ?? trips[0];
  const open = isEnrollable(trip);

  return (
    <div className="-mx-5">
      <div
        ref={railRef}
        className="no-scrollbar relative flex snap-x snap-mandatory items-center gap-1 overflow-x-auto px-[calc(50%-min(28vw,125px))] py-4"
        role="region"
        aria-roledescription="carousel"
        aria-label="Upcoming trips"
      >
        {trips.map((t, i) => {
          const isActive = i === active;
          return (
            <Link
              key={t.slug}
              to={`/trips/${t.slug}`}
              onClick={(event) => {
                if (!isActive) {
                  event.preventDefault();
                  centre(i);
                }
              }}
              aria-label={isActive ? `${t.title} — view details` : `Show ${t.title}`}
              className={cx(
                'relative aspect-[3/4] w-[min(56vw,250px)] shrink-0 snap-center overflow-hidden rounded-2xl border-2 border-white/85 shadow-xl transition-all duration-500 ease-editorial',
                isActive ? 'scale-100 opacity-100' : 'scale-[0.82] opacity-70',
              )}
            >
              <img
                src={imageAt(t.heroImage, 768)}
                alt=""
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10">
                <span className="block text-sm font-semibold uppercase tracking-wider text-white">
                  {t.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="px-5 pt-2 text-center text-white" aria-live="polite">
        <h3 className="text-2xl font-bold uppercase tracking-[0.14em] [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
          {trip.title}
        </h3>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
          {tripDates(trip)}
        </p>
        <p className="mt-2 text-sm font-medium">Pick-Up Point : {trip.pickupPoint}</p>
        <p className="mt-1 text-sm font-medium">{rupees(trip.price)} per person</p>

        <div className="mt-5 flex justify-center gap-3">
          <Link
            to={`/trips/${trip.slug}`}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            View Details
          </Link>
          {open ? (
            <a
              href={trip.formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black"
            >
              Register here
            </a>
          ) : (
            <span className="rounded-full border border-white/40 px-5 py-2.5 text-sm text-white/70">
              Enrollment closed
            </span>
          )}
        </div>

        <div className="mt-6">
          <Dots count={trips.length} active={active} onSelect={centre} />
        </div>
      </div>
    </div>
  );
}
