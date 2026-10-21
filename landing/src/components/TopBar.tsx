import type { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';

export const REPO_URL = 'https://github.com/Urjagajera/AWDF_Practicals';

/** Sticky bar shared by the landing pages and the practical host. Uses plain anchors so it works outside any router. */
export default function TopBar({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-[min(1160px,100%-32px)] items-center gap-4">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-mono text-[12px] font-semibold text-paper">
            AW
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold tracking-tight">AWDF Practicals</span>
            <span className="hidden text-[11.5px] text-ink-mute sm:block">ITUE301 · CHARUSAT</span>
          </span>
        </a>
        <div className="min-w-0 flex-1">{children}</div>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-lg px-2.5 py-1.5 text-[13.5px] text-ink-soft hover:bg-paper-sunk hover:text-ink sm:block"
        >
          GitHub
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
