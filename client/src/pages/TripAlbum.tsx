import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tripPhotos } from '@/components/gallery/PastTripCard';
import { Lightbox, type LightboxPhoto } from '@/components/gallery/Lightbox';
import { Seo } from '@/components/layout/Seo';
import { Reveal } from '@/components/motion/Reveal';
import { Eyebrow, Notice } from '@/components/ui/primitives';
import { api, queryKeys } from '@/lib/api';
import { formatDateRange } from '@/lib/format';
import { imageAt, sizes, srcSet } from '@/lib/image';

/** One past trip's photos — opened by clicking its card on the gallery. */
export default function TripAlbum() {
  const { slug = '' } = useParams();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { data: trip, isPending, isError, error } = useQuery({
    queryKey: queryKeys.trip(slug),
    queryFn: () => api.getTrip(slug),
    enabled: Boolean(slug),
  });

  const images = useMemo(() => (trip ? tripPhotos(trip) : []), [trip]);
  const photos: LightboxPhoto[] = useMemo(
    () => images.map((src) => ({ src, tripTitle: trip?.title ?? '', destination: trip?.destination ?? '' })),
    [images, trip],
  );

  const back = (
    <Link
      to="/gallery"
      className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
    >
      <ArrowLeft size={15} strokeWidth={1.6} />
      All past trips
    </Link>
  );

  return (
    <>
      <Seo title={trip ? `${trip.title} — Photos` : 'Photos'} image={trip?.heroImage} />

      <section className="pb-24 pt-[110px] lg:pb-32 lg:pt-[140px]">
        <div className="shell edge">
          {back}

          {isPending ? (
            <div className="mt-10 space-y-6">
              <div className="h-12 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="columns-2 gap-4 lg:columns-3">
                {[260, 200, 320, 240, 280, 220].map((h, i) => (
                  <div key={i} className="mb-4 animate-pulse rounded-xl bg-white/10" style={{ height: h }} />
                ))}
              </div>
            </div>
          ) : isError || !trip ? (
            <div className="mt-10">
              <Notice
                title="We couldn't find that album"
                body={error?.message ?? 'It may have been removed.'}
              />
            </div>
          ) : (
            <>
              <header className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-8">
                <div>
                  <Eyebrow>Past trip · {images.length} photo{images.length === 1 ? '' : 's'}</Eyebrow>
                  <h1 className="mt-4 font-display text-display-sm tracking-tight text-ink">{trip.title}</h1>
                  <p className="mt-3 text-sm text-ink-soft">
                    {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>
                <Link
                  to={`/trips/${trip.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  Trip details
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </Link>
              </header>

              {images.length === 0 ? (
                <p className="mt-10 text-sm text-ink-soft">Photos from this trip are on their way.</p>
              ) : (
                <div className="mt-10 columns-2 gap-3 sm:gap-4 lg:columns-3">
                  {images.map((src, i) => (
                    <Reveal key={`${src}-${i}`} delay={Math.min(i, 4) * 0.05}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(i)}
                        className="group mb-3 block w-full overflow-hidden rounded-xl bg-white/5 sm:mb-4"
                        aria-label={`Open photo ${i + 1} of ${images.length}`}
                      >
                        <img
                          src={imageAt(src, 800)}
                          srcSet={srcSet(src)}
                          sizes={sizes.thumb}
                          alt={`${trip.title} — photo ${i + 1}`}
                          loading={i < 6 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                        />
                      </button>
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Lightbox photos={photos} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </>
  );
}
