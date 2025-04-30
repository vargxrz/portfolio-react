import React from 'react';
import logoJV from '/assets/logoJV.svg';
import "./Header.css"

const Header = () => {
  return (
    <header>
      <div className="content">
      <div className="logo-container">
        <img src={logoJV} alt="LogoVargas" />
        <div className="logo-text">
        </div>
      </div>
      <div className="options-home">
        <a href="#about"><p>About</p></a>
        <a href="#skills"><p>Skills/Projects</p></a>
        <a href="#contact"><p>Contact</p></a>
      </div>
      </div>
    </header>
  );
};

export default Header;
