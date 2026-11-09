import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { cloudinaryConfigured, isProd } from '../config/env';
import { uploadBuffer } from '../config/cloudinary';
import { requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { HttpError, asyncHandler, badRequest } from '../utils/http';

export const uploadRouter = Router();

/**
 * Where uploads go when Cloudinary isn't configured (local testing only — never in
 * production). Served by app.ts at /uploads.
 */
export const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

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
      // Local testing without Cloudinary: keep the files on this computer instead.
      if (!isProd) {
        await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
        const base = `${req.protocol}://${req.get('host')}/uploads`;
        const urls = await Promise.all(
          files.map(async (f) => {
            const ext = (path.extname(f.originalname) || '.jpg').toLowerCase().replace(/[^.a-z0-9]/g, '');
            const name = `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;
            await writeFile(path.join(LOCAL_UPLOAD_DIR, name), f.buffer);
            return `${base}/${name}`;
          }),
        );
        res.status(201).json({ urls });
        return;
      }
      throw new HttpError(503, 'Image uploads are not configured on this server');
    }

    const images = await Promise.all(files.map((f) => uploadBuffer(f.buffer, f.originalname)));

    res.status(201).json({
      urls: images.map((i) => i.url),
      images,
    });
  }),
);
