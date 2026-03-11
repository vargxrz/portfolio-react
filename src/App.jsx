import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Work from "./components/Work.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import useSmoothScroll from "./hooks/useSmoothScroll.js";
import "./main.css";

const App = () => {
  useSmoothScroll();

  return (
    <div>
      <ScrollProgress />
      <Header />
      <Hero />
      <Work />
      <Footer />
    </div>
  );
};

export default App;
