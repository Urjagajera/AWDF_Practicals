import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Footer from './components/Footer';
import { contacts, profile, skills } from './data/profile';

export default function App() {
  return (
    <div className="mx-auto w-[min(1040px,100%-32px)]">
      <Header name={profile.name} role={profile.role} focus={profile.focus} />
      <About bio={profile.bio} education={profile.education} internship={profile.internship} />
      <Skills skillList={skills} />
      <Footer name={profile.name} links={contacts} />
    </div>
  );
}
