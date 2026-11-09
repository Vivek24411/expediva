import { Images } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { formatDateRange } from '@/lib/format';
import { imageAt, srcSet } from '@/lib/image';

/** All photos for a past trip: cover first, then the gallery uploaded in admin. */
export function tripPhotos(trip: Trip): string[] {
  return [trip.heroImage, ...trip.gallery].filter(Boolean);
}

/**
 * One past trip in the gallery: cover photo with the trip's own heading.
 * Clicking it opens that trip's album at /gallery/:slug.
 */
export function PastTripCard({ trip }: { trip: Trip }) {
  const count = tripPhotos(trip).length;

  return (
    <Link
      to={`/gallery/${trip.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/15 bg-black/30 shadow-xl"
      aria-label={`Open photos from ${trip.title}`}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={imageAt(trip.heroImage, 800)}
          srcSet={srcSet(trip.heroImage)}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.05]"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-5 pb-5 pt-16">
        <h3 className="font-display text-2xl leading-tight tracking-tight text-white">{trip.title}</h3>
        <p className="mt-1 text-sm text-white/75">{trip.destination}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-white/70">
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-white">
            <Images size={13} strokeWidth={1.8} />
            {count} photo{count === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PastTripCardSkeleton() {
  return <div className="aspect-[4/3] animate-pulse rounded-2xl bg-white/10" />;
}
