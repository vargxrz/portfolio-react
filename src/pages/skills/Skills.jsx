import React from "react";
import "./Skills.css"
import Projects from "../../components/projects/Projects.jsx";

const Skills = () => {
  return (
      <section id="skills">
        <div className="container">
          <div className="skills">
            <h2>Skills</h2>
            <div className="skill">
              <div className="skill-name">Java</div>
              <div className="bar">
                <div className="bar-inner" style={{ width: "70%" }}></div>
              </div>
            </div>
            <div className="skill">
              <div className="skill-name">Spring-Boot</div>
              <div className="bar">
                <div className="bar-inner" style={{ width: "72%" }}></div>
              </div>
            </div>
            <div className="skill">
              <div className="skill-name">HTML</div>
              <div className="bar">
                <div className="bar-inner" style={{ width: "55%" }}></div>
              </div>
            </div>
            <div className="skill">
              <div className="skill-name">CSS</div>
              <div className="bar">
                <div className="bar-inner" style={{ width: "56%" }}></div>
              </div>
            </div>
            <div className="skill">
              <div className="skill-name">JavaScript</div>
              <div className="bar">
                <div className="bar-inner" style={{ width: "42%" }}></div>
              </div>
            </div>
            <div className="skill">
              <div className="skill-name">React</div>
              <div className="bar">
                <div className="bar-inner" style={{ width: "58%" }}></div>
              </div>
            </div>
          </div>

          <Projects />
        </div>
      </section>
  );
};

export default Skills;
