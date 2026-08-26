// src/services/reviewService.js
import db from '../db/index.js';
import { notFound, badRequest, conflict } from '../utils/apiError.js';
import { escapeHtml } from '../utils/sanitize.js';

export function markAttended(userId, eventId) {
  const event = db.prepare('SELECT id, date_start FROM events WHERE id = ? AND is_active = 1').get(eventId);
  if (!event) throw notFound('Evento não encontrado');
  const existing = db.prepare('SELECT id FROM attendances WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  if (existing) return { already: true };
  db.prepare('INSERT INTO attendances (user_id, event_id, created_at) VALUES (?, ?, ?)')
    .run(userId, eventId, new Date().toISOString());
  return { already: false };
}

export function createReview(userId, eventId, { rating, comment }, photoFilenames = []) {
  const attendance = db.prepare('SELECT id FROM attendances WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  if (!attendance) throw badRequest('Você precisa marcar presença antes de avaliar');
  const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  if (existing) throw conflict('Você já avaliou este evento');
  const now = new Date().toISOString();
  const result = db.prepare(
    'INSERT INTO reviews (user_id, event_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, eventId, rating, escapeHtml(comment) || null, now);
  const reviewId = result.lastInsertRowid;
  if (photoFilenames.length > 0) {
    const insert = db.prepare('INSERT INTO review_photos (review_id, filename, created_at) VALUES (?, ?, ?)');
    for (const fn of photoFilenames) insert.run(reviewId, fn, now);
  }
  return db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
}

export function listReviewsByEvent(eventId) {
  const reviews = db.prepare(
    `SELECT r.*, u.name AS user_name, u.username
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ? ORDER BY r.created_at DESC`
  ).all(eventId);
  for (const rev of reviews) {
    rev.photos = db.prepare('SELECT filename FROM review_photos WHERE review_id = ?').all(rev.id).map(p => p.filename);
  }
  return reviews;
}
