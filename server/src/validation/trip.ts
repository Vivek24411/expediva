import { z } from 'zod';
import { TRIP_CATEGORIES, TRIP_DIFFICULTIES, TRIP_STATUSES } from '../../../shared/types';

const isoDate = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), 'must be a valid date');

const nonEmptyStrings = z.array(z.string().trim().min(1, 'cannot be blank')).default([]);

/** `z.coerce.boolean()` treats the string "false" as true — this doesn't. */
const boolish = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((v) => v === 'true'),
]);

export const tripBodySchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase words separated by hyphens')
      .optional(),
    title: z.string().trim().min(3, 'must be at least 3 characters').max(120),
    destination: z.string().trim().min(2).max(120),
    category: z.enum(TRIP_CATEGORIES),

    heroImage: z.string().trim().url('must be a valid URL'),
    gallery: z.array(z.string().trim().url('must be a valid URL')).default([]),

    startDate: isoDate,
    endDate: isoDate,
    durationDays: z.coerce.number().int().min(1).max(60),

    price: z.coerce.number().int().min(0),
    originalPrice: z.coerce.number().int().min(0).optional(),

    seatsTotal: z.coerce.number().int().min(1).max(500),
    seatsLeft: z.coerce.number().int().min(0).max(500),

    difficulty: z.enum(TRIP_DIFFICULTIES),

    highlights: nonEmptyStrings,
    inclusions: nonEmptyStrings,
    exclusions: nonEmptyStrings,
    thingsToCarry: nonEmptyStrings,

    itinerary: z
      .array(
        z.object({
          day: z.coerce.number().int().min(1),
          title: z.string().trim().min(1, 'cannot be blank'),
          description: z.string().trim().min(1, 'cannot be blank'),
        }),
      )
      .default([]),

    faqs: z
      .array(
        z.object({
          q: z.string().trim().min(1, 'cannot be blank'),
          a: z.string().trim().min(1, 'cannot be blank'),
        }),
      )
      .default([]),

    pickupPoint: z.string().trim().min(2).max(160),
    formLink: z.string().trim().url('must be a valid Google Form URL'),

    enrollmentOpen: boolish.default(true),
    enrollmentDeadline: isoDate,

    status: z.enum(TRIP_STATUSES).default('upcoming'),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'must be on or after the start date',
    path: ['endDate'],
  })
  .refine((d) => d.seatsLeft <= d.seatsTotal, {
    message: 'cannot exceed total seats',
    path: ['seatsLeft'],
  })
  .refine((d) => d.originalPrice === undefined || d.originalPrice > d.price, {
    message: 'must be higher than the current price',
    path: ['originalPrice'],
  });

export type TripBody = z.infer<typeof tripBodySchema>;

export const enrollmentPatchSchema = z.object({
  enrollmentOpen: boolish,
});

export const seatsPatchSchema = z.object({
  seatsLeft: z.coerce.number().int().min(0).max(500),
});

export const tripQuerySchema = z.object({
  status: z.enum(['upcoming', 'past']).optional(),
  category: z.enum(TRIP_CATEGORIES).optional(),
  difficulty: z.enum(TRIP_DIFFICULTIES).optional(),
  /** 1-12, matches the calendar month of startDate. */
  month: z.coerce.number().int().min(1).max(12).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  search: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email address'),
  password: z.string().min(1, 'is required'),
});
