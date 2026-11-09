import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const BACKDROP_IMAGE = '/cover-bg.png';

/**
 * One fixed mountain photo behind every public page, so the whole site reads as a
 * single continuous scene. A light, see-through scrim keeps text readable: on the
 * homepage it starts almost clear behind the hero and deepens a little as you scroll.
 */
export function SiteBackdrop() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const homeScrim = useTransform(scrollY, [0, 700], [0.1, 0.38]);

  const isHome = pathname === '/';
  const opacity = isHome && !reduced ? homeScrim : isHome ? 0.3 : 0.42;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-pitch">
      <img
        src={BACKDROP_IMAGE}
        alt=""
        decoding="async"
        className="h-full w-full scale-105 object-cover blur-[2px]"
      />
      <motion.div className="absolute inset-0 bg-black" style={{ opacity }} />
    </div>
  );
}
