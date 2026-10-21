import Projects from '../components/Projects';
import GitHubRepos from '../components/GitHubRepos';
import { projects } from '../data/profile';

export default function ProjectsPage() {
  return (
    <div className="pt-6">
      <Projects projects={projects} />
      <section className="border-t border-line py-16 sm:py-20">
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <header>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">04 · Live</p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight">On GitHub</h2>
            <p className="mt-3 text-[14px] text-ink-mute">Fetched from the GitHub REST API each time this page opens.</p>
          </header>
          <GitHubRepos />
        </div>
      </section>
    </div>
  );
}
