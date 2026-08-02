import type { Trip } from '@shared/types';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number): string => inr.format(value);

const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const dayMonthYear = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "12 – 15 Mar 2026", collapsing the month when both dates share one. */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const s = new Date(start);
  const e = new Date(end);

  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';

  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  return sameMonth
    ? `${s.getDate()} – ${dayMonthYear.format(e)}`
    : `${dayMonth.format(s)} – ${dayMonthYear.format(e)}`;
}

export const formatDate = (value: string | Date): string => dayMonthYear.format(new Date(value));

/** Zero-padded index for editorial numbering: "01 / Kasol". */
export const ordinal = (index: number): string => String(index + 1).padStart(2, '0');

export interface Urgency {
  label: string;
  tone: 'critical' | 'warm' | 'neutral';
}

/**
 * The badge shown on cards and the trip hero. Seat count wins over status
 * because "Only 3 seats left" is more useful than "Filling fast".
 */
export function urgencyFor(trip: Trip): Urgency | null {
  if (trip.status === 'completed') return { label: 'Completed', tone: 'neutral' };
  if (trip.status === 'sold-out' || trip.seatsLeft === 0) return { label: 'Sold out', tone: 'neutral' };

  if (trip.seatsLeft <= 5) {
    return { label: `Only ${trip.seatsLeft} seat${trip.seatsLeft === 1 ? '' : 's'} left`, tone: 'critical' };
  }

  if (trip.status === 'filling-fast' || trip.seatsLeft / trip.seatsTotal <= 0.4) {
    return { label: 'Filling fast', tone: 'warm' };
  }

  return null;
}

/** True when a student can still enroll: admin toggle on, deadline ahead, seats left. */
export function isEnrollable(trip: Trip): boolean {
  return (
    trip.enrollmentOpen &&
    trip.status !== 'completed' &&
    trip.seatsLeft > 0 &&
    new Date(trip.enrollmentDeadline).getTime() > Date.now()
  );
}

/** Why enrollment is closed — shown on the disabled CTA. */
export function closedReason(trip: Trip): string {
  if (trip.status === 'completed') return 'This trip has already happened';
  if (trip.seatsLeft === 0 || trip.status === 'sold-out') return 'Every seat is taken';
  if (new Date(trip.enrollmentDeadline).getTime() <= Date.now()) return 'Enrollment has closed';
  return 'Enrollment is closed for now';
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
