// src/routes/favoriteRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { favoriteToggleSchema } from '../utils/schemas.js';
import { addFavorite, removeFavorite, listFavorites } from '../services/favoriteService.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ items: listFavorites(req.user.id) });
});

router.post('/', validateBody(favoriteToggleSchema), (req, res, next) => {
  try {
    const result = addFavorite(req.user.id, req.body.eventId, req.body.notify);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:eventId', (req, res, next) => {
  try {
    const result = removeFavorite(req.user.id, Number(req.params.eventId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
