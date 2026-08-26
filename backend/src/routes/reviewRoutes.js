// src/routes/reviewRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { reviewSchema } from '../utils/schemas.js';
import { uploadPhotos, processPhotos } from '../middlewares/upload.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';
import * as svc from '../services/reviewService.js';

const router = Router();

router.post('/:eventId/attend', requireAuth, (req, res, next) => {
  try {
    const result = svc.markAttended(req.user.id, Number(req.params.eventId));
    res.status(result.already ? 200 : 201).json({ attended: true });
  } catch (err) { next(err); }
});

router.post('/:eventId/review', requireAuth, uploadLimiter, uploadPhotos, processPhotos, (req, res, next) => {
  try {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (typeof body.rating === 'string') body.rating = Number(body.rating);
    } catch { body = req.body; }
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    const review = svc.createReview(req.user.id, Number(req.params.eventId), parsed.data, req.processedPhotos || []);
    res.status(201).json({ review });
  } catch (err) { next(err); }
});

router.get('/:eventId/reviews', (req, res, next) => {
  try { res.json({ items: svc.listReviewsByEvent(Number(req.params.eventId)) }); }
  catch (err) { next(err); }
});

export default router;
