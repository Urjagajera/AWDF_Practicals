import { taskEvents } from './events';

/**
 * Registers the background listeners. Imported once from app.ts so the `.on()` calls run at
 * startup — before any event can be emitted.
 */
let registered = false;

export function registerListeners() {
  if (registered) return;
  registered = true;

  taskEvents.on('task-created', ({ task, user, respondedAt }) => {
    // emit() calls listeners synchronously, inside the request handler. Deferring the work with
    // setImmediate lets the handler return and Node flush the response before the notification runs.
    setImmediate(() => {
      console.log(
        `[Notification] Task "${task.title}" created by ${user} at ${new Date().toISOString()} (API responded at ${respondedAt})`,
      );
    });
  });
}
