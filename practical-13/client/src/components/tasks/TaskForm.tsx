import { useState, type FormEvent } from 'react';
import { PRIORITIES, type Priority, type TaskInput } from '../../api';

interface TaskFormProps {
  /** Resolves when the server confirmed the task; rejects with the server's message. */
  onCreate: (input: TaskInput) => Promise<void>;
}

export default function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onCreate({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const field = 'rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14.5px] outline-none transition focus:border-rust';

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-paper-raised p-5">
      <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">New task</h2>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" className={field} />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority" className={field}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} priority
            </option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details (optional)"
          rows={2}
          className={`${field} resize-y sm:col-span-2`}
        />
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-rust">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-xl bg-ink px-5 py-2.5 text-[14.5px] font-semibold text-paper transition hover:bg-rust hover:text-rust-ink disabled:opacity-50"
      >
        {saving ? 'Adding…' : 'Add task'}
      </button>
    </form>
  );
}
