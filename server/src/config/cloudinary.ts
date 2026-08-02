import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfigured, env } from './env';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/** Streams an in-memory multer buffer straight to Cloudinary. */
export function uploadBuffer(buffer: Buffer, filename: string): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: 'image',
        public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-')}`,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Recovers the Cloudinary public_id from a delivery URL so trip deletes can
 * clean up storage. Returns null for URLs we didn't upload (e.g. Unsplash seeds).
 */
export function publicIdFromUrl(url: string): string | null {
  if (!url.includes('res.cloudinary.com')) return null;
  // .../upload/(v123/)?<folder>/<name>.<ext>
  const match = url.match(/\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return null;
  // Strip any leading transformation segments that slipped through.
  return match[1].replace(/^(?:[a-z]_[^/]+\/)+/, '');
}

/** Best-effort cleanup — never blocks the delete response. */
export async function deleteImagesByUrl(urls: string[]): Promise<void> {
  if (!cloudinaryConfigured) return;

  const ids = urls.map(publicIdFromUrl).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;

  try {
    await cloudinary.api.delete_resources(ids);
  } catch (err) {
    console.error('[cloudinary] cleanup failed:', (err as Error).message);
  }
}
