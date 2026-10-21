import type { ErrorRequestHandler } from 'express';

/**
 * Global error handler — registered last, after every route.
 * Express recognises it by its four arguments. The stack trace stays in the
 * server log; the client only gets a generic message.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
};
