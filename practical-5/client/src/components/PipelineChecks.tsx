import { call } from '../api';

interface Check {
  label: string;
  expect: number;
  run: () => Promise<unknown>;
}

// Each button sends one request that a specific part of the middleware pipeline should stop.
const checks: Check[] = [
  { label: 'POST without a title', expect: 400, run: () => call('POST', '/tasks', { description: 'no title' }) },
  { label: 'POST as text/plain', expect: 415, run: () => call('POST', '/tasks', 'title=hi', { contentType: 'text/plain' }) },
  { label: 'POST priority "urgent"', expect: 400, run: () => call('POST', '/tasks', { title: 'x', priority: 'urgent' }) },
  { label: 'GET unknown ObjectId', expect: 404, run: () => call('GET', '/tasks/000000000000000000000000') },
  { label: 'PUT /tasks/abc', expect: 400, run: () => call('PUT', '/tasks/abc', { completed: true }) },
  { label: 'DELETE unknown ObjectId', expect: 404, run: () => call('DELETE', '/tasks/000000000000000000000000') },
  { label: 'GET /unknown-route', expect: 404, run: () => call('GET', '/unknown-route') },
  { label: 'GET /boom (thrown error)', expect: 500, run: () => call('GET', '/boom') },
];

export default function PipelineChecks() {
  return (
    <section className="rounded-2xl border border-line bg-paper-raised p-5">
      <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Try the pipeline</h2>
      <p className="mt-1 text-[14px] text-ink-soft">Each request should be stopped with the status shown.</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.label}>
            <button
              type="button"
              onClick={c.run}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left text-[14px] transition hover:border-ink-mute"
            >
              <span>{c.label}</span>
              <span className="font-mono text-[12px] text-rust">{c.expect}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
