import { z } from 'zod';
import { TRIP_CATEGORIES, TRIP_DIFFICULTIES, TRIP_STATUSES, type Trip } from '@shared/types';

/** Mirrors the server's zod schema so the admin catches mistakes before the round trip. */
export const tripFormSchema = z
  .object({
    title: z.string().trim().min(3, 'At least 3 characters'),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase words separated by hyphens'),
    destination: z.string().trim().min(2, 'Required'),
    category: z.enum(TRIP_CATEGORIES),
    difficulty: z.enum(TRIP_DIFFICULTIES),
    status: z.enum(TRIP_STATUSES),

    heroImage: z.string().trim().url('Add at least one image'),
    gallery: z.array(z.string().url()),

    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
    durationDays: z.number().int().min(1, 'At least 1 day').max(60, 'At most 60 days'),

    price: z.number().int().min(0, 'Cannot be negative'),
    originalPrice: z.number().int().min(0).optional(),

    seatsTotal: z.number().int().min(1, 'At least 1 seat'),
    seatsLeft: z.number().int().min(0, 'Cannot be negative'),

    highlights: z.array(z.string().trim().min(1, 'Remove blank rows')),
    inclusions: z.array(z.string().trim().min(1, 'Remove blank rows')),
    exclusions: z.array(z.string().trim().min(1, 'Remove blank rows')),
    thingsToCarry: z.array(z.string().trim().min(1, 'Remove blank rows')),

    itinerary: z.array(
      z.object({
        day: z.number().int().min(1),
        title: z.string().trim().min(1, 'Every day needs a title'),
        description: z.string().trim().min(1, 'Every day needs a description'),
      }),
    ),

    faqs: z.array(
      z.object({
        q: z.string().trim().min(1, 'Every FAQ needs a question'),
        a: z.string().trim().min(1, 'Every FAQ needs an answer'),
      }),
    ),

    pickupPoint: z.string().trim().min(2, 'Required'),
    formLink: z.string().trim().url('Must be a valid Google Form URL'),

    enrollmentOpen: z.boolean(),
    enrollmentDeadline: z.string().min(1, 'Required'),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'Must be on or after the start date',
    path: ['endDate'],
  })
  .refine((d) => d.seatsLeft <= d.seatsTotal, {
    message: 'Cannot exceed total seats',
    path: ['seatsLeft'],
  })
  .refine((d) => d.originalPrice === undefined || d.originalPrice > d.price, {
    message: 'Must be higher than the current price',
    path: ['originalPrice'],
  });

export type TripFormValues = z.infer<typeof tripFormSchema>;

/** `<input type="date">` needs yyyy-MM-dd; the API returns full ISO strings. */
export function toDateInput(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export const emptyTripForm: TripFormValues = {
  title: '',
  slug: '',
  destination: '',
  category: 'trek',
  difficulty: 'moderate',
  status: 'upcoming',
  heroImage: '',
  gallery: [],
  startDate: '',
  endDate: '',
  durationDays: 3,
  price: 0,
  originalPrice: undefined,
  seatsTotal: 20,
  seatsLeft: 20,
  highlights: [],
  inclusions: [],
  exclusions: [],
  thingsToCarry: [],
  itinerary: [],
  faqs: [],
  pickupPoint: 'IIT Roorkee Main Gate',
  formLink: '',
  enrollmentOpen: true,
  enrollmentDeadline: '',
};

export function tripToForm(trip: Trip): TripFormValues {
  return {
    title: trip.title,
    slug: trip.slug,
    destination: trip.destination,
    category: trip.category,
    difficulty: trip.difficulty,
    status: trip.status,
    heroImage: trip.heroImage,
    gallery: trip.gallery,
    startDate: toDateInput(trip.startDate),
    endDate: toDateInput(trip.endDate),
    durationDays: trip.durationDays,
    price: trip.price,
    originalPrice: trip.originalPrice,
    seatsTotal: trip.seatsTotal,
    seatsLeft: trip.seatsLeft,
    highlights: trip.highlights,
    inclusions: trip.inclusions,
    exclusions: trip.exclusions,
    thingsToCarry: trip.thingsToCarry,
    itinerary: trip.itinerary,
    faqs: trip.faqs,
    pickupPoint: trip.pickupPoint,
    formLink: trip.formLink,
    enrollmentOpen: trip.enrollmentOpen,
    enrollmentDeadline: toDateInput(trip.enrollmentDeadline),
  };
}

/** Matches the server's slugify so previews agree with what gets saved. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
