import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import "./main.css"
import SkillsProjects from "./components/SkillsProjects.jsx";
const App = () => {
  return (
    <div>
      <Header />
      <Home />
      <About />
      <SkillsProjects/>
      <Contact />
    </div>
  );
};

export default App
