import React from "react";
import "./Projects.css";

const Projects = () => {
    const projects = [
        {
            title: "Cardapio Virtual",
            description: "Um sistema simples de cardápio virtual, usando JavaScript, HTML e CSS.",
            link: "https://moveio.vercel.app/",
            image: "../../assets/moveio.png"
        },
        {
            title: "Buscador de CEP",
            description: "Buscador de CEP, usando React.",
            link: "https://search-cep-react-omega.vercel.app/",
            image: "../../assets/buscadorDeCep.png"
        },
        {
            title: "CRUD com Spring Boot",
            description: "CRUD basico para conhecimento.",
            link: "https://github.com/vargxrz/Spring-Product/tree/master",
            image: "../../assets/crud.png"
        },
    ];

    return (
        <div className="projects">
            <h3>Projects</h3>
            <div className="project-cards">
                {projects.map((project, index) => (
                    <div key={index} className="project-card">
                        {project.image && <img src={project.image} alt={project.title} />}
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        <a href={project.link} target={"_blank"} className="project-link">Ver mais</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
