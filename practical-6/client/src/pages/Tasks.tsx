import { useCallback, useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import * as api from '../api';
import type { Task, TaskInput } from '../api';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api.getTasks());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tasks always come from the database on mount — nothing is hardcoded.
  useEffect(() => {
    load();
  }, [load]);

  // Local state changes only after the server confirms each write,
  // and always uses the document the server sent back.
  const create = async (input: TaskInput) => {
    const created = await api.createTask(input);
    setTasks((prev) => [created, ...prev]);
  };

  const update = async (id: string, input: TaskInput) => {
    const updated = await api.updateTask(id, input);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const remove = async (task: Task) => {
    await api.deleteTask(task._id);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  const open = tasks.filter((t) => !t.completed).length;

  return (
    <section className="py-14">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Full stack · React → Express → MongoDB</p>
      <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">Tasks</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Everything here is stored in MongoDB through the Express API — refresh the page and it is all still here.
      </p>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <TaskForm onCreate={create} />

        <div className="rounded-2xl border border-line bg-paper-raised">
          <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">
              {loading ? 'Loading' : `${open} open · ${tasks.length - open} done`}
            </h2>
            <button type="button" onClick={load} className="text-[13px] text-ink-mute hover:text-ink">
              Refresh
            </button>
          </header>
          {loading ? (
            <div className="px-5">
              <Spinner label="Loading tasks…" />
            </div>
          ) : error ? (
            <div className="p-5">
              <ErrorMessage message={error} onRetry={load} />
            </div>
          ) : tasks.length === 0 ? (
            <p className="px-5 py-10 text-ink-mute">No tasks yet — add the first one.</p>
          ) : (
            <ul className="divide-y divide-line">
              {tasks.map((t) => (
                <TaskItem key={t._id} task={t} onUpdate={update} onDelete={remove} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
