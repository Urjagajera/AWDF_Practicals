import { useEffect, useState } from 'react';
import { onLog, type LogEntry } from '../api';

const statusTone = (s: number) =>
  s >= 200 && s < 300 ? 'bg-moss/15 text-moss' : s === 0 ? 'bg-paper-sunk text-ink-mute' : 'bg-rust-soft text-rust';

/** Live list of every request the page made, newest first — a small in-browser Postman. */
export default function RequestLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => onLog((e) => setEntries((prev) => [e, ...prev].slice(0, 40))), []);

  return (
    <section className="rounded-2xl border border-line bg-paper-raised">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-mute">Request log</h2>
        {entries.length > 0 && (
          <button type="button" onClick={() => setEntries([])} className="text-[13px] text-ink-mute hover:text-ink">
            Clear
          </button>
        )}
      </header>
      {entries.length === 0 ? (
        <p className="px-5 py-8 text-[14px] text-ink-mute">Requests appear here as you use the page.</p>
      ) : (
        <ol className="max-h-[620px] divide-y divide-line overflow-y-auto">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setOpen(open === e.id ? null : e.id)}
                aria-expanded={open === e.id}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-paper-sunk/60"
              >
                <span className="w-14 shrink-0 font-mono text-[12px] font-semibold">{e.method}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-soft">{e.path}</span>
                <span className={`rounded-md px-2 py-0.5 font-mono text-[12px] font-semibold ${statusTone(e.status)}`}>
                  {e.status || 'ERR'}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-[12px] text-ink-mute">{e.ms.toFixed(0)} ms</span>
              </button>
              {open === e.id && (
                <pre className="mx-5 mb-4 max-h-72 overflow-auto rounded-xl bg-code p-4 font-mono text-[12.5px] leading-relaxed text-code-ink">
                  {JSON.stringify(e.body, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
