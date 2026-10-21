import { useCallback, useState } from 'react';
import SignIn from './components/SignIn';
import EventTimeline from './components/EventTimeline';
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
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-rust">Practical 10 · EventEmitter</p>
          <h1 className="mt-3 font-serif text-[clamp(32px,5vw,52px)] font-medium leading-tight tracking-tight">Event timeline</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Creating a task responds straight away; a task-created event is handled afterwards by a background listener.
            Each row shows both moments.
          </p>
          <p className="mt-2 font-mono text-[12.5px] text-ink-mute">API: {BASE_URL}</p>
        </div>
        {signedIn && (
          <button type="button" onClick={signOut} className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-soft hover:border-ink-mute">
            Log out
          </button>
        )}
      </div>
      <div className="mt-10">{signedIn ? <EventTimeline onSignOut={signOut} /> : <SignIn onSignedIn={() => setSignedIn(true)} />}</div>
    </main>
  );
}
