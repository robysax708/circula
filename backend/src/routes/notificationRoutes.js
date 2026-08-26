// src/routes/notificationRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listNotifications, markAsRead } from '../services/notificationService.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const onlyUnread = req.query.onlyUnread === 'true';
  res.json({ items: listNotifications(req.user.id, { onlyUnread }) });
});

router.post('/:id/read', (req, res) => {
  markAsRead(req.user.id, Number(req.params.id));
  res.status(204).send();
});

export default router;
