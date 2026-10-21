import { Schema, type InferSchemaType } from 'mongoose';
import { db } from '../db';

const taskSchema = new Schema({
  title: { type: String, required: [true, 'title is required'] },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export type TaskDoc = InferSchemaType<typeof taskSchema>;

export const Task = db.model('Task', taskSchema);
