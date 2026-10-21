import type { RequestHandler } from 'express';
import { newId, tasks, type Task } from '../data/taskStore';

const findIndex = (id: string) => tasks.findIndex((t) => t.id === Number(id));

// GET /tasks → 200
export const getAllTasks: RequestHandler = (_req, res) => {
  res.status(200).json(tasks);
};

// POST /tasks → 201, or 400 when the title is missing
export const createTask: RequestHandler = (req, res) => {
  const { title, description = '', completed = false } = req.body ?? {};
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  const task: Task = {
    id: newId(),
    title: title.trim(),
    description: String(description),
    completed: Boolean(completed),
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
};

// PUT /tasks/:id → 200, or 404 when the task does not exist
export const updateTask: RequestHandler = (req, res) => {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ error: `Task ${req.params.id} not found` });

  const { title, description, completed } = req.body ?? {};
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  tasks[i] = {
    ...tasks[i],
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: String(description) }),
    ...(completed !== undefined && { completed: Boolean(completed) }),
  };
  res.status(200).json(tasks[i]);
};

// DELETE /tasks/:id → 200 with the removed task, or 404
export const deleteTask: RequestHandler = (req, res) => {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ error: `Task ${req.params.id} not found` });
  const [removed] = tasks.splice(i, 1);
  res.status(200).json({ message: 'Task deleted', task: removed });
};
