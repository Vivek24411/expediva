import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cx } from './primitives';

export interface AccordionItem {
  id: string;
  label: ReactNode;
  /** Small left-hand marker, e.g. "Day 01". */
  marker?: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: AccordionItem[];
  /** Index to open on mount — itineraries usually open on day one. */
  defaultOpen?: number;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpen !== undefined ? (items[defaultOpen]?.id ?? null) : null,
  );
  const reduced = useReducedMotion();

  return (
    <div className={cx('border-t border-hairline', className)}>
      {items.map((item) => {
        const open = openId === item.id;

        return (
          <div key={item.id} className="border-b border-hairline">
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                className="group flex w-full items-start gap-5 py-6 text-left"
              >
                {item.marker ? (
                  <span className="eyebrow mt-2 w-14 shrink-0 text-ink-muted">{item.marker}</span>
                ) : null}

                <span className="flex-1 font-display text-lg leading-snug tracking-tight text-ink sm:text-xl">
                  {item.label}
                </span>

                <Plus
                  size={19}
                  strokeWidth={1.4}
                  className={cx(
                    'mt-1 shrink-0 text-ink-soft transition-transform duration-500 ease-editorial',
                    open && 'rotate-45',
                  )}
                />
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="content"
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.65, 0, 0.35, 1] }}
                  className="overflow-hidden"
                >
                  <div className={cx('pb-7 text-sm leading-relaxed text-ink-soft', item.marker && 'sm:pl-[4.75rem]')}>
                    {item.content}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
