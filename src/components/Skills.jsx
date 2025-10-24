import React, {useEffect, useRef} from 'react';
import {FaCss3Alt, FaDocker, FaHtml5, FaJava, FaJs, FaReact} from 'react-icons/fa';
import {SiFlutter, SiJunit5, SiPostgresql, SiSpringboot} from 'react-icons/si';
import useIsMobile from '../hooks/useIsMobile';
import './Skills.css';

const Skills = () => {
    const skillsRef = useRef(null);
    const isMobile = useIsMobile();

    const skillCategories = [
        {
            title: "Backend Development",
            subtitle: "Server & Database Technologies",
            skills: [
                { 
                    name: "Java", 
                    description: "Object-oriented programming",
                    icon: <FaJava />, 
                    level: 74 
                },
                { 
                    name: "Spring Boot", 
                    description: "Enterprise framework",
                    icon: <SiSpringboot />, 
                    level: 70 
                },
                { 
                    name: "PostgreSQL", 
                    description: "Relational database",
                    icon: <SiPostgresql />, 
                    level: 60 
                },
                { 
                    name: "JUnit", 
                    description: "Unit testing framework",
                    icon: <SiJunit5 />, 
                    level: 60 
                },
                { 
                    name: "Docker", 
                    description: "Containerization platform",
                    icon: <FaDocker />, 
                    level: 45 
                }
            ]
        },
        {
            title: "Frontend Development", 
            subtitle: "Modern UI & Client Technologies",
            skills: [
                { 
                    name: "React", 
                    description: "Component-based library",
                    icon: <FaReact />, 
                    level: 65 
                },
                {
                    name: "Flutter",
                    description: "Flutter mobile development",
                    icon: <SiFlutter />,
                    level: 50
                },
                { 
                    name: "JavaScript", 
                    description: "Dynamic programming language",
                    icon: <FaJs />, 
                    level: 60 
                },
                { 
                    name: "HTML5", 
                    description: "Modern markup language",
                    icon: <FaHtml5 />, 
                    level: 75 
                },
                { 
                    name: "CSS3", 
                    description: "Styling & animations",
                    icon: <FaCss3Alt />, 
                    level: 70 
                }
            ]
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const skillBars = entry.target.querySelectorAll('.skill-bar-fill');
                        skillBars.forEach((bar, index) => {
                            const level = bar.getAttribute('data-level');
                            setTimeout(() => {
                                bar.style.width = `${level}%`;
                            }, index * 100);
                        });
                    }
                });
            },
            { threshold: 0.2 }
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
                        Technologies
                    </h2>

                    <p className="section-description">
                        {isMobile
                            ? "Here are my main technical skills and expertise areas."
                            : "I'm constantly learning and expanding my skillset. Here are the technologies I'm most comfortable with and use in my projects."
                        }
                    </p>
                </div>

                <div className="skills-container">
                    {skillCategories.map((category, categoryIndex) => (
                        <div
                            key={category.title}
                            className="skill-category"
                            style={{ animationDelay: `${categoryIndex * 0.2}s` }}
                        >
                            <div className="category-header">
                                <h3 className="category-title">{category.title}</h3>
                                <p className="category-subtitle">{category.subtitle}</p>
                            </div>
                            
                            <div className="skills-grid">
                                {category.skills.map((skill, skillIndex) => (
                                    <div
                                        key={skill.name}
                                        className="skill-item"
                                        style={{ animationDelay: `${(categoryIndex * 0.2) + (skillIndex * 0.05)}s` }}
                                    >
                                        <div className="skill-left">
                                            <div className="skill-icon">
                                                {skill.icon}
                                            </div>
                                            <div className="skill-info">
                                                <div className="skill-name">{skill.name}</div>
                                                {!isMobile && (
                                                    <div className="skill-description">{skill.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="skill-right">
                                            <div className="skill-level">{skill.level}%</div>
                                            <div className="skill-bar">
                                                <div
                                                    className="skill-bar-fill"
                                                    data-level={skill.level}
                                                ></div>
                                            </div>
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