// src/utils/logger.js
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL || 'info'] ?? 1;

function format(level, message, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  return meta && Object.keys(meta).length ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
  debug: (msg, meta) => currentLevel <= 0 && console.log(format('debug', msg, meta)),
  info: (msg, meta) => currentLevel <= 1 && console.log(format('info', msg, meta)),
  warn: (msg, meta) => currentLevel <= 2 && console.warn(format('warn', msg, meta)),
  error: (msg, meta) => currentLevel <= 3 && console.error(format('error', msg, meta)),
};
