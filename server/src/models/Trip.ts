import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { TRIP_CATEGORIES, TRIP_DIFFICULTIES, TRIP_STATUSES } from '../../../shared/types';

const itinerarySchema = new Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    q: { type: String, required: true, trim: true },
    a: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const tripSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: TRIP_CATEGORIES },

    heroImage: { type: String, required: true, trim: true },
    gallery: { type: [String], default: [] },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number, required: true, min: 1 },

    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },

    seatsTotal: { type: Number, required: true, min: 1 },
    seatsLeft: { type: Number, required: true, min: 0 },

    difficulty: { type: String, required: true, enum: TRIP_DIFFICULTIES },

    highlights: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    thingsToCarry: { type: [String], default: [] },

    itinerary: { type: [itinerarySchema], default: [] },
    faqs: { type: [faqSchema], default: [] },

    pickupPoint: { type: String, required: true, trim: true },
    formLink: { type: String, required: true, trim: true },

    enrollmentOpen: { type: Boolean, default: true },
    enrollmentDeadline: { type: Date, required: true },

    status: { type: String, required: true, enum: TRIP_STATUSES, default: 'upcoming', index: true },
  },
  { timestamps: true },
);

// Listing queries always sort by departure; filters narrow by category/price.
tripSchema.index({ startDate: 1, status: 1 });
tripSchema.index({ category: 1, difficulty: 1, price: 1 });

export type TripDoc = HydratedDocument<InferSchemaType<typeof tripSchema>>;

export const TripModel = model('Trip', tripSchema);
