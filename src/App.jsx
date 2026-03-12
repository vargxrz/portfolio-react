import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Work from "./components/Work.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import useSmoothScroll from "./hooks/useSmoothScroll.js";
import "./main.css";

const AppContent = () => {
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

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
