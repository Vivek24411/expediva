import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProd } from '../config/env';
import { unauthorized } from '../utils/http';

export const AUTH_COOKIE = 'expediva_token';

export interface AdminTokenPayload {
  sub: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    // Client (Vercel) and API (Render) are cross-site in production.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

/** Gate for every admin route. Reads the httpOnly cookie, verifies, attaches req.admin. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE];

  if (!token) return next(unauthorized());

  try {
    req.admin = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
    next();
  } catch {
    next(unauthorized('Session expired, please log in again'));
  }
}
