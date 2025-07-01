import React from "react";
import {
    FaJava,
    FaReact,
    FaDocker,
    FaGithub,
    FaGlobe,
    FaDatabase,
    FaMobileAlt, FaBell,
} from "react-icons/fa";
import {
    SiSpringboot,
    SiJavascript,
    SiHtml5,
    SiCss3,
    SiJunit5,
    SiFigma,
} from "react-icons/si";
import { FiExternalLink } from "react-icons/fi";
import "./SkillsProjects.css";

const skillData = [
    { name: "Java", icon: <FaJava />, percent: 60 },
    { name: "Spring Boot", icon: <SiSpringboot />, percent: 70 },
    { name: "JUnit", icon: <SiJunit5 />, percent: 40 },
    { name: "Docker", icon: <FaDocker />, percent: 25 },
    { name: "GitHub", icon: <FaGithub />, percent: 60 },
    { name: "React", icon: <FaReact />, percent: 55 },
    { name: "JavaScript", icon: <SiJavascript />, percent: 30 },
    { name: "HTML5", icon: <SiHtml5 />, percent: 80 },
    { name: "CSS3", icon: <SiCss3 />, percent: 74 },
    { name: "Figma", icon: <SiFigma />, percent: 60 },
];

const projectData = [
    {
        title: "Virtual Menu",
        description: "A simple virtual menu built with HTML, CSS, and JavaScript for restaurants.",
        link: "https://moveio.vercel.app/",
        icon: <FaGlobe />,
    },
    {
        title: "ZIP Code Finder",
        description: "React app to search addresses by ZIP code using public APIs.",
        link: "https://search-cep-react-omega.vercel.app/",
        icon: <FaGlobe />,
    },
    {
        title: "CRUD with Spring Boot",
        description: "Java + Spring Boot project with basic CRUD operations using REST and JPA.",
        link: "https://github.com/vargxrz/Spring-Product/tree/master",
        icon: <FaDatabase />,
    },
    {
        title: "Push Notification",
        description: "Java + Firebase POC for managing and sending push notifications.",
        link: "https://github.com/vargxrz/poc-push-notification-back",
        icon: <FaBell />,
    },
];

export default function SkillsProjects() {
    return (
        <section id="skills-projects">
            <div className="about-container">
                <div className="section-header">
                    <h2 className="section-title">
                        My <span className="gradient-text">Skills</span> &amp; Projects
                    </h2>
                    <div className="title-underline"></div>
                </div>

                <div className="section-content">
                    {/* SKILLS */}
                    <div className="skills">
                        {skillData.map((s, i) => (
                            <div className="skill-bar" key={i}>
                                <div className="skill-header">
                                    <div className="skill-icon">{s.icon}</div>
                                    <div className="skill-name">{s.name}</div>
                                    <div className="skill-percent">{s.percent}%</div>
                                </div>
                                <div className="skill-track">
                                    <div
                                        className="skill-fill"
                                        style={{ width: `${s.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="projects-grid">
                        {projectData.map((p, i) => (
                            <a
                                className="project-card-new"
                                href={p.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={i}
                            >
                                <div className="project-card-head">
                                    <span className="project-icon">{p.icon}</span>
                                </div>
                                <div className="project-card-body">
                                    <h4>{p.title}</h4>
                                    <p>{p.description}</p>
                                </div>
                                <div className="project-card-footer">
                                    Learn more <FiExternalLink />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
