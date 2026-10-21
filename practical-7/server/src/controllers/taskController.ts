import type { RequestHandler } from 'express';
import { Task } from '../models/Task';

// Every route here runs after `auth`, so req.user is set, and after `validate`, so req.body
// only holds checked fields. Each query is scoped to the logged-in user's own tasks.
// Database failures go to the global error handler with next(err).

const owner = (req: Parameters<RequestHandler>[0]) => req.user!.id;
const notFound = (id: string) => ({ error: `Task ${id} not found` });

// GET /tasks → 200
export const getAllTasks: RequestHandler = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: owner(req) }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id → 200, or 404 when it doesn't exist or belongs to someone else
export const getTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: owner(req) });
    if (!task) return res.status(404).json(notFound(req.params.id));
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// POST /tasks → 201
export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: owner(req) });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// PUT /tasks/:id → 200, or 404
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: owner(req) }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json(notFound(req.params.id));
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id → 200 with the removed task, or 404
export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: owner(req) });
    if (!task) return res.status(404).json(notFound(req.params.id));
    res.status(200).json({ message: 'Task deleted', task });
  } catch (err) {
    next(err);
  }
};
