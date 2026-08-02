import 'dotenv/config';
import { z } from 'zod';

/**
 * Every environment variable the server needs, validated once at boot.
 * Failing fast here beats a cryptic runtime error three routes deep.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  PUBLIC_SITE_URL: z.string().min(1).default('http://localhost:5173'),

  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLOUDINARY_FOLDER: z.string().default('expediva'),

  ADMIN_EMAIL: z.string().email().default('admin@expediva.in'),
  ADMIN_PASSWORD: z.string().min(8).default('changeme123'),
  ADMIN_NAME: z.string().default('Expediva Admin'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`\nInvalid environment configuration:\n${issues}\n\nSee server/.env.example.\n`);
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';

/** Cloudinary is optional in dev — uploads 503 instead of crashing the server. */
export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

/** CORS allow-list: comma-separated CLIENT_ORIGIN supports preview deployments. */
export const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
