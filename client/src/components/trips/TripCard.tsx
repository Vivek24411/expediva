import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@shared/types';
import { Img, cx } from '@/components/ui/primitives';
import { formatDateRange, formatPrice, ordinal, urgencyFor } from '@/lib/format';
import { sizes } from '@/lib/image';

const TONE_CLASS = {
  critical: 'bg-ember text-paper',
  warm: 'bg-ink text-paper',
  neutral: 'bg-sand text-ink-soft',
} as const;

interface TripCardProps {
  trip: Trip;
  /** Editorial numbering — "01 / Kasol". Omit to hide. */
  index?: number;
  /** The first card above the fold is usually the LCP — let it win the bandwidth race. */
  priority?: boolean;
}

export function TripCard({ trip, index, priority = false }: TripCardProps) {
  const urgency = urgencyFor(trip);

  return (
    <Link to={`/trips/${trip.slug}`} className="group block">
      <article>
        <div className="frame aspect-[4/5]">
          <Img
            src={trip.heroImage}
            alt={trip.title}
            sizes={sizes.card}
            priority={priority}
            baseWidth={768}
            className="h-full w-full object-cover"
          />

          {urgency ? (
            <span
              className={cx(
                'absolute left-4 top-4 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]',
                TONE_CLASS[urgency.tone],
              )}
            >
              {urgency.label}
            </span>
          ) : null}

          {index !== undefined ? (
            <span className="absolute right-4 top-4 font-display text-sm text-paper/80 mix-blend-difference">
              {ordinal(index)}
            </span>
          ) : null}
        </div>

        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">
              {CATEGORY_LABELS[trip.category]} · {DIFFICULTY_LABELS[trip.difficulty]}
            </p>
            <p className="eyebrow shrink-0">{trip.durationDays}D</p>
          </div>

          <h3 className="mt-2.5 font-display text-[1.65rem] leading-[1.08] tracking-tight text-ink">
            <span className="inline-block transition-transform duration-500 ease-editorial group-hover:translate-x-1">
              {trip.title}
            </span>
          </h3>

          <p className="mt-1.5 text-sm text-ink-muted">{trip.destination}</p>

          <hr className="hairline my-4" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>
              <p className="mt-1.5 flex items-baseline gap-2">
                <span className="font-display text-xl text-ink">{formatPrice(trip.price)}</span>
                {trip.originalPrice ? (
                  <span className="text-xs text-ink-muted line-through">
                    {formatPrice(trip.originalPrice)}
                  </span>
                ) : null}
              </p>
            </div>

            <ArrowRight
              size={19}
              strokeWidth={1.4}
              className="mb-1 shrink-0 text-ink transition-transform duration-500 ease-editorial group-hover:translate-x-1.5"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

export function TripCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse bg-sand/70" />
      <div className="space-y-3 pt-5">
        <div className="h-2.5 w-24 animate-pulse bg-sand/70" />
        <div className="h-6 w-3/4 animate-pulse bg-sand/70" />
        <div className="h-3 w-1/2 animate-pulse bg-sand/70" />
        <hr className="hairline my-4" />
        <div className="h-5 w-28 animate-pulse bg-sand/70" />
      </div>
    </div>
  );
}
