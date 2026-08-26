// src/middlewares/auth.js
import { verifyToken } from '../utils/jwt.js';
import { unauthorized, forbidden } from '../utils/apiError.js';
import db from '../db/index.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized('Token ausente'));
  try {
    const payload = verifyToken(token);
    const user = db
      .prepare('SELECT id, name, email, username, city, role, is_active FROM users WHERE id = ?')
      .get(payload.sub);
    if (!user || !user.is_active) return next(unauthorized('Usuário inválido ou inativo'));
    req.user = user;
    next();
  } catch {
    return next(unauthorized('Token inválido ou expirado'));
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) { req.user = null; return next(); }
  try {
    const payload = verifyToken(token);
    const user = db
      .prepare('SELECT id, name, email, username, city, role, is_active FROM users WHERE id = ?')
      .get(payload.sub);
    req.user = user && user.is_active ? user : null;
  } catch { req.user = null; }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(forbidden('Você não tem permissão para esta ação'));
    next();
  };
}
