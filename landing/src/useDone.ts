import { useCallback, useState } from 'react';

const KEY = 'awdf-done';

function read(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as number[]);
  } catch {
    return new Set();
  }
}

/** Per-browser "I've finished this one" checklist for the landing grid. */
export function useDone() {
  const [done, setDone] = useState(read);

  const toggle = useCallback((n: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return { done, toggle };
}
