import React from "react";
import emailIcon from "/assets/email.svg";
import linkedinIcon from "/assets/linkedin.svg";
import githubIcon from "/assets/github.svg";
import "./Contact.css"

const Contact = () => {
  return (
    <section id="contact">
      <div className="footer">
        <h1>Contact</h1>
        <div className="icons">
          <a href="mailto:vargasvargasjoa@gmail.com" target="_blank" rel="noopener noreferrer">
            <img src={emailIcon} alt="email" />
          </a>
          <a href="https://www.linkedin.com/in/vargxrz/" target="_blank" rel="noopener noreferrer">
            <img src={linkedinIcon} alt="linkedin" />
          </a>
          <a href="https://github.com/vargxrz" target="_blank" rel="noopener noreferrer">
            <img src={githubIcon} alt="github" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
