import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '@shared/types';
import { cx } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api, queryKeys } from '@/lib/api';
import { formatDateRange, formatPrice } from '@/lib/format';

const ALL_TRIPS_KEY = queryKeys.trips({});

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<Trip | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ALL_TRIPS_KEY,
    queryFn: () => api.listTrips({}),
  });

  /** Every mutation invalidates all trip queries so public pages pick up changes. */
  const invalidateTrips = () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['trip'] });
  };

  const toggleEnrollment = useMutation({
    mutationFn: ({ id, open }: { id: string; open: boolean }) => api.setEnrollment(id, open),

    // Optimistic: the switch flips instantly, rolls back if the request fails.
    onMutate: async ({ id, open }) => {
      await queryClient.cancelQueries({ queryKey: ALL_TRIPS_KEY });
      const previous = queryClient.getQueryData<Trip[]>(ALL_TRIPS_KEY);

      queryClient.setQueryData<Trip[]>(ALL_TRIPS_KEY, (list) =>
        list?.map((t) => (t._id === id ? { ...t, enrollmentOpen: open } : t)),
      );

      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(ALL_TRIPS_KEY, context.previous);
      toast.error(err.message);
    },
    onSuccess: (trip) => {
      toast.success(`Enrollment ${trip.enrollmentOpen ? 'opened' : 'closed'} for ${trip.title}`);
    },
    onSettled: invalidateTrips,
  });

  const updateSeats = useMutation({
    mutationFn: ({ id, seats }: { id: string; seats: number }) => api.setSeats(id, seats),
    onSuccess: (trip) => toast.success(`${trip.title} — ${trip.seatsLeft} seats left`),
    onError: (err: Error) => toast.error(err.message),
    onSettled: invalidateTrips,
  });

  const deleteTrip = useMutation({
    mutationFn: (id: string) => api.deleteTrip(id),
    onSuccess: () => {
      toast.success('Trip deleted.');
      setPendingDelete(null);
    },
    onError: (err: Error) => toast.error(err.message),
    onSettled: invalidateTrips,
  });

  const trips = data ?? [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Trips</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isPending ? 'Loading…' : `${trips.length} trip${trips.length === 1 ? '' : 's'} total`}
          </p>
        </div>

        <Link
          to="/admin/trips/new"
          className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-ember"
        >
          <Plus size={16} strokeWidth={1.8} />
          New trip
        </Link>
      </div>

      <div className="mt-10">
        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-sand/70" />
            ))}
          </div>
        ) : isError ? (
          <div className="border border-hairline bg-paper p-10 text-center">
            <p className="text-sm text-ink-soft">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 bg-ink px-6 py-3 text-sm text-paper hover:bg-ember"
            >
              Try again
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="border border-hairline bg-paper p-14 text-center">
            <p className="font-display text-xl text-ink">No trips yet</p>
            <p className="mt-2 text-sm text-ink-soft">
              Create the first one, or run <code className="text-ember">npm run seed</code> in /server.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-hairline bg-paper">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  {['Trip', 'Dates', 'Status', 'Enrollment', 'Seats left', ''].map((h) => (
                    <th key={h} className="px-4 py-4 text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {trips.map((trip) => (
                  <tr key={trip._id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-4">
                      <Link
                        to={`/trips/${trip.slug}`}
                        target="_blank"
                        className="font-medium text-ink hover:text-ember"
                      >
                        {trip.title}
                      </Link>
                      <p className="mt-1 text-xs text-ink-muted">
                        {CATEGORY_LABELS[trip.category]} · {formatPrice(trip.price)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-ink-soft">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={cx(
                          'whitespace-nowrap px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.12em]',
                          trip.status === 'sold-out' || trip.status === 'completed'
                            ? 'bg-sand text-ink-soft'
                            : trip.status === 'filling-fast'
                              ? 'bg-ember text-paper'
                              : 'bg-ink text-paper',
                        )}
                      >
                        {STATUS_LABELS[trip.status]}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <EnrollmentToggle
                        open={trip.enrollmentOpen}
                        busy={
                          toggleEnrollment.isPending && toggleEnrollment.variables?.id === trip._id
                        }
                        onChange={(open) => toggleEnrollment.mutate({ id: trip._id, open })}
                        label={`Enrollment for ${trip.title}`}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <SeatsEditor
                        trip={trip}
                        onCommit={(seats) => updateSeats.mutate({ id: trip._id, seats })}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/admin/trips/${trip._id}/edit`}
                          aria-label={`Edit ${trip.title}`}
                          className="flex h-9 w-9 items-center justify-center border border-hairline text-ink-soft transition-colors hover:border-ink hover:text-ink"
                        >
                          <Pencil size={14} strokeWidth={1.6} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(trip)}
                          aria-label={`Delete ${trip.title}`}
                          className="flex h-9 w-9 items-center justify-center border border-hairline text-ink-soft transition-colors hover:border-ember hover:text-ember"
                        >
                          <Trash2 size={14} strokeWidth={1.6} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingDelete ? (
        <DeleteDialog
          trip={pendingDelete}
          busy={deleteTrip.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteTrip.mutate(pendingDelete._id)}
        />
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ pieces */

function EnrollmentToggle({
  open,
  busy,
  onChange,
  label,
}: {
  open: boolean;
  busy: boolean;
  onChange: (open: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={open}
      aria-label={label}
      disabled={busy}
      onClick={() => onChange(!open)}
      className={cx(
        'relative h-6 w-11 shrink-0 transition-colors duration-300 disabled:opacity-50',
        open ? 'bg-moss' : 'bg-sand',
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 h-5 w-5 bg-paper shadow-sm transition-transform duration-300 ease-editorial',
          open ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

function SeatsEditor({ trip, onCommit }: { trip: Trip; onCommit: (seats: number) => void }) {
  const [value, setValue] = useState(String(trip.seatsLeft));

  // Only fire a request when the number actually changed.
  const commit = () => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setValue(String(trip.seatsLeft));
      return;
    }

    const clamped = Math.min(Math.round(parsed), trip.seatsTotal);
    setValue(String(clamped));
    if (clamped !== trip.seatsLeft) onCommit(clamped);
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={trip.seatsTotal}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') setValue(String(trip.seatsLeft));
        }}
        aria-label={`Seats left for ${trip.title}`}
        className="w-16 border border-hairline bg-transparent px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
      />
      <span className="text-xs text-ink-muted">/ {trip.seatsTotal}</span>
    </div>
  );
}

function DeleteDialog({
  trip,
  busy,
  onCancel,
  onConfirm,
}: {
  trip: Trip;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const imageCount = 1 + trip.gallery.length;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-pitch/50 px-5">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="w-full max-w-md border border-hairline bg-paper p-8"
      >
        <AlertTriangle size={22} strokeWidth={1.5} className="text-ember" />

        <h2 id="delete-title" className="mt-5 font-display text-2xl tracking-tight text-ink">
          Delete “{trip.title}”?
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          This removes the trip permanently. Its {imageCount} image
          {imageCount === 1 ? '' : 's'} will also be deleted from Cloudinary and cannot be recovered.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 border border-hairline py-3.5 text-sm text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 bg-ember py-3.5 text-sm font-medium text-paper transition-colors hover:bg-ember-deep disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
