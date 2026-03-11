import React, { useEffect, useRef } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import './Projects.css';

const Projects = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.reveal').forEach((el) => {
                            el.classList.add('visible');
                        });
                    }
                });
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const projects = [
        {
            title: "Virtual Menu",
            description: "A responsive virtual menu for restaurants with modern design and smooth animations.",
            tech: ["HTML", "CSS", "JavaScript"],
            links: {
                live: "https://moveio.vercel.app/",
                github: null
            }
        },
        {
            title: "ZIP Code Finder",
            description: "React app to search addresses by ZIP code using public APIs with real-time validation.",
            tech: ["React", "JavaScript", "API"],
            links: {
                live: "https://search-cep-react-omega.vercel.app/",
                github: null
            }
        },
        {
            title: "Firebase Push Notifications",
            description: "Java backend POC integrated with Firebase for sending push notifications to mobile apps.",
            tech: ["Java", "Firebase"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/poc-push-notification-back"
            }
        },
        {
            title: "CRUD with Spring Boot",
            description: "Full Java backend with Spring Boot, REST APIs, JPA data persistence, and CRUD operations.",
            tech: ["Java", "Spring Boot", "JPA"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/Spring-Product/tree/master"
            }
        }
    ];

    return (
        <section id="projects" className="projects section" ref={sectionRef}>
            <div className="container">
                <div className="projects-header reveal">
                    <div className="section-label">Projects</div>
                    <h2 className="section-title">
                        Work I've <span className="text-gradient">built</span>
                    </h2>
                </div>

                <div className="projects-grid">
                    {projects.map((project, index) => (
                        <div
                            key={project.title}
                            className="project-card reveal"
                            style={{ transitionDelay: `${index * 0.1}s` }}
                        >
                            <div className="project-card-header">
                                <h3 className="project-title">{project.title}</h3>
                                <div className="project-links">
                                    {project.links.live && (
                                        <a
                                            href={project.links.live}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-link"
                                            aria-label="View live project"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                    {project.links.github && (
                                        <a
                                            href={project.links.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-link"
                                            aria-label="View source code"
                                        >
                                            <Github size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <p className="project-description">{project.description}</p>

                            <div className="project-tech">
                                {project.tech.map((tech) => (
                                    <span key={tech} className="tech-tag">{tech}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
