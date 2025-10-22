import React from 'react';
import { ExternalLink, Github, Globe, Database, Bell } from 'lucide-react';
import './Projects.css';

const Projects = () => {
    const projects = [
        {
            title: "Virtual Menu",
            description: "A responsive virtual menu built with HTML, CSS, and JavaScript for restaurants. Features modern design and smooth animations.",
            tech: ["HTML", "CSS", "JavaScript"],
            links: {
                live: "https://moveio.vercel.app/",
                github: null
            },
            icon: <Globe size={24} />,
            featured: true
        },
        {
            title: "ZIP Code Finder",
            description: "React application to search addresses by ZIP code using public APIs. Clean interface with real-time validation.",
            tech: ["React", "JavaScript", "API Integration"],
            links: {
                live: "https://search-cep-react-omega.vercel.app/",
                github: null
            },
            icon: <Globe size={24} />,
            featured: true
        },
        {
            title: "Firebase Push Notifications",
            description: "Java backend POC integrated with Firebase for managing and sending push notifications to mobile applications.",
            tech: ["Java", "Firebase", "Push Notifications"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/poc-push-notification-back"
            },
            icon: <Bell size={24} />,
            featured: true
        },
        {
            title: "CRUD with Spring Boot",
            description: "Complete Java backend project with Spring Boot featuring REST APIs, JPA for data persistence, and CRUD operations.",
            tech: ["Java", "Spring Boot", "JPA", "REST API"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/Spring-Product/tree/master"
            },
            icon: <Database size={24} />,
            featured: true
        }
    ];

    const featuredProjects = projects.filter(project => project.featured);
    const otherProjects = projects.filter(project => !project.featured);

    return (
        <section id="projects" className="projects section">
            <div className="container">
                <div className="projects-header">
                    <div className="section-tag">
                        <span className="mono">// My work</span>
                    </div>
                    
                    <h2 className="section-title">
                        Projects I've
                        <span className="text-gradient"> built</span>
                    </h2>
                    
                    <p className="section-description">
                        Here are some of my recent projects that showcase my skills and passion for development.
                    </p>
                </div>

                <div className="projects-content">
                    {/* Featured Projects */}
                    <div className="featured-projects">
                        <h3 className="subsection-title">Featured Projects</h3>
                        <div className="featured-grid">
                            {featuredProjects.map((project, index) => (
                                <div 
                                    key={project.title} 
                                    className="project-card featured"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="project-header">
                                        <div className="project-icon">
                                            {project.icon}
                                        </div>
                                        <div className="project-links">
                                            {project.links.live && (
                                                <a 
                                                    href={project.links.live} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="project-link"
                                                    aria-label="View live project"
                                                >
                                                    <ExternalLink size={18} />
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
                                                    <Github size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="project-content">
                                        <h4 className="project-title">{project.title}</h4>
                                        <p className="project-description">{project.description}</p>
                                        
                                        <div className="project-tech">
                                            {project.tech.map((tech, techIndex) => (
                                                <span key={techIndex} className="tech-tag mono">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;