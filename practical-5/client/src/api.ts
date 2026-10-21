// In the combined landing app this points at /api/p4; on its own it uses the Vite proxy at /api.
export const BASE_URL: string = import.meta.env.VITE_P5_API_URL ?? '/api';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface LogEntry {
  id: number;
  method: string;
  path: string;
  status: number;
  ms: number;
  body: unknown;
  at: Date;
}

type Listener = (entry: LogEntry) => void;
const listeners = new Set<Listener>();
let seq = 0;

/** Subscribe to every request made through `call` (used by the request log panel). */
export function onLog(fn: Listener) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

interface CallOptions {
  /** Send `body` as-is with this Content-Type instead of JSON (to test the 415 check). */
  contentType?: string;
}

/** fetch wrapper that measures time, parses JSON and reports to the log. Never throws for HTTP errors. */
export async function call<T = unknown>(method: string, path: string, body?: unknown, opts: CallOptions = {}) {
  const headers: Record<string, string> = {};
  let payload: string | undefined;
  if (body !== undefined) {
    headers['Content-Type'] = opts.contentType ?? 'application/json';
    payload = opts.contentType ? String(body) : JSON.stringify(body);
  }

  const t0 = performance.now();
  let status = 0;
  let data: unknown;
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload });
    status = res.status;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  } catch (err) {
    data = { error: `Network error — is the API running? (${(err as Error).message})` };
  }
  const entry: LogEntry = { id: ++seq, method, path, status, ms: performance.now() - t0, body: data, at: new Date() };
  listeners.forEach((fn) => fn(entry));
  return { status, ok: status >= 200 && status < 300, data: data as T };
}
