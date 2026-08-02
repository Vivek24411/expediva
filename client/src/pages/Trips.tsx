import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/layout/Seo';
import { RevealChild, RevealGroup } from '@/components/motion/Reveal';
import {
  EMPTY_FILTERS,
  FilterBar,
  FilterSheet,
  FilterSheetTrigger,
  activeFilterCount,
  toApiFilters,
  type FilterState,
  type PriceBandId,
} from '@/components/trips/Filters';
import { TripCard, TripCardSkeleton } from '@/components/trips/TripCard';
import { Eyebrow, Notice, cx } from '@/components/ui/primitives';
import { useDebounced } from '@/hooks/useDebounced';
import { api, queryKeys } from '@/lib/api';

type Tab = 'upcoming' | 'past';

export default function Trips() {
  const [params, setParams] = useSearchParams();

  // The tab lives in the URL so a filtered list stays shareable.
  const tab: Tab = params.get('tab') === 'past' ? 'past' : 'upcoming';
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [filters, setFilters] = useState<FilterState>(() => ({
    category: params.get('category') ?? undefined,
    difficulty: params.get('difficulty') ?? undefined,
    month: params.get('month') ? Number(params.get('month')) : undefined,
    priceBand: (params.get('price') as PriceBandId) ?? undefined,
  }));
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedSearch = useDebounced(search, 350);

  const syncUrl = (next: { tab?: Tab; q?: string; state?: FilterState }) => {
    const nextTab = next.tab ?? tab;
    const nextQ = next.q ?? search;
    const nextState = next.state ?? filters;

    const p = new URLSearchParams();
    if (nextTab === 'past') p.set('tab', 'past');
    if (nextQ) p.set('q', nextQ);
    if (nextState.category) p.set('category', nextState.category);
    if (nextState.difficulty) p.set('difficulty', nextState.difficulty);
    if (nextState.month) p.set('month', String(nextState.month));
    if (nextState.priceBand) p.set('price', nextState.priceBand);

    setParams(p, { replace: true });
  };

  const apiFilters = useMemo(
    () => ({
      status: tab,
      search: debouncedSearch || undefined,
      ...toApiFilters(filters),
    }),
    [tab, debouncedSearch, filters],
  );

  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: queryKeys.trips(apiFilters),
    queryFn: () => api.listTrips(apiFilters),
    // Keeps the old list on screen while a filter change is in flight.
    placeholderData: (previous) => previous,
  });

  const trips = data ?? [];
  const filterCount = activeFilterCount(filters);
  const hasQuery = Boolean(debouncedSearch) || filterCount > 0;

  const setTab = (next: Tab) => {
    syncUrl({ tab: next });
  };

  const changeFilters = (next: FilterState) => {
    setFilters(next);
    syncUrl({ state: next });
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    syncUrl({ q: value });
  };

  const clearEverything = () => {
    setSearch('');
    setFilters(EMPTY_FILTERS);
    syncUrl({ q: '', state: EMPTY_FILTERS });
  };

  return (
    <>
      <Seo
        title="All trips"
        description="Every Expediva departure — treks, weekend getaways, adventure trips and long tours, with student pricing and pickup from IIT Roorkee."
      />

      <div className="bg-ivory pb-24 pt-[112px] lg:pb-36 lg:pt-[150px]">
        <div className="shell edge">
          <Eyebrow>The calendar</Eyebrow>
          <h1 className="mt-4 max-w-2xl font-display text-display-md tracking-tight text-ink">
            Every trip, in one place.
          </h1>

          {/* ------------------------------------------------------- tabs */}
          <div className="mt-12 flex gap-8 border-b border-hairline" role="tablist">
            {(['upcoming', 'past'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cx(
                  'relative -mb-px border-b-2 pb-4 text-sm tracking-wide transition-colors duration-300',
                  tab === value
                    ? 'border-ember text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )}
              >
                {value === 'upcoming' ? 'Upcoming' : 'Past trips'}
              </button>
            ))}
          </div>

          {/* ----------------------------------------------- search + filters */}
          <div className="mt-8 flex gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search Kasol, Rishikesh, Manali…"
                aria-label="Search trips by name or destination"
                className="w-full border border-hairline bg-transparent py-3 pl-11 pr-10 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => changeSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
                >
                  <X size={15} strokeWidth={1.6} />
                </button>
              ) : null}
            </div>

            <FilterSheetTrigger state={filters} onOpen={() => setSheetOpen(true)} />
          </div>

          <div className="mt-9">
            <FilterBar state={filters} onChange={changeFilters} />
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-hairline pt-5">
            <p className="text-xs text-ink-muted">
              {isPending ? 'Loading…' : `${trips.length} trip${trips.length === 1 ? '' : 's'}`}
              {isFetching && !isPending ? ' · updating' : ''}
            </p>
          </div>

          {/* ------------------------------------------------------- results */}
          <div className="mt-10">
            {isPending ? (
              <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <Notice
                title="We couldn't load the trips"
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
                title={hasQuery ? 'Nothing matches that' : 'No trips here yet'}
                body={
                  hasQuery
                    ? 'Try widening the price range or clearing a filter — the calendar changes every few weeks.'
                    : tab === 'past'
                      ? 'Once a trip wraps up it moves here with its photos.'
                      : 'The next set of departures is being planned. Instagram gets them first.'
                }
                action={
                  hasQuery ? (
                    <button
                      type="button"
                      onClick={clearEverything}
                      className="bg-ink px-7 py-3.5 text-sm text-paper transition-colors hover:bg-ember"
                    >
                      Clear search and filters
                    </button>
                  ) : null
                }
              />
            ) : (
              <RevealGroup
                // Remounting on filter change replays the stagger for the new set.
                key={`${tab}-${debouncedSearch}-${filterCount}`}
                className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
                stagger={0.06}
              >
                {trips.map((trip, i) => (
                  <RevealChild key={trip._id}>
                    <TripCard trip={trip} index={i} priority={i === 0} />
                  </RevealChild>
                ))}
              </RevealGroup>
            )}
          </div>
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        state={filters}
        onChange={changeFilters}
        resultCount={trips.length}
      />
    </>
  );
}
