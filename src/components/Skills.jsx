import React, { useEffect, useRef } from 'react';
import {
    FaJava,
    FaReact,
    FaDocker,
    FaGithub,
    FaHtml5,
    FaCss3Alt,
    FaJs,
    FaFigma
} from 'react-icons/fa';
import {
    SiSpringboot,
    SiJunit5,
    SiTypescript,
    SiTailwindcss, SiPostgresql
} from 'react-icons/si';
import useIsMobile from '../hooks/useIsMobile';
import './Skills.css';

const Skills = () => {
    const skillsRef = useRef(null);
    const isMobile = useIsMobile();

    const skillCategories = [
        {
            title: "Backend",
            skills: [
                { name: "Java", icon: <FaJava />, level: 74 },
                { name: "Spring Boot", icon: <SiSpringboot />, level: 70 },
                { name: "JUnit", icon: <SiJunit5 />, level: 60 },
                { name: "Docker", icon: <FaDocker />, level: 40 },
                { name: "Postgres", icon: <SiPostgresql />, level: 60 }
            ]
        },
        {
            title: "Frontend",
            skills: [
                { name: "React", icon: <FaReact />, level: 65 },
                { name: "JavaScript", icon: <FaJs />, level: 55 },
                { name: "HTML5", icon: <FaHtml5 />, level: 70 },
                { name: "CSS3", icon: <FaCss3Alt />, level: 70 },
                { name: "Flutter", icon: <FaFigma />, level: 40 },
            ]
        },
    ];

    // For mobile, show only the most important categories
    const displayCategories = isMobile ? skillCategories.slice(0, 3) : skillCategories;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const progressBars = entry.target.querySelectorAll('.skill-progress-fill');
                        progressBars.forEach((bar, index) => {
                            const level = bar.getAttribute('data-level');
                            setTimeout(() => {
                                bar.style.width = `${level}%`;
                            }, index * 100);
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (skillsRef.current) {
            observer.observe(skillsRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section id="skills" className="skills section" ref={skillsRef}>
            <div className="container">
                <div className="skills-header">
                    <div className="section-tag">
                        <span className="mono">// My expertise</span>
                    </div>

                    <h2 className="section-title">
                        Technologies I work with
                        <span className="text-gradient"> daily</span>
                    </h2>

                    <p className="section-description">
                        {isMobile
                            ? "Here are my main technical skills and expertise areas."
                            : "I'm constantly learning and expanding my skillset. Here are the technologies I'm most comfortable with and use in my projects."
                        }
                    </p>
                </div>

                <div className="skills-grid">
                    {displayCategories.map((category, categoryIndex) => (
                        <div
                            key={category.title}
                            className="skill-category"
                            style={{ animationDelay: `${categoryIndex * 0.1}s` }}
                        >
                            <h3 className="category-title">{category.title}</h3>
                            <div className="skills-list">
                                {category.skills.map((skill, skillIndex) => (
                                    <div
                                        key={skill.name}
                                        className="skill-item"
                                        style={{ animationDelay: `${(categoryIndex * 0.1) + (skillIndex * 0.05)}s` }}
                                    >
                                        <div className="skill-header">
                                            <div className="skill-info">
                                                <div className="skill-icon">
                                                    {skill.icon}
                                                </div>
                                                <span className="skill-name">{skill.name}</span>
                                            </div>
                                            <span className="skill-level">{skill.level}%</span>
                                        </div>
                                        <div className="skill-progress">
                                            <div
                                                className="skill-progress-fill"
                                                data-level={skill.level}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;