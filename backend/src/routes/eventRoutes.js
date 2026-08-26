// src/routes/eventRoutes.js
import { Router } from 'express';
import * as svc from '../services/eventService.js';
import db from '../db/index.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import { eventCreateSchema, eventUpdateSchema, eventQuerySchema } from '../utils/schemas.js';

const router = Router();

router.get('/categories', (req, res) => {
  res.json({ items: svc.listCategories() });
});

router.get('/by-producer/:producerId', (req, res, next) => {
  try {
    const producerId = Number(req.params.producerId);
    const items = db.prepare(
      `SELECT e.*, c.name AS category_name, c.icon AS category_icon,
              (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.event_id = e.id) AS avg_rating,
              (SELECT COUNT(*) FROM reviews r WHERE r.event_id = e.id) AS review_count
       FROM events e LEFT JOIN categories c ON c.id = e.category_id
       WHERE e.created_by = ? AND e.is_active = 1 ORDER BY e.date_start DESC`
    ).all(producerId);
    res.json({ items });
  } catch (err) { next(err); }
});

router.get('/', optionalAuth, validateQuery(eventQuerySchema), (req, res, next) => {
  try {
    if (req.query.onlyFavorites && !req.user)
      return res.json({ items: [], total: 0, page: req.query.page, pageSize: req.query.pageSize });
    res.json(svc.listEvents(req.query, req.user?.id));
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, (req, res, next) => {
  try { res.json({ event: svc.getEventById(Number(req.params.id), req.user?.id) }); }
  catch (err) { next(err); }
});

router.post('/', requireAuth, validateBody(eventCreateSchema), (req, res, next) => {
  try { res.status(201).json({ event: svc.createEvent(req.body, req.user) }); }
  catch (err) { next(err); }
});

router.patch('/:id', requireAuth, validateBody(eventUpdateSchema), (req, res, next) => {
  try { res.json({ event: svc.updateEvent(Number(req.params.id), req.body, req.user) }); }
  catch (err) { next(err); }
});

router.delete('/:id', requireAuth, (req, res, next) => {
  try { svc.deactivateEvent(Number(req.params.id), req.user); res.status(204).send(); }
  catch (err) { next(err); }
});

export default router;
