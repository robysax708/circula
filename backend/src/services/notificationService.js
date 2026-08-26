// src/services/notificationService.js
import db from '../db/index.js';

export function listNotifications(userId, { onlyUnread = false } = {}) {
  const clause = onlyUnread ? 'AND is_read = 0' : '';
  return db
    .prepare(
      `SELECT * FROM notifications WHERE user_id = ? ${clause} ORDER BY created_at DESC LIMIT 50`
    )
    .all(userId);
}

export function markAsRead(userId, notificationId) {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(
    notificationId,
    userId
  );
}

export function createNotification(userId, eventId, type, message) {
  const alreadyExists = db
    .prepare(
      `SELECT id FROM notifications WHERE user_id = ? AND event_id = ? AND type = ?`
    )
    .get(userId, eventId, type);

  if (alreadyExists) return null;

  const result = db
    .prepare(
      `INSERT INTO notifications (user_id, event_id, type, message, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, eventId, type, message, new Date().toISOString());

  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
}

export function checkUpcomingFavorites() {
  const windowHours = 72;
  const now = new Date();
  const limit = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

  const rows = db
    .prepare(
      `SELECT f.user_id, e.id AS event_id, e.title, e.date_start
       FROM favorites f
       JOIN events e ON e.id = f.event_id
       WHERE f.notify = 1
         AND e.is_active = 1
         AND e.date_start BETWEEN ? AND ?`
    )
    .all(now.toISOString(), limit.toISOString());

  const created = [];
  for (const row of rows) {
    const message = `O evento "${row.title}" que você favoritou acontece em breve (${new Date(
      row.date_start
    ).toLocaleString('pt-BR')}).`;
    const notification = createNotification(row.user_id, row.event_id, 'evento_proximo', message);
    if (notification) created.push(notification);
  }
  return created;
}
