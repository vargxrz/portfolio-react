import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <section id="home">
        <div className="main-title reveal">
          <p>Hi! My name is <strong>João Vargas</strong></p>
          <h1>
            Back-End<br />
            Junior
          </h1>
          <div className="buttons-home">
            <a href="/assets/CurriculoVargas.pdf" download="curriculo.pdf">
              <button id="download-button">Download CV</button>
            </a>
            <a href="#about" id="readmore-button">Read more!</a>
          </div>
      </div>
    </section>
  );
};

export default Home;
