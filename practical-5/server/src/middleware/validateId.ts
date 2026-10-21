import type { RequestHandler } from 'express';

/** Route-specific middleware: :id must be a positive whole number. */
export const validateId: RequestHandler = (req, res, next) => {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return res.status(400).json({ error: `Invalid task id "${req.params.id}" — expected a positive integer` });
  }
  next();
};
