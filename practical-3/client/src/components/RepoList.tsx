export interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

export default function RepoList({ data }: { data: Repo[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-ink-mute">No repositories to show.</p>;
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper-raised">
      {data.map((repo) => (
        <li key={repo.id} className="p-5">
          <div className="flex items-start gap-4">
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="group min-w-0 flex-1">
              <span className="font-semibold group-hover:text-rust">{repo.name}</span>
              <span className="mt-0.5 block truncate font-mono text-[12.5px] text-ink-mute">{repo.html_url}</span>
            </a>
            <span className="shrink-0 font-mono text-[13px] text-ink-soft" title={`${repo.stargazers_count} stars`}>
              ★ {repo.stargazers_count}
            </span>
          </div>
          {repo.description && <p className="mt-2 text-[14.5px] text-ink-soft">{repo.description}</p>}
          {repo.language && <p className="mt-2 font-mono text-[12px] text-ink-mute">{repo.language}</p>}
        </li>
      ))}
    </ul>
  );
}
