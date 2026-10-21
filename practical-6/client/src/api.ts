// One place for the backend URL — every request in the app goes through this file.
// On its own the client calls the Express server directly (CORS is enabled there);
// inside the combined landing app it is pointed at /api/p6 instead.
export const BASE_URL: string = import.meta.env.VITE_P6_API_URL ?? 'http://localhost:5000';

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
}

export type TaskInput = Partial<Pick<Task, 'title' | 'description' | 'completed' | 'priority'>>;

/** Turns any failed response into an Error carrying the server's message. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server — is the backend running on port 5000?');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fields = data?.fields ? ` (${Object.values(data.fields).join(', ')})` : '';
    throw new Error(`${data?.error ?? `Request failed with ${res.status}`}${fields}`);
  }
  return data as T;
}

export const getTasks = () => request<Task[]>('/tasks');

export const createTask = (input: TaskInput) =>
  request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) });

export const updateTask = (id: string, input: TaskInput) =>
  request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteTask = (id: string) => request<{ message: string; task: Task }>(`/tasks/${id}`, { method: 'DELETE' });
