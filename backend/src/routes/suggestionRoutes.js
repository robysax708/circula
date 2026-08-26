// src/routes/suggestionRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as svc from '../services/suggestionService.js';

const router = Router();

router.post('/', requireAuth, (req, res, next) => {
  try {
    const suggestion = svc.createSuggestion(req.user.id, req.body);
    res.status(201).json({ suggestion });
  } catch (err) { next(err); }
});

router.get('/', (req, res) => {
  const { region, producerId } = req.query;
  if (producerId) return res.json({ items: svc.listSuggestionsForProducer(Number(producerId)) });
  if (region) return res.json({ items: svc.listSuggestionsByRegion(region) });
  res.json({ items: svc.listAllSuggestions() });
});

export default router;
