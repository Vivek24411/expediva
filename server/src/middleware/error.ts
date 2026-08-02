import type { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { isProd } from '../config/env';
import { HttpError } from '../utils/http';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

/**
 * Single funnel for every error. Always responds with `{ error: string }`.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const first = err.issues[0];
    const path = first.path.join('.');
    res.status(400).json({ error: path ? `${path}: ${first.message}` : first.message });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ error: `Invalid ${err.path}` });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const first = Object.values(err.errors)[0];
    res.status(400).json({ error: first?.message ?? 'Validation failed' });
    return;
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    res.status(409).json({ error: `A trip with that ${field} already exists` });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large (max 8MB)'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'Too many files (max 12 per upload)'
          : err.message;
    res.status(400).json({ error: message });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    error: isProd ? 'Something went wrong' : ((err as Error)?.message ?? 'Something went wrong'),
  });
}
