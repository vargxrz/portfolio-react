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
            title: "Finassa",
            titleAccent: "Finance",
            description: "Personal finance management app built with Next.js and TypeScript. Track spending, budgets, and financial goals with a clean, modern interface.",
            tech: ["TypeScript", "Next.js", "Docker"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/finassa"
            },
            category: "Full Stack"
        },
        {
            number: "02",
            title: "Movies",
            titleAccent: "Library",
            description: "Movie discovery app built with React and React Router. Browse, search, and explore films with a responsive and modern UI.",
            tech: ["React", "JavaScript", "Vite"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/movies-lib-react"
            },
            category: "Frontend"
        },
        {
            number: "03",
            title: "Restaurant",
            titleAccent: "Menu",
            description: "Responsive virtual menu for restaurants built with HTML, CSS, and JavaScript. Features modern design and smooth animations.",
            tech: ["HTML", "CSS", "JavaScript"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/restaurant-menu"
            },
            category: "Frontend"
        },
        {
            number: "04",
            title: "Push",
            titleAccent: "Notification",
            description: "Java backend POC integrated with Firebase Cloud Messaging for sending push notifications to mobile applications.",
            tech: ["Java", "Firebase", "FCM"],
            links: {
                live: null,
                github: "https://github.com/vargxrz/push-notification"
            },
            category: "Backend"
        }
    ];

    const rowContainerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05,
            },
        },
    };

    const numVariants = {
        hidden: { opacity: 0, x: -16 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 14 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
        },
    };

    const ProjectRow = ({ project, index }) => {
        const cardLink = project.links.live || project.links.github;
        const linkLabel = project.links.live ? "VIEW LIVE" : "VIEW CODE";
        const isRight = index % 2 === 1;

        return (
            <motion.a
                href={cardLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`proj-row ${isRight ? 'proj-row--right' : 'proj-row--left'}`}
                variants={rowContainerVariants}
                initial="hidden"
                animate={isVisible ? 'visible' : 'hidden'}
                transition={{ delayChildren: index * 0.12 }}
                whileTap={{ scale: 0.985 }}
            >
                <motion.span
                    className="proj-num"
                    variants={numVariants}
                    style={{ transformOrigin: isRight ? 'right center' : 'left center' }}
                >
                    {project.number}
                </motion.span>
                <div className="proj-content">
                    <motion.span className="proj-label mono" variants={itemVariants}>
                        {project.category}
                    </motion.span>
                    <motion.h3 className="proj-title" variants={itemVariants}>
                        {project.title} <em>{project.titleAccent}</em>
                    </motion.h3>
                    <motion.p className="proj-desc" variants={itemVariants}>
                        {project.description}
                    </motion.p>
                    <motion.div className="proj-tags" variants={itemVariants}>
                        {project.tech.map((tech) => (
                            <span key={tech} className="proj-tag mono">{tech}</span>
                        ))}
                    </motion.div>
                    <motion.span className="proj-link mono" variants={itemVariants}>
                        {linkLabel} <span className="proj-link-arrow">→</span>
                    </motion.span>
                </div>
            </motion.a>
        );
    };

    return (
        <section id="work" className="work-section" ref={ref}>
            <div className="container">
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

                <div className="work-rows">
                    {projects.map((project, index) => (
                        <ProjectRow
                            key={project.title + project.number}
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
