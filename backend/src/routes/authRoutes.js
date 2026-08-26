// src/routes/authRoutes.js
import { Router } from 'express';
import * as auth from '../services/authService.js';
import { validateBody } from '../middlewares/validate.js';
import {
  registerUserSchema, registerProducerSchema, loginSchema,
  updateProfileSchema, changePasswordSchema, requestResetSchema, resetPasswordSchema,
} from '../utils/schemas.js';
import { authLimiter } from '../middlewares/rateLimiters.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerUserSchema), async (req, res, next) => {
  try { const { consent, ...data } = req.body; res.status(201).json({ user: await auth.registerUser(data) }); }
  catch (err) { next(err); }
});

router.post('/register/producer', authLimiter, validateBody(registerProducerSchema), async (req, res, next) => {
  try { const { consent, ...data } = req.body; res.status(201).json({ user: await auth.registerProducer(data) }); }
  catch (err) { next(err); }
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try { res.json(await auth.loginUser(req.body)); }
  catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: auth.getPublicUser(req.user.id) });
});

router.patch('/profile', requireAuth, validateBody(updateProfileSchema), (req, res, next) => {
  try { res.json({ user: auth.updateProfile(req.user.id, req.body) }); }
  catch (err) { next(err); }
});

router.post('/change-password', requireAuth, validateBody(changePasswordSchema), async (req, res, next) => {
  try {
    await auth.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) { next(err); }
});

router.post('/forgot-password', authLimiter, validateBody(requestResetSchema), (req, res) => {
  auth.requestPasswordReset(req.body.email);
  res.json({ message: 'Se o e-mail existir, as instruções serão enviadas' });
});

router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    await auth.resetPassword(req.body.token, req.body.newPassword);
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) { next(err); }
});

export default router;
