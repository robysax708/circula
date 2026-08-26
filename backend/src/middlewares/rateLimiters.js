// src/middlewares/rateLimiters.js
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente em instantes' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: true, legacyHeaders: false, skipSuccessfulRequests: true,
  message: { error: 'Muitas tentativas de autenticação, tente novamente mais tarde' },
});

export const botLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas mensagens ao bot, aguarde um instante' },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitos uploads, tente novamente mais tarde' },
});
