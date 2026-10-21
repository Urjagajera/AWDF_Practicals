// Calls the Practical 10 API directly (CORS is enabled there);
// inside the combined landing app it is pointed at /api/p10 instead.
export const BASE_URL: string = import.meta.env.VITE_P10_API_URL ?? 'http://localhost:5000';

const TOKEN_KEY = 'awdf-p10-token';

export const token = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (value: string | null) => {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export interface Timed<T> {
  status: number;
  ok: boolean;
  ms: number;
  cache: string | null;
  data: T;
}

/** fetch with the Bearer token, timing and the X-Cache header. Never throws for HTTP errors. */
export async function call<T = unknown>(method: string, path: string, body?: unknown): Promise<Timed<T>> {
  const headers: Record<string, string> = {};
  const t = token.get();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const t0 = performance.now();
  try {
    const res = await fetch(BASE_URL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, ms: performance.now() - t0, cache: res.headers.get('X-Cache'), data };
  } catch {
    return {
      status: 0,
      ok: false,
      ms: performance.now() - t0,
      cache: null,
      data: { error: 'Cannot reach the server — is the backend running on port 5000?' } as T,
    };
  }
}

export interface CacheStats {
  enabled: boolean;
  ttlSeconds: number;
  keys: number;
  routes: Record<string, { hits: number; misses: number; hitRate: number | null }>;
}

export const errorOf = (r: Timed<unknown>) => (r.data as { error?: string } | null)?.error ?? `Request failed (${r.status})`;
