import { Link, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { REPO_URL } from '../components/TopBar';
import { pad, practicals } from '../data/practicals';
import { registry } from '../registry';
import NotFound from './NotFound';

const rubric: [string, number, string][] = [
  ['Conceptual understanding', 2, 'Explains what and why, not just what was done'],
  ['Implementation', 4, 'Code written, runs, and is original'],
  ['Correctness', 2, 'Output matches expected result'],
  ['Reflection', 1, 'Errors documented and explained'],
  ['Lab file evidence', 1, 'Completeness and presentation'],
];

export default function Brief() {
  const n = Number(useParams().n);
  const info = practicals.find((p) => p.n === n);
  if (!info) return <NotFound />;

  const prev = practicals.find((p) => p.n === n - 1);
  const next = practicals.find((p) => p.n === n + 1);
  const live = Boolean(registry[n]);
  const folder = `practical-${n}`;

  return (
    <>
      <TopBar />
      <main className="mx-auto w-[min(1160px,100%-32px)] pb-24">
        <section className="border-b border-line pb-10 pt-12">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-ink-mute">
            <Link to="/" className="text-rust">
              All practicals
            </Link>{' '}
            / {info.track}
          </p>
          <div className="mt-7 grid items-end gap-x-7 gap-y-2 sm:grid-cols-[auto_1fr]">
            <span className="font-serif text-[clamp(76px,12vw,148px)] font-light leading-[0.82] tracking-[-0.05em] text-rust">
              {pad(n)}
            </span>
            <h1 className="max-w-[22ch] font-serif text-[clamp(28px,4.2vw,46px)] font-medium leading-[1.08] tracking-[-0.02em]">
              {info.title}
            </h1>
          </div>
          <p className="mt-7 max-w-[64ch] text-[19px] text-ink-soft">{info.objective}</p>
          <div className="mt-7 flex flex-wrap gap-2.5 text-[13px] text-ink-soft">
            <span className="rounded-lg border border-line bg-paper-raised px-3 py-2">
              <b className="mr-1 font-semibold text-ink">CO/PO</b>
              {info.co}
            </span>
            <span className="rounded-lg border border-line bg-paper-raised px-3 py-2">
              <b className="mr-1 font-semibold text-ink">Lab</b>2 h
            </span>
            <span className="rounded-lg border border-line bg-paper-raised px-3 py-2">
              <b className="mr-1 font-semibold text-ink">Folder</b>
              <code className="font-mono">{folder}/</code>
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {live && (
              <a
                href={`/practical-${n}`}
                className="rounded-xl bg-ink px-5 py-3 text-[14.5px] font-semibold text-paper transition hover:bg-rust hover:text-rust-ink"
              >
                Open live practical →
              </a>
            )}
            <a
              href={`${REPO_URL}/tree/main/${folder}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-paper-raised px-5 py-3 text-[14.5px] font-semibold transition hover:border-ink-mute"
            >
              Source &amp; README
            </a>
          </div>
          {!live && (
            <p className="mt-4 text-[14px] text-ink-mute">
              {info.parts.includes('client')
                ? 'The live demo appears here once this practical is built.'
                : 'This practical has no UI of its own — its work runs on the server and in GitHub Actions. See the README.'}
            </p>
          )}
        </section>

        <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section>
            <h2 className="font-serif text-[28px] font-medium tracking-tight">Problem statement</h2>
            <ol className="mt-5 space-y-3">
              {info.problem.map((line, i) => (
                <li
                  key={line}
                  className="grid grid-cols-[34px_1fr] gap-3 rounded-xl border border-line bg-paper-raised px-4 py-3.5 text-ink-soft"
                >
                  <span className="font-mono text-[13px] font-semibold leading-relaxed text-rust">{pad(i + 1)}</span>
                  {line}
                </li>
              ))}
            </ol>
          </section>
          <aside className="space-y-8">
            <section>
              <h2 className="font-serif text-[28px] font-medium tracking-tight">Skills</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {info.skills.map((s) => (
                  <li key={s} className="rounded-full border border-line bg-paper-raised px-3 py-1.5 text-[13.5px] text-ink-soft">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-[28px] font-medium tracking-tight">Rubric</h2>
              <table className="mt-5 w-full overflow-hidden rounded-xl border border-line bg-paper-raised text-[14px]">
                <tbody>
                  {rubric.map(([c, m, d]) => (
                    <tr key={c} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <span className="block font-medium">{c}</span>
                        <span className="text-[13px] text-ink-mute">{d}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-rust">{m}</td>
                    </tr>
                  ))}
                  <tr className="bg-paper-sunk font-semibold">
                    <td className="px-4 py-3">Total · pass at 5</td>
                    <td className="px-4 py-3 text-right font-mono">10</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </aside>
        </div>

        <nav className="mt-16 grid gap-3.5 sm:grid-cols-2">
          {prev ? (
            <Link to={`/brief/${prev.n}`} className="rounded-2xl border border-line bg-paper-raised p-5 transition hover:border-rust">
              <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">← Practical {pad(prev.n)}</span>
              <b className="mt-2 block font-serif text-[17px] font-medium">{prev.title}</b>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/brief/${next.n}`}
              className="rounded-2xl border border-line bg-paper-raised p-5 text-right transition hover:border-rust"
            >
              <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">Practical {pad(next.n)} →</span>
              <b className="mt-2 block font-serif text-[17px] font-medium">{next.title}</b>
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}
