// src/middlewares/errorHandler.js
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details || undefined,
    });
  }

  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ error: 'Corpo da requisição excede o tamanho permitido' });
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }

  logger.error('Erro interno não tratado', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({ error: 'Ocorreu um problema interno. Tente novamente mais tarde.' });
}
