import { Router } from 'express';
import { cloudinaryConfigured } from '../config/env';
import { uploadBuffer } from '../config/cloudinary';
import { requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { HttpError, asyncHandler, badRequest } from '../utils/http';

export const uploadRouter = Router();

/**
 * POST /api/upload
 * Accepts one or many files under the `images` field (also tolerates `image`).
 * Returns { urls: string[] } plus per-image metadata.
 */
uploadRouter.post(
  '/',
  requireAdmin,
  upload.any(),
  asyncHandler(async (req, res) => {
    // Request shape first, server capability second — a malformed request is a
    // 400 whether or not Cloudinary happens to be wired up.
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw badRequest('No images were uploaded');

    if (!cloudinaryConfigured) {
      throw new HttpError(503, 'Image uploads are not configured on this server');
    }

    const images = await Promise.all(files.map((f) => uploadBuffer(f.buffer, f.originalname)));

    res.status(201).json({
      urls: images.map((i) => i.url),
      images,
    });
  }),
);
