import { Component, Suspense, lazy, useMemo, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { pad, practicals } from '../data/practicals';
import { registry } from '../registry';

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto my-16 w-[min(640px,100%-32px)] rounded-2xl border border-line bg-paper-raised p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-rust">Something broke</p>
        <p className="mt-2 text-ink-soft">{this.state.error.message}</p>
      </div>
    );
  }
}

export default function PracticalHost({ n }: { n: number }) {
  const info = practicals.find((p) => p.n === n)!;
  const PracticalApp = useMemo(() => lazy(registry[n]), [n]);

  return (
    <>
      <TopBar>
        <div className="flex min-w-0 items-center gap-3 border-l border-line pl-4 text-[13.5px]">
          <span className="font-mono text-rust">P{pad(n)}</span>
          <span className="hidden truncate text-ink-soft md:inline">{info.title}</span>
          <a href={`/brief/${n}`} className="ml-auto shrink-0 rounded-lg px-2.5 py-1.5 text-ink-soft hover:bg-paper-sunk hover:text-ink">
            Brief
          </a>
        </div>
      </TopBar>
      <Boundary>
        <Suspense
          fallback={<p className="mx-auto mt-24 w-fit font-mono text-sm text-ink-mute">Loading practical {pad(n)}…</p>}
        >
          <BrowserRouter basename={`/practical-${n}`}>
            <PracticalApp />
          </BrowserRouter>
        </Suspense>
      </Boundary>
    </>
  );
}
