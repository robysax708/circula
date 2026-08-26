// src/services/authService.js
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db/index.js';
import { signToken } from '../utils/jwt.js';
import { conflict, unauthorized, notFound, badRequest } from '../utils/apiError.js';
import { sanitizeCnpj, isValidCnpj, escapeHtml } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';

const SALT_ROUNDS = 12;

export async function registerUser({ name, email, password, city, stateCode, accessibilityNeeds }) {
  checkEmailConflict(email);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date().toISOString();
  const result = db
    .prepare(`INSERT INTO users (name, email, password_hash, city, state_code, accessibility_needs, role, consent_at, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, ?)`)
    .run(escapeHtml(name), email, passwordHash, escapeHtml(city) || null, stateCode || null, escapeHtml(accessibilityNeeds) || null, now, now, now);
  logger.info('Novo usuário registrado', { id: result.lastInsertRowid, role: 'user' });
  return getPublicUser(result.lastInsertRowid);
}

export async function registerProducer({ name, email, password, city, cnpj, orgName, orgPhone, orgDescription }) {
  checkEmailConflict(email);
  const cleanCnpj = sanitizeCnpj(cnpj);
  if (!isValidCnpj(cleanCnpj)) throw badRequest('CNPJ inválido');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date().toISOString();
  const result = db
    .prepare(`INSERT INTO users (name, email, password_hash, city, role, cnpj, org_name, org_phone, org_description, consent_at, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'producer', ?, ?, ?, ?, ?, ?, ?)`)
    .run(escapeHtml(name), email, passwordHash, escapeHtml(city) || null,
         cleanCnpj, escapeHtml(orgName), escapeHtml(orgPhone) || null, escapeHtml(orgDescription) || null,
         now, now, now);
  logger.info('Novo produtor registrado', { id: result.lastInsertRowid });
  return getPublicUser(result.lastInsertRowid);
}

export async function loginUser({ email, password }) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !user.is_active) throw unauthorized('E-mail ou senha inválidos');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw unauthorized('E-mail ou senha inválidos');
  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: getPublicUser(user.id) };
}

export function updateProfile(userId, data) {
  const sets = [];
  const params = {};
  const fields = { username: 'username', city: 'city', stateCode: 'state_code', bio: 'bio', accessibilityNeeds: 'accessibility_needs' };
  for (const [key, col] of Object.entries(fields)) {
    if (data[key] !== undefined) {
      if (key === 'username') {
        const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(data.username, userId);
        if (existing) throw conflict('Este nome de usuário já está em uso');
      }
      sets.push(`${col} = @${key}`);
      params[key] = typeof data[key] === 'string' ? escapeHtml(data[key]) : data[key];
    }
  }
  if (sets.length === 0) throw badRequest('Nenhum campo para atualizar');
  sets.push('updated_at = @now');
  params.now = new Date().toISOString();
  params.id = userId;
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(params);
  return getPublicUser(userId);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
  if (!user) throw notFound('Usuário não encontrado');
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw unauthorized('Senha atual incorreta');
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .run(hash, new Date().toISOString(), userId);
}

export function requestPasswordReset(email) {
  const user = db.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1').get(email);
  if (!user) return null;
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)')
    .run(user.id, token, expiresAt);
  logger.info('Token de recuperação gerado', { userId: user.id });
  return token;
}

export async function resetPassword(token, newPassword) {
  const row = db.prepare(
    `SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > ?`
  ).get(token, new Date().toISOString());
  if (!row) throw badRequest('Token inválido ou expirado');
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, row.user_id);
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(row.id);
  logger.info('Senha redefinida via token', { userId: row.user_id });
}

export function getPublicUser(id) {
  return db.prepare(
    `SELECT id, name, email, username, city, state_code, region, role, cnpj, org_name, org_phone, org_description, bio, avatar_url, accessibility_needs, created_at
     FROM users WHERE id = ?`
  ).get(id);
}

function checkEmailConflict(email) {
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    throw conflict('Este e-mail já está cadastrado');
}
