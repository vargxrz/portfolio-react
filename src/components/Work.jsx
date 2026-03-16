import React from 'react';
import { motion } from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './Work.css';

const Work = () => {
    const isMobile = useIsMobile();
    const [ref, isVisible] = useScrollAnimation(0.2);

    const projects = [
        {
            number: "01",
            title: "Virtual Menu",
            description: "A responsive virtual menu built with HTML, CSS, and JavaScript for restaurants. Features modern design and smooth animations.",
            tech: ["HTML", "CSS", "JavaScript"],
            links: {
                live: "https://moveio.vercel.app/",
                github: null
            },
            featured: false,
            category: "Frontend"
        },
        {
            number: "02",
            title: "ZIP Code Finder",
            description: "React application to search addresses by ZIP code using public APIs. Clean interface with real-time validation.",
            tech: ["React", "JavaScript", "API Integration"],
            links: {
                live: "https://search-cep-react-omega.vercel.app/",
                github: null
            },
            featured: false,
            category: "Web App"
        },
        {
            number: "03",
            title: "Firebase Push Notifications",
            description: "Java backend POC integrated with Firebase for managing and sending push notifications to mobile applications.",
            tech: ["Java", "Firebase", "Spring Boot"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/poc-push-notification-back"
            },
            featured: false,
            category: "Backend"
        },
        {
            number: "04",
            title: "CRUD with Spring Boot",
            description: "Complete Java backend project with Spring Boot featuring REST APIs, JPA for data persistence, and CRUD operations.",
            tech: ["Java", "Spring Boot", "JPA", "PostgreSQL"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/Spring-Product/tree/master"
            },
            featured: false,
            category: "Backend"
        }
    ];

    // Card component - Minimalista com bordas sutis
    const WorkCard = ({ project, index }) => {
        const cardLink = project.links.live || project.links.github;
        
        return (
            <motion.a
                href={cardLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`work-card bento-card-${index + 1}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
            >
                <div className="card-top-row">
                    <p className="card-label mono">{project.category}</p>
                    <span className="card-number">{project.number}</span>
                </div>

                <div className="card-divider" />

                <h3 className="card-title">{project.title}</h3>
                <p className="card-description">{project.description}</p>

                <div className="card-tech">
                    {project.tech.map((tech, i) => (
                        <span key={i} className="tech-tag mono">{tech}</span>
                    ))}
                </div>
            </motion.a>
        );
    };

    return (
        <section id="work" className="work-section" ref={ref}>
            <div className="container">
                {/* Header */}
                <motion.div
                    className="work-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <div className="section-label">
                        <motion.span 
                            className="label-line"
                            initial={{ width: 0 }}
                            animate={isVisible ? { width: 48 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        ></motion.span>
                        <span className="label-text mono">Featured Work</span>
                    </div>
                    <h2 className="section-heading">
                        Turning Ideas
                        <span className="heading-accent"> Into Reality</span>
                    </h2>
                    <p className="section-description">
                        {isMobile 
                            ? "Selected projects showcasing my skills across frontend, backend, and full-stack development."
                            : "A showcase of carefully crafted projects that demonstrate my technical expertise, creative problem-solving, and dedication to building exceptional digital experiences."
                        }
                    </p>
                </motion.div>

                {/* Grid de Projetos */}
                <div className="work-grid">
                    {projects.map((project, index) => (
                        <WorkCard 
                            key={project.title} 
                            project={project} 
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Work;
