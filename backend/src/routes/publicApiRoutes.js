// src/routes/publicApiRoutes.js
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

router.get('/events', (req, res) => {
  const { city, state, category, page = 1, pageSize = 20 } = req.query;
  const conditions = ['e.is_active = 1'];
  const params = {};
  if (city) { conditions.push('LOWER(e.city) = LOWER(@city)'); params.city = city; }
  if (state) { conditions.push('LOWER(e.region) LIKE @state'); params.state = `%${state}%`; }
  if (category) { conditions.push('c.name = @category'); params.category = category; }
  const where = conditions.join(' AND ');
  const offset = (Number(page) - 1) * Number(pageSize);
  const items = db.prepare(
    `SELECT e.id, e.title, e.description, e.city, e.region, e.address, e.lat, e.lng,
            e.date_start, e.date_end, e.price, e.source, e.source_detail, e.source_url,
            c.name AS category, c.icon AS category_icon,
            (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.event_id = e.id) AS avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.event_id = e.id) AS review_count
     FROM events e LEFT JOIN categories c ON c.id = e.category_id
     WHERE ${where} ORDER BY e.date_start ASC LIMIT @limit OFFSET @offset`
  ).all({ ...params, limit: Number(pageSize), offset });
  const total = db.prepare(`SELECT COUNT(*) AS c FROM events e LEFT JOIN categories c ON c.id = e.category_id WHERE ${where}`).get(params).c;
  res.json({
    meta: { total, page: Number(page), pageSize: Number(pageSize), api: 'Circula API Pública v1', docs: '/api/public/docs' },
    items,
  });
});

router.get('/categories', (req, res) => {
  res.json({ items: db.prepare('SELECT id, name, icon FROM categories ORDER BY name').all() });
});

router.get('/stats', (req, res) => {
  const totalEvents = db.prepare('SELECT COUNT(*) AS c FROM events WHERE is_active = 1').get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) AS c FROM users WHERE is_active = 1').get().c;
  const totalReviews = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
  const byCity = db.prepare('SELECT city, COUNT(*) AS count FROM events WHERE is_active = 1 GROUP BY city ORDER BY count DESC').all();
  const byCategory = db.prepare('SELECT c.name, COUNT(*) AS count FROM events e JOIN categories c ON c.id = e.category_id WHERE e.is_active = 1 GROUP BY c.name ORDER BY count DESC').all();
  const bySource = db.prepare('SELECT source, COUNT(*) AS count FROM events WHERE is_active = 1 GROUP BY source ORDER BY count DESC').all();
  res.json({ totalEvents, totalUsers, totalReviews, byCity, byCategory, bySource });
});

router.get('/suggestions', (req, res) => {
  const { region } = req.query;
  const items = region
    ? db.prepare('SELECT id, target_type, target_region, category, message, status, created_at FROM suggestions WHERE target_region = ? ORDER BY created_at DESC LIMIT 50').all(region)
    : db.prepare('SELECT id, target_type, target_region, category, message, status, created_at FROM suggestions ORDER BY created_at DESC LIMIT 50').all();
  res.json({ items });
});

router.get('/docs', (req, res) => {
  res.json({
    name: 'Circula API Pública',
    version: '1.0',
    description: 'API aberta de dados culturais do Circula. Dados disponíveis para desenvolvedores, pesquisadores e órgãos culturais.',
    endpoints: [
      { method: 'GET', path: '/api/public/events', params: 'city, state, category, page, pageSize', description: 'Lista eventos culturais com filtros' },
      { method: 'GET', path: '/api/public/categories', description: 'Lista categorias culturais disponíveis' },
      { method: 'GET', path: '/api/public/stats', description: 'Estatísticas agregadas (total de eventos, por cidade, categoria e fonte)' },
      { method: 'GET', path: '/api/public/suggestions', params: 'region', description: 'Sugestões da comunidade por região' },
    ],
    license: 'Dados abertos — uso livre com atribuição ao Circula',
  });
});

export default router;
