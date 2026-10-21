import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import Contact from './pages/Contact';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ThemeToggle from './components/ThemeToggle';
import AccountMenu from './components/AccountMenu';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import { contacts, profile } from './data/profile';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="mx-auto w-[min(1040px,100%-32px)]">
          <NavBar>
            <div className="flex items-center gap-2">
              <AccountMenu />
              <ThemeToggle />
            </div>
          </NavBar>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route
              path="/tasks"
              element={
                <RequireAuth>
                  <Tasks />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer name={profile.name} links={contacts} />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
