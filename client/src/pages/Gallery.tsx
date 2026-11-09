import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PastTripCard, PastTripCardSkeleton, tripPhotos } from '@/components/gallery/PastTripCard';
import { Seo } from '@/components/layout/Seo';
import { RevealChild, RevealGroup } from '@/components/motion/Reveal';
import { Eyebrow, Notice } from '@/components/ui/primitives';
import { api, queryKeys } from '@/lib/api';

/**
 * Gallery = past trips. Each completed trip gets its own card with its heading;
 * clicking one opens that trip's photos (TripAlbum, /gallery/:slug).
 * Photos come from the admin panel: mark a trip "completed" and upload its gallery.
 */
export default function Gallery() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.trips({ status: 'past' }),
    queryFn: () => api.listTrips({ status: 'past' }),
  });

  const trips = (data ?? []).filter((trip) => tripPhotos(trip).length > 0);

  return (
    <>
      <Seo
        title="Past Trips"
        description="Photographs from every Expediva trip that has already happened — the campsites, the summits, and the people who came along."
        image={trips[0]?.heroImage}
      />

      <section className="pb-24 pt-[128px] lg:pb-32 lg:pt-[160px]">
        <div className="shell edge">
          <Eyebrow>Gallery</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-display-md tracking-tight text-ink">
            Past trips.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-soft">
            Every trip we&apos;ve run, in photos taken by the students who were on it. Pick a trip to
            see its album.
          </p>

          <div className="mt-14">
            {isPending ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PastTripCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <Notice
                title="We couldn't load past trips"
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
                  <Link to="/#trips" className="bg-ink px-7 py-3.5 text-sm text-paper hover:bg-ember">
                    See what&apos;s coming up
                  </Link>
                }
              />
            ) : (
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <RevealChild key={trip._id}>
                    <PastTripCard trip={trip} />
                  </RevealChild>
                ))}
              </RevealGroup>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
