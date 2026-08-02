import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbox, type LightboxPhoto } from '@/components/gallery/Lightbox';
import { Seo } from '@/components/layout/Seo';
import { Reveal } from '@/components/motion/Reveal';
import { Eyebrow, Notice } from '@/components/ui/primitives';
import { api, queryKeys } from '@/lib/api';
import { formatDate, ordinal } from '@/lib/format';
import { imageAt, srcSet, sizes } from '@/lib/image';

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.trips({ status: 'past' }),
    queryFn: () => api.listTrips({ status: 'past' }),
  });

  const trips = useMemo(
    () => (data ?? []).filter((trip) => [trip.heroImage, ...trip.gallery].length > 0),
    [data],
  );

  /** One flat list backs the lightbox; `offset` maps a trip's photo to its index. */
  const { photos, offsets } = useMemo(() => {
    const flat: LightboxPhoto[] = [];
    const starts: number[] = [];

    for (const trip of trips) {
      starts.push(flat.length);
      for (const src of [trip.heroImage, ...trip.gallery]) {
        flat.push({ src, tripTitle: trip.title, destination: trip.destination });
      }
    }

    return { photos: flat, offsets: starts };
  }, [trips]);

  return (
    <>
      <Seo
        title="Gallery"
        description="Photographs from every Expediva trip that has already happened — the campsites, the summits, and the people who came along."
        image={photos[0]?.src}
      />

      {/* ------------------------------------------------------------ intro */}
      <section className="bg-pitch pb-24 pt-[128px] text-paper lg:pb-32 lg:pt-[168px]">
        <div className="shell edge">
          <Eyebrow className="text-paper/55">The proof</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-display-md tracking-tight">
            Everything below already happened.
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-paper/55">
            No stock photography, no renders. These are photographs from trips that ran, taken by the
            students who were on them.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- grids */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell edge">
          {isPending ? (
            <GallerySkeleton />
          ) : isError ? (
            <Notice
              title="We couldn't load the gallery"
              body={error.message}
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="bg-ink px-7 py-3.5 text-sm text-paper transition-colors hover:bg-ember"
                >
                  Try again
                </button>
              }
            />
          ) : trips.length === 0 ? (
            <Notice
              title="No past trips yet"
              body="Once the first departure wraps up, its photographs land here."
              action={
                <Link to="/trips" className="bg-ink px-7 py-3.5 text-sm text-paper hover:bg-ember">
                  See what's coming up
                </Link>
              }
            />
          ) : (
            <div className="space-y-28 lg:space-y-36">
              {trips.map((trip, tripIndex) => {
                const images = [trip.heroImage, ...trip.gallery];
                const base = offsets[tripIndex];

                return (
                  <article key={trip._id}>
                    <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-hairline pb-6">
                      <div className="flex items-baseline gap-5">
                        <span className="font-display text-sm text-ember">{ordinal(tripIndex)}</span>
                        <div>
                          <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-tight tracking-tight text-ink">
                            {trip.title}
                          </h2>
                          <p className="mt-1.5 text-sm text-ink-muted">{trip.destination}</p>
                        </div>
                      </div>

                      <p className="text-xs text-ink-muted">
                        {formatDate(trip.startDate)} · {images.length} photo
                        {images.length === 1 ? '' : 's'}
                      </p>
                    </header>

                    {/* Asymmetric masonry — CSS columns keep the rhythm irregular. */}
                    <div className="mt-8 columns-2 gap-3 sm:gap-4 lg:columns-3">
                      {images.map((src, i) => (
                        <Reveal key={`${src}-${i}`} delay={Math.min(i, 4) * 0.05}>
                          <button
                            type="button"
                            onClick={() => setOpenIndex(base + i)}
                            className="group mb-3 block w-full overflow-hidden bg-sand sm:mb-4"
                            aria-label={`Open photo ${i + 1} from ${trip.title}`}
                          >
                            <img
                              src={imageAt(src, 800)}
                              srcSet={srcSet(src)}
                              sizes={sizes.thumb}
                              alt={`${trip.title} — ${trip.destination}`}
                              loading="lazy"
                              decoding="async"
                              className="w-full transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                            />
                          </button>
                        </Reveal>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Lightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}

function GallerySkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-8 w-64 animate-pulse bg-sand" />
      <div className="columns-2 gap-4 lg:columns-3">
        {[280, 200, 340, 240, 300, 220].map((h, i) => (
          <div
            key={i}
            className="mb-4 w-full animate-pulse bg-sand"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}
