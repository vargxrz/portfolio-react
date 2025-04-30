import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Header from "./components/header/Header";
import Home from "./pages/home/Home";
import Skills from "./pages/skills/Skills";
import "./main.css"
const App = () => {
  return (
    <div>
      <Header />
      <Home />
      <About />
      <Skills />
      <Contact />
    </div>
  );
};


export default App
