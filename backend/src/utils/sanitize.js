// src/utils/sanitize.js
const ENTITY_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };

export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (c) => ENTITY_MAP[c]);
}

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? escapeHtml(value.trim()) : value;
  }
  return result;
}

export function sanitizeCnpj(cnpj) {
  if (!cnpj) return null;
  return cnpj.replace(/\D/g, '').slice(0, 14);
}

export function isValidCnpj(cnpj) {
  if (!cnpj || cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (digits, factors) =>
    digits.reduce((sum, d, i) => sum + d * factors[i], 0) % 11;
  const digits = cnpj.split('').map(Number);
  const f1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const f2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const r1 = calc(digits.slice(0, 12), f1);
  const d1 = r1 < 2 ? 0 : 11 - r1;
  if (digits[12] !== d1) return false;
  const r2 = calc(digits.slice(0, 13), f2);
  const d2 = r2 < 2 ? 0 : 11 - r2;
  return digits[13] === d2;
}
