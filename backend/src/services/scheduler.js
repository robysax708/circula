// src/services/scheduler.js
import { checkUpcomingFavorites } from './notificationService.js';

const INTERVAL_MS = 15 * 60 * 1000;
let handle = null;

export function startScheduler() {
  if (handle) return handle;

  runOnce();
  handle = setInterval(runOnce, INTERVAL_MS);
  return handle;
}

export function stopScheduler() {
  if (handle) {
    clearInterval(handle);
    handle = null;
  }
}

function runOnce() {
  try {
    const created = checkUpcomingFavorites();
    if (created.length > 0) {
      console.log(`[scheduler] ${created.length} nova(s) notificação(ões) gerada(s)`);
    }
  } catch (err) {
    console.error('[scheduler] erro ao checar eventos favoritos', err);
  }
}
