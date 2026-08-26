// src/services/eventService.js
import db from '../db/index.js';
import { notFound, forbidden, badRequest } from '../utils/apiError.js';
import { escapeHtml } from '../utils/sanitize.js';

const LOCK_DAYS = 5;

export function listEvents({ city, categoryId, from, onlyFavorites, q, page, pageSize }, userId) {
  const conditions = ['e.is_active = 1'];
  const params = {};
  if (city) { conditions.push('LOWER(e.city) = LOWER(@city)'); params.city = city; }
  if (categoryId) { conditions.push('e.category_id = @categoryId'); params.categoryId = categoryId; }
  if (from) { conditions.push('e.date_start >= @from'); params.from = from; }
  if (q) { conditions.push('(e.title LIKE @q OR e.description LIKE @q OR e.city LIKE @q)'); params.q = `%${q}%`; }
  if (onlyFavorites) { conditions.push('f.user_id = @userId'); params.userId = userId; }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;
  const rows = db.prepare(
    `SELECT e.*, c.name AS category_name, c.icon AS category_icon,
            CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite,
            u.name AS creator_name, u.org_name AS creator_org,
            (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.event_id = e.id) AS avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.event_id = e.id) AS review_count,
            (SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id) AS attendance_count
     FROM events e
     LEFT JOIN categories c ON c.id = e.category_id
     LEFT JOIN favorites f ON f.event_id = e.id AND f.user_id = @userId
     LEFT JOIN users u ON u.id = e.created_by
     ${whereClause}
     ORDER BY e.date_start ASC
     LIMIT @pageSize OFFSET @offset`
  ).all({ ...params, userId: userId || 0, pageSize, offset });
  const total = db.prepare(
    `SELECT COUNT(*) AS count FROM events e
     LEFT JOIN favorites f ON f.event_id = e.id AND f.user_id = @userId
     ${whereClause}`
  ).get({ ...params, userId: userId || 0 }).count;
  return { items: rows, total, page, pageSize };
}

export function getEventById(id, userId) {
  const event = db.prepare(
    `SELECT e.*, c.name AS category_name, c.icon AS category_icon,
            CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite,
            CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END AS has_attended,
            u.name AS creator_name, u.org_name AS creator_org,
            (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.event_id = e.id) AS avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.event_id = e.id) AS review_count,
            (SELECT COUNT(*) FROM attendances a2 WHERE a2.event_id = e.id) AS attendance_count
     FROM events e
     LEFT JOIN categories c ON c.id = e.category_id
     LEFT JOIN favorites f ON f.event_id = e.id AND f.user_id = @userId
     LEFT JOIN attendances a ON a.event_id = e.id AND a.user_id = @userId
     LEFT JOIN users u ON u.id = e.created_by
     WHERE e.id = @id AND e.is_active = 1`
  ).get({ id, userId: userId || 0 });
  if (!event) throw notFound('Evento não encontrado');
  const reviews = db.prepare(
    `SELECT r.*, u.name AS user_name, u.username
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ? ORDER BY r.created_at DESC LIMIT 20`
  ).all(id);
  for (const rev of reviews) {
    rev.photos = db.prepare('SELECT filename FROM review_photos WHERE review_id = ?').all(rev.id).map(p => p.filename);
  }
  event.reviews = reviews;
  return event;
}

export function createEvent(data, user) {
  if (user.role !== 'producer' && user.role !== 'admin')
    throw forbidden('Apenas produtores podem publicar eventos');
  const now = new Date().toISOString();
  const result = db.prepare(
    `INSERT INTO events (title, description, category_id, city, region, address, lat, lng,
      date_start, date_end, price, image_url, source, source_url, is_user_generated, created_by, created_at, updated_at)
     VALUES (@title, @description, @categoryId, @city, @region, @address, @lat, @lng,
      @dateStart, @dateEnd, @price, @imageUrl, 'produtor', @sourceUrl, 1, @createdBy, @now, @now)`
  ).run({
    title: escapeHtml(data.title), description: escapeHtml(data.description) || null,
    categoryId: data.categoryId || null, city: escapeHtml(data.city),
    region: escapeHtml(data.region) || null, address: escapeHtml(data.address) || null,
    lat: data.lat || null, lng: data.lng || null,
    dateStart: data.dateStart, dateEnd: data.dateEnd || null,
    price: escapeHtml(data.price) || null, imageUrl: data.imageUrl || null,
    sourceUrl: data.sourceUrl || null, createdBy: user.id, now,
  });
  return getEventById(result.lastInsertRowid, user.id);
}

export function updateEvent(id, data, user) {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND is_active = 1').get(id);
  if (!event) throw notFound('Evento não encontrado');
  if (event.created_by !== user.id && user.role !== 'admin')
    throw forbidden('Você não pode editar este evento');
  const eventDate = new Date(event.date_start);
  const now = new Date();
  const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);
  if (diffDays < LOCK_DAYS)
    throw badRequest(`Não é possível alterar o evento a menos de ${LOCK_DAYS} dias da data`);
  const sets = [];
  const params = { id };
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      sets.push(`${col} = @${key}`);
      params[key] = typeof val === 'string' ? escapeHtml(val) : val;
    }
  }
  if (sets.length === 0) throw badRequest('Nenhum campo para atualizar');
  sets.push('updated_at = @now');
  params.now = new Date().toISOString();
  db.prepare(`UPDATE events SET ${sets.join(', ')} WHERE id = @id`).run(params);
  return getEventById(id, user.id);
}

export function deactivateEvent(id, user) {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!event) throw notFound('Evento não encontrado');
  if (event.created_by !== user.id && user.role !== 'admin')
    throw forbidden('Você não pode remover este evento');
  db.prepare('UPDATE events SET is_active = 0, updated_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);
}

export function listCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
}
