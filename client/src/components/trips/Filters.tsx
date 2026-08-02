import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect } from 'react';
import { TRIP_CATEGORIES, TRIP_DIFFICULTIES, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@shared/types';
import { cx } from '@/components/ui/primitives';
import { MONTHS } from '@/lib/format';
import type { TripFilters } from '@/lib/api';

export const PRICE_BANDS = [
  { id: 'under-4000', label: 'Under ₹4,000', maxPrice: 4000 },
  { id: '4000-6000', label: '₹4,000 – ₹6,000', minPrice: 4000, maxPrice: 6000 },
  { id: '6000-8000', label: '₹6,000 – ₹8,000', minPrice: 6000, maxPrice: 8000 },
  { id: 'over-8000', label: 'Over ₹8,000', minPrice: 8000 },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]['id'];

export interface FilterState {
  category?: string;
  difficulty?: string;
  month?: number;
  priceBand?: PriceBandId;
}

export const EMPTY_FILTERS: FilterState = {};

/** Turns the UI state into the query params the API expects. */
export function toApiFilters(state: FilterState): Omit<TripFilters, 'status' | 'search'> {
  const band = PRICE_BANDS.find((b) => b.id === state.priceBand);

  return {
    category: state.category,
    difficulty: state.difficulty,
    month: state.month,
    minPrice: band && 'minPrice' in band ? band.minPrice : undefined,
    maxPrice: band && 'maxPrice' in band ? band.maxPrice : undefined,
  };
}

export function activeFilterCount(state: FilterState): number {
  return [state.category, state.difficulty, state.month, state.priceBand].filter(
    (v) => v !== undefined,
  ).length;
}

/* ------------------------------------------------------------------ pills */

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'whitespace-nowrap border px-4 py-2 text-xs tracking-wide transition-colors duration-300',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-hairline bg-transparent text-ink-soft hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

interface GroupsProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  /** Stacked layout for the mobile sheet, inline rail on desktop. */
  layout: 'rail' | 'stack';
}

function FilterGroups({ state, onChange, layout }: GroupsProps) {
  const toggle = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...state, [key]: state[key] === value ? undefined : value });
  };

  const groups = [
    {
      label: 'Type',
      options: TRIP_CATEGORIES.map((c) => ({
        key: c,
        label: CATEGORY_LABELS[c],
        active: state.category === c,
        select: () => toggle('category', c),
      })),
    },
    {
      label: 'Difficulty',
      options: TRIP_DIFFICULTIES.map((d) => ({
        key: d,
        label: DIFFICULTY_LABELS[d],
        active: state.difficulty === d,
        select: () => toggle('difficulty', d),
      })),
    },
    {
      label: 'Price',
      options: PRICE_BANDS.map((b) => ({
        key: b.id,
        label: b.label,
        active: state.priceBand === b.id,
        select: () => toggle('priceBand', b.id),
      })),
    },
    {
      label: 'Month',
      options: MONTHS.map((m, i) => ({
        key: m,
        label: layout === 'rail' ? m.slice(0, 3) : m,
        active: state.month === i + 1,
        select: () => toggle('month', i + 1),
      })),
    },
  ];

  return (
    <div className={cx(layout === 'stack' ? 'space-y-8' : 'space-y-4')}>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="eyebrow mb-3">{group.label}</p>
          <div
            className={cx(
              'flex gap-2',
              layout === 'stack' ? 'flex-wrap' : 'no-scrollbar overflow-x-auto pb-1',
            )}
          >
            {group.options.map((opt) => (
              <Pill key={opt.key} active={opt.active} onClick={opt.select}>
                {opt.label}
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- desktop pill bar */

export function FilterBar({ state, onChange }: Omit<GroupsProps, 'layout'>) {
  const count = activeFilterCount(state);

  return (
    <div className="hidden lg:block">
      <FilterGroups state={state} onChange={onChange} layout="rail" />

      {count > 0 ? (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-muted underline underline-offset-4 hover:text-ember"
        >
          <X size={13} strokeWidth={1.6} />
          Clear {count} filter{count === 1 ? '' : 's'}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------ mobile bottom sheet */

export function FilterSheetTrigger({
  state,
  onOpen,
}: {
  state: FilterState;
  onOpen: () => void;
}) {
  const count = activeFilterCount(state);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex shrink-0 items-center gap-2 border border-hairline px-5 py-3 text-sm text-ink transition-colors hover:border-ink lg:hidden"
    >
      <SlidersHorizontal size={15} strokeWidth={1.5} />
      Filters
      {count > 0 ? (
        <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center bg-ember px-1.5 text-[0.65rem] text-paper">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function FilterSheet({
  open,
  onClose,
  state,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  state: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
}) {
  // The sheet owns the scroll while it's up.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const count = activeFilterCount(state);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-pitch/45 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filter trips"
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[86svh] overflow-y-auto bg-ivory lg:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-ivory px-5 py-4">
              <p className="font-display text-xl tracking-tight text-ink">Filters</p>
              <button type="button" onClick={onClose} aria-label="Close filters" className="p-1.5 text-ink">
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>

            <div className="px-5 py-7">
              <FilterGroups state={state} onChange={onChange} layout="stack" />
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-hairline bg-ivory px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTERS)}
                disabled={count === 0}
                className="flex-1 border border-hairline py-3.5 text-sm text-ink-soft disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-[1.6] bg-ink py-3.5 text-sm text-paper"
              >
                Show {resultCount} trip{resultCount === 1 ? '' : 's'}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
