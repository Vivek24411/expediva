import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Eyebrow } from '@/components/ui/primitives';
import { testimonials } from '@/config/testimonials';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { imageAt } from '@/lib/image';
import { ordinal } from '@/lib/format';

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();

  const current = testimonials[index];
  if (!current) return null;

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);
  };

  return (
    <section className="bg-ivory py-24 lg:py-36">
      <div className="shell edge">
        <Eyebrow>In their words</Eyebrow>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-h-[19rem] sm:min-h-[17rem]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.blockquote
                key={current.name}
                custom={direction}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
              >
                <p className="max-w-3xl font-display text-[clamp(1.4rem,3.2vw,2.15rem)] leading-[1.28] tracking-tight text-ink">
                  &ldquo;{current.quote}&rdquo;
                </p>

                <footer className="mt-9 flex items-center gap-4">
                  <img
                    src={imageAt(current.photo, 96)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <cite className="block text-sm font-medium not-italic text-ink">
                      {current.name}
                    </cite>
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {current.college} · {current.trip}
                    </span>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 lg:flex-col lg:items-end">
            <p className="font-display text-sm text-ink-muted">
              {ordinal(index)} <span className="text-hairline">/</span>{' '}
              {ordinal(testimonials.length - 1)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center border border-hairline text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <ArrowLeft size={17} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center border border-hairline text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <ArrowRight size={17} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
