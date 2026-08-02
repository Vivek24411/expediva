import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Img, cx } from '@/components/ui/primitives';
import { sizes } from '@/lib/image';

/**
 * Horizontal snap-scroll gallery. Native scrolling handles the swipe, so it
 * stays smooth on phones; the arrows are a desktop affordance.
 */
export function SwipeGallery({ images, title }: { images: string[]; title: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const rail = railRef.current;
    if (!rail) return;

    const clamped = Math.max(0, Math.min(i, images.length - 1));
    const child = rail.children[clamped] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [images.length]);

  // Track the active slide from scroll position rather than driving it.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onScroll = () => {
      const width = rail.clientWidth;
      if (width === 0) return;
      setIndex(Math.round(rail.scrollLeft / width));
    };

    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => rail.removeEventListener('scroll', onScroll);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        role="region"
        aria-label={`Photos from ${title}`}
      >
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="w-full shrink-0 snap-start">
            <div className="aspect-[4/3] w-full sm:aspect-[16/9]">
              <Img
                src={src}
                alt={`${title} — photo ${i + 1} of ${images.length}`}
                sizes={sizes.full}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <div className="mt-5 flex items-center justify-between gap-6">
            <div className="flex gap-1.5" role="tablist" aria-label="Gallery position">
              {images.map((src, i) => (
                <button
                  key={`dot-${src}-${i}`}
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  aria-selected={i === index}
                  role="tab"
                  className={cx(
                    'h-0.5 w-8 transition-colors duration-300',
                    i === index ? 'bg-ink' : 'bg-hairline',
                  )}
                />
              ))}
            </div>

            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous photo"
                className="flex h-10 w-10 items-center justify-center border border-hairline text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollTo(index + 1)}
                disabled={index === images.length - 1}
                aria-label="Next photo"
                className="flex h-10 w-10 items-center justify-center border border-hairline text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
