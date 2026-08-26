// src/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import botRoutes from './routes/botRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import culturalRoutes from './routes/culturalRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import publicApiRoutes from './routes/publicApiRoutes.js';
import avatarRoutes from './routes/avatarRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiters.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(generalLimiter);

  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/bot', botRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/cultural', culturalRoutes);
  app.use('/api/suggestions', suggestionRoutes);
  app.use('/api/public', publicApiRoutes);
  app.use('/api/avatar', avatarRoutes);

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health') || req.path.includes('.')) return next();
    res.sendFile(path.resolve(process.cwd(), 'public', 'index.html'));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
