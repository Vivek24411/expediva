import { Router } from 'express';
import { deleteImagesByUrl } from '../config/cloudinary';
import { requireAdmin } from '../middleware/auth';
import { TripModel } from '../models/Trip';
import { asyncHandler, notFound } from '../utils/http';
import { slugify, uniqueSlug } from '../utils/slug';
import {
  enrollmentPatchSchema,
  seatsPatchSchema,
  tripBodySchema,
  tripQuerySchema,
} from '../validation/trip';

export const tripsRouter = Router();

/** Escapes user input before it becomes part of a RegExp. */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ------------------------------------------------------------------ public */

/**
 * GET /api/trips
 * Filters: status(upcoming|past), category, difficulty, month, minPrice, maxPrice, search
 */
tripsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = tripQuerySchema.parse(req.query);

    const filter: Record<string, unknown> = {};

    if (q.status === 'past') {
      filter.status = 'completed';
    } else if (q.status === 'upcoming') {
      filter.status = { $ne: 'completed' };
    }

    if (q.category) filter.category = q.category;
    if (q.difficulty) filter.difficulty = q.difficulty;

    if (q.month) {
      // Calendar month of departure, any year.
      filter.$expr = { $eq: [{ $month: '$startDate' }, q.month] };
    }

    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      const price: Record<string, number> = {};
      if (q.minPrice !== undefined) price.$gte = q.minPrice;
      if (q.maxPrice !== undefined) price.$lte = q.maxPrice;
      filter.price = price;
    }

    if (q.search) {
      const rx = new RegExp(escapeRegex(q.search), 'i');
      filter.$or = [{ title: rx }, { destination: rx }];
    }

    // Upcoming reads soonest-first; past reads most-recent-first.
    const sort: Record<string, 1 | -1> = q.status === 'past' ? { startDate: -1 } : { startDate: 1 };

    const trips = await TripModel.find(filter).sort(sort).lean();
    res.json(trips);
  }),
);

/** GET /api/trips/:slug */
tripsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const trip = await TripModel.findOne({ slug: req.params.slug.toLowerCase() }).lean();
    if (!trip) throw notFound('Trip not found');
    res.json(trip);
  }),
);

/* ------------------------------------------------------------------- admin */

/** POST /api/trips */
tripsRouter.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = tripBodySchema.parse(req.body);

    const slug = await uniqueSlug(body.slug || slugify(body.title), async (candidate) =>
      Boolean(await TripModel.exists({ slug: candidate })),
    );

    const trip = await TripModel.create({ ...body, slug });
    res.status(201).json(trip.toObject());
  }),
);

/** PUT /api/trips/:id — full replace */
tripsRouter.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = tripBodySchema.parse(req.body);
    const { id } = req.params;

    const slug = await uniqueSlug(body.slug || slugify(body.title), async (candidate) =>
      Boolean(await TripModel.exists({ slug: candidate, _id: { $ne: id } })),
    );

    const trip = await TripModel.findByIdAndUpdate(
      id,
      { ...body, slug, originalPrice: body.originalPrice ?? undefined },
      { new: true, runValidators: true },
    ).lean();

    if (!trip) throw notFound('Trip not found');
    res.json(trip);
  }),
);

/** PATCH /api/trips/:id/enrollment — toggle */
tripsRouter.patch(
  '/:id/enrollment',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { enrollmentOpen } = enrollmentPatchSchema.parse(req.body);

    const trip = await TripModel.findByIdAndUpdate(
      req.params.id,
      { enrollmentOpen },
      { new: true },
    ).lean();

    if (!trip) throw notFound('Trip not found');
    res.json(trip);
  }),
);

/** PATCH /api/trips/:id/seats — inline seat edit */
tripsRouter.patch(
  '/:id/seats',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { seatsLeft } = seatsPatchSchema.parse(req.body);

    const existing = await TripModel.findById(req.params.id);
    if (!existing) throw notFound('Trip not found');

    existing.seatsLeft = Math.min(seatsLeft, existing.seatsTotal);
    await existing.save();

    res.json(existing.toObject());
  }),
);

/** DELETE /api/trips/:id — also clears the trip's Cloudinary images */
tripsRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const trip = await TripModel.findByIdAndDelete(req.params.id).lean();
    if (!trip) throw notFound('Trip not found');

    await deleteImagesByUrl([trip.heroImage, ...trip.gallery]);

    res.json({ ok: true, id: String(trip._id) });
  }),
);
