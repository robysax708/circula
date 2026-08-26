// src/utils/apiError.js
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (msg = 'Recurso não encontrado') => new ApiError(404, msg);
export const badRequest = (msg = 'Requisição inválida', d = null) => new ApiError(400, msg, d);
export const unauthorized = (msg = 'Não autenticado') => new ApiError(401, msg);
export const forbidden = (msg = 'Acesso negado') => new ApiError(403, msg);
export const conflict = (msg = 'Conflito de dados') => new ApiError(409, msg);
