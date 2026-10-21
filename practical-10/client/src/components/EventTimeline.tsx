import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { call, errorOf } from '../api';

interface Notification {
  id: number;
  event: 'task-created' | 'task-deleted';
  title: string;
  respondedAt: string;
  handledAt: string;
  status: 'ok' | 'error';
  message: string;
}

interface Action {
  key: string;
  kind: 'create' | 'delete';
  title: string;
  taskId?: string;
  sentAt: number;
  responseMs: number;
  respondedAt?: string;
  status: number;
}

const fmt = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms.toFixed(0)} ms`);

export default function EventTimeline({ onSignOut }: { onSignOut: () => void }) {
  const [title, setTitle] = useState('');
  const [fail, setFail] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const deleted = useRef(new Set<string>());

  const poll = useCallback(async () => {
    const r = await call<Notification[]>('GET', '/events');
    if (r.status === 401) return onSignOut();
    if (r.ok) setNotifications(r.data);
  }, [onSignOut]);

  // Notifications arrive a couple of seconds after the response, so keep checking.
  useEffect(() => {
    poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, [poll]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const t = `${title.trim() || 'Untitled task'}${fail ? ' [fail]' : ''}`;
    setBusy(true);
    setError(null);
    const sentAt = Date.now();
    const r = await call<{ _id: string; title: string }>('POST', '/tasks', { title: t });
    setBusy(false);
    if (!r.ok) return setError(errorOf(r));
    setActions((prev) => [
      { key: `c-${r.data._id}`, kind: 'create', title: r.data.title, taskId: r.data._id, sentAt, responseMs: r.ms, status: r.status },
      ...prev,
    ]);
    setTitle('');
  };

  const remove = async (a: Action) => {
    if (!a.taskId || deleted.current.has(a.taskId)) return;
    deleted.current.add(a.taskId);
    const sentAt = Date.now();
    const r = await call('DELETE', `/tasks/${a.taskId}`);
    if (!r.ok) return setError(errorOf(r));
    setActions((prev) => [{ key: `d-${a.taskId}`, kind: 'delete', title: a.title, sentAt, responseMs: r.ms, status: r.status }, ...prev]);
  };

  /** The notification for an action: same event and title, handled after the request was sent. */
  const matchFor = (a: Action) =>
    notifications.find(
      (n) => n.event === (a.kind === 'create' ? 'task-created' : 'task-deleted') && n.title === a.title && Date.parse(n.handledAt) >= a.sentAt,
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <form onSubmit={create} className="self-start rounded-2xl border border-line bg-paper-raised p-5">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Create a task</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="mt-4 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-rust"
        />
        <label className="mt-3 flex items-center gap-2 text-[14px] text-ink-soft">
          <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--rust))]" />
          Make the notification fail (adds “[fail]” to the title)
        </label>
        {error && (
          <p role="alert" className="mt-3 text-[14px] text-rust">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="mt-4 rounded-xl bg-ink px-5 py-2.5 text-[14.5px] font-semibold text-paper hover:bg-rust hover:text-rust-ink disabled:opacity-50">
          {busy ? 'Sending…' : 'POST /tasks'}
        </button>
        <p className="mt-4 text-[13.5px] text-ink-mute">
          The notification listener takes about 2 seconds. Watch the response arrive first, and the notification follow.
        </p>
      </form>

      <section className="rounded-2xl border border-line bg-paper-raised">
        <header className="border-b border-line px-5 py-3.5">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Timeline</h2>
        </header>
        {actions.length === 0 ? (
          <p className="px-5 py-8 text-[14px] text-ink-mute">Create a task to see the timeline.</p>
        ) : (
          <ol className="divide-y divide-line">
            {actions.map((a) => {
              const n = matchFor(a);
              const notifyMs = n ? Date.parse(n.handledAt) - a.sentAt : null;
              const scale = Math.max(notifyMs ?? 0, 2500);
              return (
                <li key={a.key} className="px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate font-medium">
                      <span className="mr-2 font-mono text-[12px] text-ink-mute">{a.kind === 'create' ? 'POST' : 'DELETE'}</span>
                      {a.title}
                    </p>
                    {a.kind === 'create' && a.taskId && !deleted.current.has(a.taskId) && (
                      <button type="button" onClick={() => remove(a)} className="shrink-0 text-[13px] text-ink-mute hover:text-rust">
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="relative mt-3 h-2 rounded-full bg-paper-sunk" aria-hidden>
                    <span className="absolute top-1/2 h-3.5 w-1 -translate-y-1/2 rounded bg-moss" style={{ left: `${(a.responseMs / scale) * 100}%` }} />
                    {notifyMs !== null && (
                      <span
                        className={`absolute top-1/2 h-3.5 w-1 -translate-y-1/2 rounded ${n?.status === 'error' ? 'bg-rust' : 'bg-ink'}`}
                        style={{ left: `calc(${(notifyMs / scale) * 100}% - 4px)` }}
                      />
                    )}
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
                    <div>
                      <dt className="text-ink-mute">API response</dt>
                      <dd className="font-mono text-moss">
                        {a.status} after {fmt(a.responseMs)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-mute">Notification</dt>
                      <dd className={`font-mono ${n?.status === 'error' ? 'text-rust' : ''}`}>
                        {n ? `${n.status === 'error' ? 'failed' : 'handled'} after ${fmt(notifyMs!)}` : 'running in the background…'}
                      </dd>
                    </div>
                  </dl>
                  {n?.status === 'error' && <p className="mt-1 text-[13px] text-rust">{n.message} — caught by the error listener; the task was still saved.</p>}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
