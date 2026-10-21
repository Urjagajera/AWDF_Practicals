import express from 'express';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

/** Builds the app without listening, so server.ts and the combined repo server can both use it. */
export function createApp() {
  const app = express();

  // 1. Parse JSON bodies, 2. log every request.
  app.use(express.json());
  app.use(logger);

  app.get('/', (_req, res) => {
    res.json({ name: 'Task Management API', practical: 4 });
  });

  // Demonstrates the error handler: anything passed to next(err) ends up there.
  app.get('/boom', (_req, _res, next) => {
    next(new Error('Deliberate test error'));
  });

  // Last: the global error handler.
  app.use(errorHandler);
  return app;
}
