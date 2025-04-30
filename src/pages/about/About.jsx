import React from 'react';
import borda from '/assets/borda.svg';
import fotoVargas from '/assets/fotoPerfil.svg';
import bordaDeBaixo from '/assets/bordaDeBaixo.svg';
import "./About.css"

const About = () => {
  return (
    <section id="about">
      <img id="top-shape" src={borda} alt="Top Border" />
      <div className="about-main">
        <div className="escrita-about reveal">
          <h1>About-me</h1>
          <p>
              My name is João Gabriel, I'm 19 years old, and I've always been passionate about technology. In 2023, I started my career as a trainee,
              focusing on backend and eventually exploring frontend as well. Currently, I'm a junior developer, working with both backend and frontend, always seeking to grow and take on new challenges
          </p>
        </div>
        <img
          id="imgVargas"
          src={fotoVargas}
          alt="fotoVargas"
          style={{ borderRadius: "50%" }}
        />
      </div>
      <img id="bottom-shape" src={bordaDeBaixo} alt="Bottom Border" />
    </section>
  );
};

export default About;
