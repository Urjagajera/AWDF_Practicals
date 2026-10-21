import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Brief from './pages/Brief';
import PracticalHost from './pages/PracticalHost';
import NotFound from './pages/NotFound';
import { registry } from './registry';

export default function App() {
  // /practical-N/* belongs to that practical's own router (with basename),
  // so it is decided before the landing router is created.
  const match = window.location.pathname.match(/^\/practical-(\d+)(?:\/|$)/);
  const n = match ? Number(match[1]) : null;
  if (n !== null && registry[n]) return <PracticalHost n={n} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/brief/:n" element={<Brief />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
