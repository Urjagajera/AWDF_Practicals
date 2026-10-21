import { useCallback, useEffect, useState } from 'react';
import { call, errorOf, type CacheStats } from '../api';

interface Reading {
  n: number;
  ms: number;
  cache: string | null;
  status: number;
}

interface Run {
  id: number;
  label: string;
  readings: Reading[];
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export default function CacheLab({ onSignOut }: { onSignOut: () => void }) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    const r = await call<CacheStats>('GET', '/debug/cache');
    if (r.status === 401) return onSignOut();
    if (r.ok) setStats(r.data);
  }, [onSignOut]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const act = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setMessage(null);
    try {
      await fn();
    } finally {
      setBusy(null);
      refreshStats();
    }
  };

  // Three GET /tasks in a row, exactly like the lab sheet's Postman readings.
  const benchmark = () =>
    act('bench', async () => {
      const readings: Reading[] = [];
      for (let n = 1; n <= 3; n++) {
        const r = await call<unknown[]>('GET', '/tasks');
        if (!r.ok) return setMessage(errorOf(r));
        readings.push({ n, ms: r.ms, cache: r.cache, status: r.status });
        setCount(r.data.length);
      }
      const label = stats?.enabled === false ? 'Cache off' : 'Cache on';
      setRuns((prev) => [{ id: Date.now(), label, readings }, ...prev].slice(0, 8));
    });

  const toggle = () =>
    act('toggle', async () => {
      const r = await call<CacheStats>('PUT', '/debug/cache', { enabled: !stats?.enabled });
      if (r.ok) setStats(r.data);
    });

  const clear = () =>
    act('clear', async () => {
      await call('DELETE', '/debug/cache');
      setMessage('Cache cleared and counters reset.');
    });

  const seed = () =>
    act('seed', async () => {
      const r = await call<{ added: number; total: number }>('POST', '/debug/seed', { count: 500 });
      if (!r.ok) return setMessage(errorOf(r));
      setCount(r.data.total);
      setMessage(`Added ${r.data.added} sample tasks (${r.data.total} in total). The cached list was invalidated.`);
    });

  // A write followed by a read: the read must be a MISS with the new task in it.
  const writeThenRead = () =>
    act('write', async () => {
      const title = `Invalidation check ${new Date().toLocaleTimeString()}`;
      const w = await call<{ _id: string }>('POST', '/tasks', { title });
      if (!w.ok) return setMessage(errorOf(w));
      const r = await call<{ title: string }[]>('GET', '/tasks');
      const fresh = r.data.some((t) => t.title === title);
      setCount(r.data.length);
      setMessage(`POST /tasks → ${w.status}, then GET /tasks → X-Cache: ${r.cache}. New task in the list: ${fresh ? 'yes' : 'NO — stale!'}`);
    });

  const btn = 'rounded-xl border border-line px-4 py-2.5 text-[14px] font-medium transition hover:border-ink-mute disabled:opacity-50';

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-paper-raised p-5">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Cache</h2>
          {stats ? (
            <>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{stats.enabled ? 'Caching is on' : 'Caching is off'}</p>
                  <p className="text-[13.5px] text-ink-mute">
                    TTL {stats.ttlSeconds} s · {stats.keys} key{stats.keys === 1 ? '' : 's'} stored
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={stats.enabled}
                  onClick={toggle}
                  disabled={busy !== null}
                  className={`relative h-7 w-12 rounded-full transition ${stats.enabled ? 'bg-moss' : 'bg-line'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper-raised shadow transition-all ${stats.enabled ? 'left-6' : 'left-1'}`} />
                  <span className="sr-only">Toggle caching</span>
                </button>
              </div>
              <table className="mt-5 w-full text-[14px]">
                <thead>
                  <tr className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                    <th className="pb-2 font-medium">Route</th>
                    <th className="pb-2 text-right font-medium">Hits</th>
                    <th className="pb-2 text-right font-medium">Misses</th>
                    <th className="pb-2 text-right font-medium">Hit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.routes).map(([route, s]) => (
                    <tr key={route} className="border-t border-line">
                      <td className="py-2 font-mono text-[13px]">{route}</td>
                      <td className="py-2 text-right font-mono">{s.hits}</td>
                      <td className="py-2 text-right font-mono">{s.misses}</td>
                      <td className="py-2 text-right font-mono">{s.hitRate === null ? '—' : `${s.hitRate}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="mt-3 text-[14px] text-ink-mute">Loading…</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-paper-raised p-5">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Actions</h2>
          <p className="mt-2 text-[14px] text-ink-soft">
            Tasks for this account: <b className="font-mono">{count ?? '—'}</b>. With only a few tasks the database is already fast —
            add samples to make the difference visible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={benchmark} disabled={busy !== null} className="rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper hover:bg-rust hover:text-rust-ink disabled:opacity-50">
              {busy === 'bench' ? 'Measuring…' : 'GET /tasks × 3'}
            </button>
            <button type="button" onClick={writeThenRead} disabled={busy !== null} className={btn}>
              Write, then read
            </button>
            <button type="button" onClick={seed} disabled={busy !== null} className={btn}>
              {busy === 'seed' ? 'Adding…' : 'Add 500 sample tasks'}
            </button>
            <button type="button" onClick={clear} disabled={busy !== null} className={btn}>
              Clear cache
            </button>
          </div>
          {message && (
            <p role="status" className="mt-4 rounded-xl bg-paper-sunk px-4 py-3 text-[14px]">
              {message}
            </p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-paper-raised">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Readings</h2>
          {runs.length > 0 && (
            <button type="button" onClick={() => setRuns([])} className="text-[13px] text-ink-mute hover:text-ink">
              Clear
            </button>
          )}
        </header>
        {runs.length === 0 ? (
          <p className="px-5 py-8 text-[14px] text-ink-mute">Press “GET /tasks × 3”. Then switch caching off and measure again to compare.</p>
        ) : (
          <ol className="divide-y divide-line">
            {runs.map((run) => (
              <li key={run.id} className="px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{run.label}</span>
                  <span className="font-mono text-[12.5px] text-ink-mute">avg {avg(run.readings.map((r) => r.ms)).toFixed(1)} ms</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {run.readings.map((r) => (
                    <div key={r.n} className="rounded-xl bg-paper-sunk px-3 py-2.5">
                      <p className="font-mono text-[11px] text-ink-mute">#{r.n}</p>
                      <p className="font-mono text-lg">{r.ms.toFixed(1)} ms</p>
                      <p className={`font-mono text-[12px] font-semibold ${r.cache === 'HIT' ? 'text-moss' : 'text-rust'}`}>{r.cache ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
