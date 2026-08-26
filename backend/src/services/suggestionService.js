// src/services/suggestionService.js
import db from '../db/index.js';
import { badRequest } from '../utils/apiError.js';
import { escapeHtml } from '../utils/sanitize.js';

export function createSuggestion(userId, { targetType, targetRegion, targetProducerId, category, message }) {
  if (!message || message.trim().length < 10) throw badRequest('A sugestão precisa ter ao menos 10 caracteres');
  const now = new Date().toISOString();
  const result = db.prepare(
    `INSERT INTO suggestions (user_id, target_type, target_region, target_producer_id, category, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(userId, targetType, escapeHtml(targetRegion) || null, targetProducerId || null, escapeHtml(category) || null, escapeHtml(message), now);
  return db.prepare('SELECT * FROM suggestions WHERE id = ?').get(result.lastInsertRowid);
}

export function listSuggestionsByRegion(region) {
  return db.prepare(
    `SELECT s.*, u.name AS user_name FROM suggestions s JOIN users u ON u.id = s.user_id
     WHERE s.target_region = ? ORDER BY s.created_at DESC LIMIT 50`
  ).all(region);
}

export function listSuggestionsForProducer(producerId) {
  return db.prepare(
    `SELECT s.*, u.name AS user_name FROM suggestions s JOIN users u ON u.id = s.user_id
     WHERE s.target_producer_id = ? ORDER BY s.created_at DESC LIMIT 50`
  ).all(producerId);
}

export function listAllSuggestions() {
  return db.prepare(
    `SELECT s.*, u.name AS user_name FROM suggestions s JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC LIMIT 100`
  ).all();
}
