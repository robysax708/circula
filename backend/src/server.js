// src/server.js
import 'dotenv/config';
import { createApp } from './app.js';
import { runSeed } from './db/seed.js';
import { startScheduler } from './services/scheduler.js';
import { logger } from './utils/logger.js';

runSeed();

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`Circula backend rodando na porta ${port}`);
  startScheduler();
});
