export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

// In-memory storage: lives only as long as the process (a database replaces it in Practical 5).
export const tasks: Task[] = [
  { id: 1, title: 'Set up Express server', description: 'Install express and create server.ts', completed: true, createdAt: new Date().toISOString() },
  { id: 2, title: 'Write CRUD routes', description: 'GET, POST, PUT and DELETE /tasks', completed: false, createdAt: new Date().toISOString() },
];

let nextId = tasks.length + 1;
export const newId = () => nextId++;
