/**
 * Canonical Trip types, shared by /client and /server.
 * Keep this file dependency-free — both tsconfigs compile it directly.
 */

export const TRIP_CATEGORIES = ['trek', 'weekend', 'adventure', 'long-tour'] as const;
export type TripCategory = (typeof TRIP_CATEGORIES)[number];

export const TRIP_DIFFICULTIES = ['easy', 'moderate', 'hard'] as const;
export type TripDifficulty = (typeof TRIP_DIFFICULTIES)[number];

export const TRIP_STATUSES = ['upcoming', 'filling-fast', 'sold-out', 'completed'] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Trip {
  _id: string;
  slug: string;
  title: string;
  destination: string;
  category: TripCategory;
  heroImage: string;
  gallery: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  price: number;
  originalPrice?: number;
  seatsTotal: number;
  seatsLeft: number;
  difficulty: TripDifficulty;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  itinerary: ItineraryDay[];
  faqs: Faq[];
  pickupPoint: string;
  formLink: string;
  enrollmentOpen: boolean;
  enrollmentDeadline: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by POST /api/trips and PUT /api/trips/:id */
export type TripInput = Omit<Trip, '_id' | 'createdAt' | 'updatedAt'>;

export const CATEGORY_LABELS: Record<TripCategory, string> = {
  trek: 'Trek',
  weekend: 'Weekend Getaway',
  adventure: 'Adventure',
  'long-tour': 'Long Tour',
};

export const DIFFICULTY_LABELS: Record<TripDifficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

export const STATUS_LABELS: Record<TripStatus, string> = {
  upcoming: 'Upcoming',
  'filling-fast': 'Filling Fast',
  'sold-out': 'Sold Out',
  completed: 'Completed',
};

/** Error shape returned by every failing API route. */
export interface ApiError {
  error: string;
}
