import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoList, { type Repo } from './RepoList';

const USERNAME = 'Urjagajera';

export default function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // Bumping this re-runs the effect, which is how "Try again" re-triggers the fetch.
  const [attempt, setAttempt] = useState(0);

  // Runs after the first render and again only when `attempt` changes — not on every render.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`, { signal: controller.signal })
      .then((res) => {
        // fetch only rejects on network failure, so HTTP errors (404, rate limit) are thrown here.
        if (!res.ok) throw new Error(`GitHub responded with ${res.status} ${res.statusText}`);
        return res.json() as Promise<Repo[]>;
      })
      .then((data) => setRepos(data))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Cancels the request if the component unmounts (or retries) before it finishes.
    return () => controller.abort();
  }, [attempt]);

  if (loading) return <Spinner label={`Fetching ${USERNAME}’s repositories…`} />;
  if (error) return <ErrorMessage message={error} onRetry={() => setAttempt((a) => a + 1)} />;

  const q = query.trim().toLowerCase();
  const shown = q ? repos.filter((r) => r.name.toLowerCase().includes(q)) : repos;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name…"
          aria-label="Filter repositories by name"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper-raised px-4 py-2.5 outline-none transition focus:border-rust"
        />
        <span className="font-mono text-[12.5px] text-ink-mute">
          {shown.length} of {repos.length}
        </span>
      </div>
      <RepoList data={shown} />
    </div>
  );
}
