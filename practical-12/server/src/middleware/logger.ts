import type { RequestHandler } from 'express';

/** Logs method, URL and timestamp for every request, then hands over with next(). Quiet under Jest. */
export const logger: RequestHandler = (req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  }
  next();
};
