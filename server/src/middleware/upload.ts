import multer from 'multer';
import { badRequest } from '../utils/http';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/** Memory storage: buffers go straight to Cloudinary, nothing touches disk. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 12,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(badRequest('Only JPEG, PNG, WebP or AVIF images are allowed'));
      return;
    }
    cb(null, true);
  },
});
