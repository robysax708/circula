// src/middlewares/validate.js
import { badRequest } from '../utils/apiError.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(badRequest('Dados inválidos', result.error.flatten()));
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return next(badRequest('Parâmetros inválidos', result.error.flatten()));
    req.query = result.data;
    next();
  };
}
