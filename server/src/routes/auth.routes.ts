import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AdminModel, verifyPassword } from '../models/Admin';
import { clearAuthCookie, requireAdmin, setAuthCookie, signAdminToken } from '../middleware/auth';
import { asyncHandler, unauthorized } from '../utils/http';
import { loginSchema } from '../validation/trip';

export const authRouter = Router();

/** Brute-force guard on the only credential-accepting route we have. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

/** POST /api/auth/login */
authRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await AdminModel.findOne({ email });

    // Same message either way — don't leak which emails exist.
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      throw unauthorized('Incorrect email or password');
    }

    setAuthCookie(res, signAdminToken({ sub: String(admin._id), email: admin.email }));

    res.json({ email: admin.email, name: admin.name });
  }),
);

/** POST /api/auth/logout */
authRouter.post('/logout', requireAdmin, (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

/** GET /api/auth/me — session probe for the admin app */
authRouter.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const admin = await AdminModel.findById(req.admin!.sub).lean();
    if (!admin) throw unauthorized('Account no longer exists');

    res.json({ email: admin.email, name: admin.name });
  }),
);
