import { AnimatePresence, motion } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cx } from '@/components/ui/primitives';

/** One digit pair that slides when its value changes. */
function Unit({ value, label, tone }: { value: number; label: string; tone: 'light' | 'dark' }) {
  const reduced = useReducedMotion();
  const padded = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[1.15em] overflow-hidden font-display text-[clamp(1.5rem,4vw,2rem)] leading-none tabular-nums">
        {reduced ? (
          <span>{padded}</span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={padded}
              initial={{ y: '-100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.34, ease: [0.65, 0, 0.35, 1] }}
              className="block"
            >
              {padded}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <span
        className={cx(
          'mt-2 text-[0.6rem] uppercase tracking-[0.18em]',
          tone === 'dark' ? 'text-paper/55' : 'text-ink-muted',
        )}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * "Enrollment closes in 2d 14h 06m" — renders nothing once the deadline passes,
 * because the closed state is shown by the enroll CTA instead.
 */
export function Countdown({
  deadline,
  tone = 'light',
}: {
  deadline: string;
  tone?: 'light' | 'dark';
}) {
  const time = useCountdown(deadline);

  if (!time || time.expired) return null;

  return (
    <div>
      <p
        className={cx(
          'text-[0.6rem] uppercase tracking-[0.2em]',
          tone === 'dark' ? 'text-paper/55' : 'text-ink-muted',
        )}
      >
        Enrollment closes in
      </p>

      <div
        className={cx(
          'mt-4 flex gap-6 sm:gap-8',
          tone === 'dark' ? 'text-paper' : 'text-ink',
        )}
        role="timer"
        aria-live="off"
      >
        <Unit value={time.days} label="Days" tone={tone} />
        <Unit value={time.hours} label="Hours" tone={tone} />
        <Unit value={time.minutes} label="Mins" tone={tone} />
        <Unit value={time.seconds} label="Secs" tone={tone} />
      </div>
    </div>
  );
}
