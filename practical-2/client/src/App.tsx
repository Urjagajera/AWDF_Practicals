import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import Contact from './pages/Contact';
import { contacts, profile } from './data/profile';

export default function App() {
  return (
    <div className="mx-auto w-[min(1040px,100%-32px)]">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer name={profile.name} links={contacts} />
    </div>
  );
}
