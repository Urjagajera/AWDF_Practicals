import { EventEmitter } from 'node:events';

export interface TaskEventPayload {
  task: { _id: string; title: string; priority: string };
  /** Email of the user who made the change. */
  user: string;
  /** When the API sent its response, so listeners can show the ordering. */
  respondedAt: string;
}

/** Typed event names and payloads for the task event bus. */
interface TaskEventMap {
  'task-created': [TaskEventPayload];
}

/** One shared emitter for task events — Node's built-in module, no queue infrastructure. */
class TaskEvents extends EventEmitter<TaskEventMap> {}

export const taskEvents = new TaskEvents();
