import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoList, { type Repo } from './RepoList';

const USERNAME = 'Urjagajera';

export default function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runs once after the first render ([] dependency array), not on every render.
  useEffect(() => {
    const controller = new AbortController();

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

    // Cancels the request if the component unmounts before it finishes.
    return () => controller.abort();
  }, []);

  if (loading) return <Spinner label={`Fetching ${USERNAME}’s repositories…`} />;
  if (error) return <ErrorMessage message={error} />;
  return <RepoList data={repos} />;
}
