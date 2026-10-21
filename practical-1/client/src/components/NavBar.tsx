import { useEffect, useState } from 'react';

interface NavBarProps {
  sections: { id: string; label: string }[];
}

/** Sticky in-page navigation that highlights whichever section is currently on screen. */
export default function NavBar({ sections }: NavBarProps) {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      // A section counts as active once it crosses the upper third of the viewport.
      { rootMargin: '-30% 0px -65% 0px' },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="sticky top-0 z-20 -mx-4 border-b border-line bg-paper/85 px-4 backdrop-blur">
      <ul className="flex h-14 items-center gap-1 overflow-x-auto text-[14px]">
        <li className="mr-auto font-serif text-lg">
          <a href="#top">UG.</a>
        </li>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'true' : undefined}
              className="rounded-lg px-3 py-1.5 text-ink-soft transition hover:text-ink aria-[current]:bg-ink aria-[current]:text-paper"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
