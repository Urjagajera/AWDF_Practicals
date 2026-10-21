import { useCallback, useState } from 'react';
import SignIn from './components/SignIn';
import CacheLab from './components/CacheLab';
import { BASE_URL, token } from './api';

export default function App() {
  const [signedIn, setSignedIn] = useState(() => token.get() !== null);

  const signOut = useCallback(() => {
    token.set(null);
    setSignedIn(false);
  }, []);

  return (
    <main className="mx-auto w-[min(1160px,100%-32px)] py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-rust">Practical 09 · node-cache</p>
          <h1 className="mt-3 font-serif text-[clamp(32px,5vw,52px)] font-medium leading-tight tracking-tight">Cache lab</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            GET /tasks is cached in memory for 60 seconds and dropped on every write. Measure it with the cache on and off,
            and watch the X-Cache header switch between MISS and HIT.
          </p>
          <p className="mt-2 font-mono text-[12.5px] text-ink-mute">API: {BASE_URL}</p>
        </div>
        {signedIn && (
          <button type="button" onClick={signOut} className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-soft hover:border-ink-mute">
            Log out
          </button>
        )}
      </div>
      <div className="mt-10">{signedIn ? <CacheLab onSignOut={signOut} /> : <SignIn onSignedIn={() => setSignedIn(true)} />}</div>
    </main>
  );
}
