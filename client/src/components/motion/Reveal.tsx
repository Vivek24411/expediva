import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE = [0.65, 0, 0.35, 1] as const;

/** Tags a Reveal can render as. Resolved from a static map so the motion
 *  component identity is stable across renders (calling motion() inline
 *  would remount children on every render). */
type Tag = 'div' | 'section' | 'ul' | 'li' | 'header' | 'article';

const MOTION = {
  div: motion.div,
  section: motion.section,
  ul: motion.ul,
  li: motion.li,
  header: motion.header,
  article: motion.article,
} satisfies Record<Tag, unknown>;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds of delay before this element starts. */
  delay?: number;
  as?: Tag;
}

/**
 * Fade + rise on first entry into the viewport. Once only — re-animating on
 * scroll-back reads as a gimmick.
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = MOTION[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}

/** Parent that staggers its <RevealChild> children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  as = 'div',
}: RevealProps & { stagger?: number }) {
  const reduced = useReducedMotion();
  const Component = MOTION[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
    >
      {children}
    </Component>
  );
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function RevealChild({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const reduced = useReducedMotion();
  const Component = MOTION[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component className={className} variants={childVariants}>
      {children}
    </Component>
  );
}

/**
 * Headline reveal: each line rises out of its own clip mask.
 * Pass pre-split lines — splitting on spaces would break long destination names.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={className}>
        {lines.map((line) => (
          <span key={line} className={`block ${lineClassName ?? ''}`}>
            {line}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={`block ${lineClassName ?? ''}`}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.09 }}
          >
            {/* Trailing space keeps the accessible name readable — without it the
                lines concatenate into "The mountainsare three hours". */}
            {line}{' '}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Image that unmasks with a clip-path wipe plus a slow scale settle.
 *
 * The scale lives on an inner element and the outer one clips it — scaling the
 * outer wrapper instead would push a full-bleed child past the viewport and
 * give the whole page a horizontal scrollbar until the animation settled.
 */
export function RevealImage({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={`overflow-hidden ${className ?? ''}`}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      <motion.div
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
