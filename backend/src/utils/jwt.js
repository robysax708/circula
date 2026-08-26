// src/utils/jwt.js
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

if (!secret || secret.length < 16) {
  throw new Error('JWT_SECRET ausente ou fraco: defina uma chave longa em .env');
}

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
