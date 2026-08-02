import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { RevealLines } from '@/components/motion/Reveal';
import { Img } from '@/components/ui/primitives';
import { site } from '@/config/site';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sizes } from '@/lib/image';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Slow parallax: the image drifts at ~18% of scroll speed.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const scrim = useTransform(scrollYProgress, [0, 1], [0.42, 0.7]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <motion.div className="absolute inset-0 -bottom-[18%]" style={reduced ? undefined : { y }}>
        <Img
          src={HERO_IMAGE}
          alt="A group of students on a Himalayan ridge at first light"
          sizes={sizes.full}
          priority
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Warm scrim keeps the headline legible without flattening the photo. */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-pitch/55 via-pitch/25 to-pitch/80"
        style={reduced ? undefined : { opacity: scrim }}
      />
      <div className="grain absolute inset-0" />

      <div className="relative flex h-full flex-col justify-end pb-14 sm:pb-20">
        <div className="shell edge">
          <motion.p
            className="eyebrow mb-7 text-paper/70"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {site.basedAt} · Est. {site.founded}
          </motion.p>

          <h1 className="font-display text-display-lg font-normal text-paper">
            <RevealLines
              lines={['The mountains', 'are three hours', 'from your hostel.']}
              delay={0.25}
            />
          </h1>

          <motion.div
            className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"
            // Transform-only, no opacity gate: this paragraph is the LCP element, and
            // fading it in from JS delayed LCP by ~3.6s under mobile CPU throttling.
            // It now paints at FCP and merely slides the last few pixels into place.
            initial={reduced ? false : { y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.65, 0, 0.35, 1] }}
          >
            <p className="max-w-sm text-[0.95rem] leading-relaxed text-paper/75">
              Treks, weekend escapes and long tours planned by students, for students. Pickup at{' '}
              {site.defaultPickup} — everything after that is handled.
            </p>

            <Link
              to="/trips"
              className="group inline-flex shrink-0 items-center gap-3 self-start bg-paper px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-ember hover:text-paper sm:self-auto"
            >
              Explore Trips
              <ArrowDown
                size={16}
                strokeWidth={1.6}
                className="transition-transform duration-500 ease-editorial group-hover:translate-y-1"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
