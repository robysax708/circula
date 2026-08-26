// src/services/culturalService.js
import db from '../db/index.js';

export function listPrograms({ type } = {}) {
  if (type) {
    return db.prepare('SELECT * FROM cultural_programs WHERE is_active = 1 AND type = ? ORDER BY deadline ASC').all(type);
  }
  return db.prepare('SELECT * FROM cultural_programs WHERE is_active = 1 ORDER BY type, deadline ASC').all();
}

export function getProgramById(id) {
  return db.prepare('SELECT * FROM cultural_programs WHERE id = ? AND is_active = 1').get(id);
}
