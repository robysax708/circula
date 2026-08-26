// src/services/favoriteService.js
import db from '../db/index.js';
import { notFound } from '../utils/apiError.js';

export function addFavorite(userId, eventId, notify) {
  const event = db.prepare('SELECT id FROM events WHERE id = ? AND is_active = 1').get(eventId);
  if (!event) throw notFound('Evento não encontrado');

  db.prepare(
    `INSERT INTO favorites (user_id, event_id, notify, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, event_id) DO UPDATE SET notify = excluded.notify`
  ).run(userId, eventId, notify ? 1 : 0, new Date().toISOString());

  return { eventId, favorite: true };
}

export function removeFavorite(userId, eventId) {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND event_id = ?').run(userId, eventId);
  return { eventId, favorite: false };
}

export function listFavorites(userId) {
  return db
    .prepare(
      `SELECT e.*, c.name AS category_name, f.notify
       FROM favorites f
       JOIN events e ON e.id = f.event_id
       LEFT JOIN categories c ON c.id = e.category_id
       WHERE f.user_id = ? AND e.is_active = 1
       ORDER BY e.date_start ASC`
    )
    .all(userId);
}
