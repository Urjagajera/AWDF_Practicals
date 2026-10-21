import { useState, type FormEvent } from 'react';
import { call, errorOf, token } from '../api';

/** Practical 7's login, reduced to what the event timeline needs: an account with a token. */
export default function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent, mode: 'login' | 'register') => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (mode === 'register') {
      const r = await call('POST', '/auth/register', { email, password });
      if (!r.ok) {
        setBusy(false);
        const fields = (r.data as { fields?: Record<string, string> })?.fields;
        return setError(fields ? Object.values(fields).join(', ') : errorOf(r));
      }
    }
    const r = await call<{ token: string }>('POST', '/auth/login', { email, password });
    setBusy(false);
    if (!r.ok) return setError(errorOf(r));
    token.set(r.data.token);
    onSignedIn();
  };

  const field = 'mt-2 w-full rounded-xl border border-line bg-paper-raised px-4 py-3 outline-none focus:border-rust';

  return (
    <form onSubmit={(e) => submit(e, 'login')} className="max-w-md rounded-2xl border border-line bg-paper-raised p-6">
      <h2 className="font-serif text-2xl font-medium">Sign in to start</h2>
      <p className="mt-1 text-[14px] text-ink-soft">Task routes need a token (Practical 7). Notifications are shown per account.</p>
      <label className="mt-5 block text-[14px] font-medium">
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" />
      </label>
      <label className="mt-4 block text-[14px] font-medium">
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} autoComplete="current-password" />
      </label>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-rust">
          {error}
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={busy} className="rounded-xl bg-ink px-5 py-2.5 text-[14.5px] font-semibold text-paper hover:bg-rust hover:text-rust-ink disabled:opacity-50">
          Log in
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => submit(e, 'register')}
          className="rounded-xl border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:border-ink-mute disabled:opacity-50"
        >
          Register
        </button>
      </div>
    </form>
  );
}
