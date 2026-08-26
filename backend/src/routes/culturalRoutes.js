// src/routes/culturalRoutes.js
import { Router } from 'express';
import * as svc from '../services/culturalService.js';

const router = Router();

router.get('/', (req, res) => {
  const type = req.query.type || undefined;
  res.json({ items: svc.listPrograms({ type }) });
});

router.get('/:id', (req, res, next) => {
  try {
    const p = svc.getProgramById(Number(req.params.id));
    if (!p) return res.status(404).json({ error: 'Programa não encontrado' });
    res.json({ program: p });
  } catch (err) { next(err); }
});

export default router;
