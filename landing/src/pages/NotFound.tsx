import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-[min(1160px,100%-32px)] py-28">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-rust">404</p>
        <h1 className="mt-4 font-serif text-5xl font-medium tracking-tight">Nothing lives here.</h1>
        <Link to="/" className="mt-8 inline-block text-rust underline-offset-4 hover:underline">
          Back to all practicals
        </Link>
      </main>
    </>
  );
}
