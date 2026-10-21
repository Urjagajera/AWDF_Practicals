import NavBar from './components/NavBar';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Footer from './components/Footer';
import { contacts, profile, projects, skills } from './data/profile';

const sections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function App() {
  return (
    <div className="mx-auto w-[min(1040px,100%-32px)]">
      <NavBar sections={sections} />
      <Header name={profile.name} role={profile.role} focus={profile.focus} themeColor="rgb(var(--rust))" />
      <About bio={profile.bio} education={profile.education} internship={profile.internship} />
      <Skills skillList={skills} />
      <Projects projects={projects} />
      <Footer name={profile.name} links={contacts} />
    </div>
  );
}
