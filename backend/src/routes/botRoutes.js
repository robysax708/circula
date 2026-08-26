// src/routes/botRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { botMessageSchema } from '../utils/schemas.js';
import { generateBotReply, getConversation } from '../services/botService.js';
import { botLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ items: getConversation(req.user.id) });
});

router.post('/', botLimiter, validateBody(botMessageSchema), (req, res, next) => {
  try {
    const reply = generateBotReply(req.user, req.body.message);
    res.status(201).json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;
