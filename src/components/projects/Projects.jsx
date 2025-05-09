import React from "react";
import "./Projects.css";

const Projects = () => {
    const projects = [
        {
            title: "Virtual Menu",
            description: "A simple virtual menu system using JavaScript, HTML, and CSS.",
            link: "https://moveio.vercel.app/",
            image: "../../assets/moveio.png"
        },
        {
            title: "ZIP Code Finder",
            description: "A ZIP code finder built with React.",
            link: "https://search-cep-react-omega.vercel.app/",
            image: "../../assets/buscadorDeCep.png"
        },
        {
            title: "CRUD with Spring Boot",
            description: "Basic CRUD for learning purposes.",
            link: "https://github.com/vargxrz/Spring-Product/tree/master",
            image: "../../assets/crud.png"
        },
    ];

    return (
        <div className="projects">
            <h3>Projects</h3>
            <div className="project-cards">
                {projects.map((project, index) => (
                    <a
                        key={index}
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card"
                    >
                        {project.image && <img src={project.image} alt={project.title} />}
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        <div className="project-link">Learn more</div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Projects;
