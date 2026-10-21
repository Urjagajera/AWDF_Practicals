import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import Contact from './pages/Contact';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import ThemeToggle from './components/ThemeToggle';
import { ToastProvider } from './components/Toast';
import { contacts, profile } from './data/profile';

export default function App() {
  return (
    <ToastProvider>
      <div className="mx-auto w-[min(1040px,100%-32px)]">
        <NavBar>
          <ThemeToggle />
        </NavBar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer name={profile.name} links={contacts} />
      </div>
    </ToastProvider>
  );
}
