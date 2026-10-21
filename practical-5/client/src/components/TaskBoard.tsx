import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { call, PRIORITIES, type Priority, type Task } from '../api';

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await call<Task[]>('GET', '/tasks');
    if (res.ok) {
      setTasks(res.data);
      setError(null);
    } else setError((res.data as unknown as { error: string })?.error ?? 'Could not load tasks');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const res = await call('POST', '/tasks', { title, description, priority });
    if (res.ok) {
      setTitle('');
      setDescription('');
      load();
    }
  };

  const toggle = async (t: Task) => {
    const res = await call('PUT', `/tasks/${t._id}`, { completed: !t.completed });
    if (res.ok) load();
  };

  const remove = async (t: Task) => {
    const res = await call('DELETE', `/tasks/${t._id}`);
    if (res.ok) load();
  };

  return (
    <section className="rounded-2xl border border-line bg-paper-raised">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Tasks · {tasks.length}</h2>
        <button type="button" onClick={load} className="text-[13px] text-ink-mute hover:text-ink">
          Refresh
        </button>
      </header>

      <form onSubmit={create} className="grid gap-2 border-b border-line p-5 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14.5px] outline-none focus:border-rust"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14.5px] outline-none focus:border-rust"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          aria-label="Priority"
          className="rounded-xl border border-line bg-paper px-3 py-2.5 text-[14.5px] outline-none focus:border-rust"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper hover:bg-rust hover:text-rust-ink">
          POST
        </button>
      </form>

      {error && <p className="border-b border-line bg-rust-soft/60 px-5 py-3 text-[14px] text-rust">{error}</p>}

      <ul className="divide-y divide-line">
        {tasks.map((t) => (
          <li key={t._id} className="flex items-start gap-3 px-5 py-3.5">
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggle(t)}
              aria-label={`Mark "${t.title}" ${t.completed ? 'not done' : 'done'}`}
              className="mt-1 h-4 w-4 accent-[rgb(var(--rust))]"
            />
            <div className="min-w-0 flex-1">
              <p className={`font-medium ${t.completed ? 'text-ink-mute line-through' : ''}`}>{t.title}</p>
              {t.description && <p className="text-[14px] text-ink-soft">{t.description}</p>}
              <p className="mt-1 flex items-center gap-2 font-mono text-[11.5px] text-ink-mute">
                <span className={`rounded px-1.5 py-px uppercase ${t.priority === 'high' ? 'bg-rust-soft text-rust' : 'bg-paper-sunk'}`}>
                  {t.priority}
                </span>
                <button type="button" onClick={() => call('GET', `/tasks/${t._id}`)} className="hover:text-ink" title="GET /tasks/:id">
                  #{t._id.slice(-6)}
                </button>
              </p>
            </div>
            <button type="button" onClick={() => remove(t)} className="text-[13px] text-ink-mute hover:text-rust">
              DELETE
            </button>
          </li>
        ))}
        {tasks.length === 0 && !error && <li className="px-5 py-8 text-[14px] text-ink-mute">No tasks yet.</li>}
      </ul>
    </section>
  );
}
