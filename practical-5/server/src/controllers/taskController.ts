import type { RequestHandler } from 'express';
import { Task } from '../models/Task';

// Every handler is async: database calls are wrapped in try/catch and failures go to the
// global error handler with next(err), which turns them into clean JSON responses.

// GET /tasks → 200
export const getAllTasks: RequestHandler = async (_req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// POST /tasks → 201, or 400 from schema validation
export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;
    const task = await Task.create({ title, description, completed });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// PUT /tasks/:id → 200, or 404 when the task does not exist
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      // Return the updated document and apply schema validation to the update too.
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ error: `Task ${req.params.id} not found` });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id → 200 with the removed task, or 404
export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: `Task ${req.params.id} not found` });
    res.status(200).json({ message: 'Task deleted', task });
  } catch (err) {
    next(err);
  }
};
