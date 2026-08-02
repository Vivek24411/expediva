import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { imageAt } from '@/lib/image';

/**
 * Infinite photo rail from past trips. The list is rendered twice so the
 * -50% keyframe loops seamlessly; the duplicate is hidden from screen readers.
 */
export function Marquee({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  // Repeat short galleries so the rail is always wider than the viewport.
  const base = images.length >= 6 ? images : [...images, ...images, ...images].slice(0, 8);

  return (
    <section className="overflow-hidden bg-pitch py-20 lg:py-28">
      <div className="shell edge mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-paper/55">Where we&apos;ve been</p>
          <h2 className="mt-4 font-display text-display-sm tracking-tight text-paper">
            Nine hundred students. Forty departures.
          </h2>
        </div>

        <Link
          to="/gallery"
          className="group hidden shrink-0 items-center gap-2 text-sm text-paper/70 transition-colors hover:text-paper sm:inline-flex"
        >
          See the gallery
          <ArrowUpRight
            size={15}
            strokeWidth={1.5}
            className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      <div className="group relative flex w-max animate-marquee gap-4 pause-on-hover will-change-transform">
        {[0, 1].map((pass) => (
          <div key={pass} className="flex gap-4" aria-hidden={pass === 1}>
            {base.map((src, i) => (
              <Link
                key={`${pass}-${src}-${i}`}
                to="/gallery"
                tabIndex={pass === 1 ? -1 : undefined}
                className="relative block h-[260px] w-[190px] shrink-0 overflow-hidden sm:h-[320px] sm:w-[240px]"
              >
                <img
                  src={imageAt(src, 480)}
                  alt={pass === 0 ? 'A moment from a past Expediva trip' : ''}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-editorial hover:scale-[1.04]"
                />
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="shell edge mt-12 sm:hidden">
        <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-paper/70">
          See the gallery
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}

/** Non-animated variant used while the past-trip photos are still loading. */
export function MarqueeSkeleton() {
  return (
    <section className="overflow-hidden bg-pitch py-20 lg:py-28">
      <div className="shell edge mb-12">
        <div className="h-2.5 w-32 animate-pulse bg-paper/10" />
        <div className="mt-5 h-10 w-2/3 max-w-lg animate-pulse bg-paper/10" />
      </div>
      <div className="flex gap-4 pl-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] w-[190px] shrink-0 animate-pulse bg-paper/10 sm:h-[320px] sm:w-[240px]"
          />
        ))}
      </div>
    </section>
  );
}
