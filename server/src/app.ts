import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { allowedOrigins, isProd } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import { HttpError } from './utils/http';
import { authRouter } from './routes/auth.routes';
import { seoRouter } from './routes/seo.routes';
import { tripsRouter } from './routes/trips.routes';
import { uploadRouter } from './routes/upload.routes';

export function createApp() {
  const app = express();

  // Render/Vercel sit behind a proxy — needed for secure cookies + rate-limit IPs.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // API only serves JSON; CSP belongs to the client host.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin, curl and server-to-server requests have no Origin header.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        // HttpError keeps the response as 403 + { error } rather than a generic 500.
        callback(new HttpError(403, `Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(isProd ? 'combined' : 'dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/trips', tripsRouter);
  app.use('/api/upload', uploadRouter);
  app.use(seoRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
