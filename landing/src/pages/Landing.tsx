import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { pad, practicals, tracks, type Track } from '../data/practicals';
import { registry } from '../registry';
import { useDone } from '../useDone';

export default function Landing() {
  const [filter, setFilter] = useState<Track | 'All'>('All');
  const { done, toggle } = useDone();
  const shown = useMemo(
    () => practicals.filter((p) => filter === 'All' || p.track === filter),
    [filter],
  );

  return (
    <>
      <TopBar />
      <main className="mx-auto w-[min(1160px,100%-32px)]">
        <section className="pb-10 pt-16 sm:pt-20">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-rust">
            CHARUSAT · B.Tech CSE · Semester 5
          </p>
          <h1 className="mt-5 max-w-[15ch] font-serif text-[clamp(40px,6.6vw,78px)] font-normal leading-[1.02] tracking-[-0.025em]">
            Thirteen practicals, <em className="text-rust">one</em> growing task app.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg text-ink-soft">
            Advanced Web Development Frameworks (ITUE301). From a first React component to a containerised,
            tested, AI-assisted full-stack app — every practical is a working snapshot you can open and run.
          </p>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-6">
            {[
              ['Student', 'Urja Gajera'],
              ['Roll no', '24CS021'],
              ['Practicals', String(practicals.length)],
              ['Completed', `${done.size} / ${practicals.length}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[13px] text-ink-mute">{k}</dt>
                <dd className="font-serif text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by track">
          {(['All', ...tracks] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filter === t}
              onClick={() => setFilter(t)}
              className="rounded-full border border-line bg-paper-raised px-3.5 py-2 text-[13px] font-medium text-ink-soft transition hover:border-ink-mute hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
            >
              {t}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 pb-24">
          {shown.map((p) => {
            const isDone = done.has(p.n);
            const live = Boolean(registry[p.n]);
            return (
              <li key={p.n} className="relative">
                <Link
                  to={`/brief/${p.n}`}
                  className="group flex h-full min-h-[236px] flex-col rounded-2xl border border-line bg-paper-raised p-[22px] transition duration-200 hover:-translate-y-0.5 hover:border-rust/40 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
                >
                  <div className="flex items-baseline justify-between gap-3 pr-9">
                    <span
                      className={`font-serif text-[44px] leading-none tracking-[-0.03em] ${
                        isDone ? 'text-ink-mute line-through decoration-rust decoration-2' : ''
                      }`}
                    >
                      {pad(p.n)}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">{p.track}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight">{p.title}</h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{p.summary}</p>
                  <div className="mt-auto flex items-center gap-2 pt-5 text-[12.5px] text-ink-mute">
                    <span className="font-mono">{p.co.split(' / ')[0]}</span>
                    <span aria-hidden>·</span>
                    <span>{live ? 'Live demo' : p.parts.includes('client') ? 'Coming up' : 'Server + CI'}</span>
                    <span className="ml-auto text-[13px] font-semibold text-rust transition group-hover:translate-x-0.5">
                      Open →
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(p.n)}
                  aria-pressed={isDone}
                  aria-label={`Mark practical ${p.n} ${isDone ? 'not done' : 'done'}`}
                  className={`absolute right-[18px] top-[18px] grid h-[26px] w-[26px] place-items-center rounded-lg border transition ${
                    isDone ? 'border-rust bg-rust text-rust-ink' : 'border-line bg-paper-raised text-transparent hover:border-ink-mute'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="border-t border-line py-8 text-[13px] text-ink-mute">
        <div className="mx-auto flex w-[min(1160px,100%-32px)] flex-wrap justify-between gap-3">
          <span>Urja Gajera · 24CS021 · CSPIT, CHARUSAT</span>
          <span>React 18 · Express 4 · MongoDB · Docker · GitHub Actions · Gemini</span>
        </div>
      </footer>
    </>
  );
}
