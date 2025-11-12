import React, { useState } from 'react';
import { Code2, Server, Smartphone, Database, Layout, Wrench, ChevronRight } from 'lucide-react';
import './Skills.css';

const Skills = () => {
    const [expandedCard, setExpandedCard] = useState(null);

    const skillCategories = [
        {
            id: 'frontend',
            title: 'Frontend Development',
            icon: <Layout size={28} />,
            description: 'Creating responsive and interactive user interfaces',
            color: '#000000',
            skills: [
                {
                    name: 'React',
                    level: 'Intermediate',
                    description: 'Component architecture, hooks, state management'
                },
                {
                    name: 'JavaScript',
                    level: 'Intermediate',
                    description: 'ES6+, async/await, modern patterns'
                },
                {
                    name: 'HTML5 & CSS3',
                    level: 'Intermediate',
                    description: 'Semantic markup, animations, responsive design'
                },
                {
                    name: 'Flutter',
                    level: 'Beginner',
                    description: 'Cross-platform mobile development'
                }
            ]
        },
        {
            id: 'backend',
            title: 'Backend Development',
            icon: <Server size={28} />,
            description: 'Building robust and scalable server-side applications',
            color: '#404040',
            skills: [
                {
                    name: 'Java',
                    level: 'Intermediate',
                    description: 'OOP, design patterns, clean code'
                },
                {
                    name: 'Spring Boot',
                    level: 'Intermediate',
                    description: 'REST APIs, security, microservices'
                },
                {
                    name: 'PostgreSQL',
                    level: 'Intermediate',
                    description: 'Database design, queries, optimization'
                },
                {
                    name: 'Docker',
                    level: 'Beginner',
                    description: 'Containerization, deployment'
                }
            ]
        },
        {
            id: 'tools',
            title: 'Tools & Practices',
            icon: <Wrench size={28} />,
            description: 'Development tools and methodologies',
            color: '#737373',
            skills: [
                {
                    name: 'Git & GitHub',
                    level: 'Advanced',
                    description: 'Version control, collaboration'
                },
                {
                    name: 'JUnit',
                    level: 'Intermediate',
                    description: 'Unit testing, TDD'
                },
                {
                    name: 'Responsive Design',
                    level: 'Intermediate',
                    description: 'Mobile-first, accessibility'
                },
                {
                    name: 'Agile/Scrum',
                    level: 'Advanced',
                    description: 'Team collaboration, sprints'
                }
            ]
        }
    ];

    const toggleCard = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    return (
        <section id="skills" className="skills section">
            <div className="container">
                <div className="skills-header">
                    <div className="section-tag">
                        <span className="mono">// My expertise</span>
                    </div>
                    <h2 className="section-title">
                        Skills & <span className="text-gradient">Technologies</span>
                    </h2>
                    <p className="section-description">
                        Technologies and tools I use to build digital experiences
                    </p>
                </div>

                <div className="skills-cards">
                    {skillCategories.map((category, index) => (
                        <div
                            key={category.id}
                            className={`skill-card ${expandedCard === category.id ? 'expanded' : ''}`}
                            style={{
                                '--delay': `${index * 0.1}s`,
                                '--accent-color': category.color
                            }}
                        >
                            <div
                                className="card-header"
                                onClick={() => toggleCard(category.id)}
                            >
                                <div className="card-icon">
                                    {category.icon}
                                </div>
                                <div className="card-title-group">
                                    <h3 className="card-title">{category.title}</h3>
                                    <p className="card-description">{category.description}</p>
                                </div>
                                <div className="card-arrow">
                                    <ChevronRight size={20} />
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="skills-list">
                                    {category.skills.map((skill, skillIndex) => (
                                        <div
                                            key={skill.name}
                                            className="skill-item"
                                            style={{ '--skill-delay': `${skillIndex * 0.05}s` }}
                                        >
                                            <div className="skill-header">
                                                <span className="skill-name">{skill.name}</span>
                                                <span className="skill-level mono">{skill.level}</span>
                                            </div>
                                            <p className="skill-description">{skill.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating decorative elements */}
                <div className="skills-decoration">
                    <div className="deco-line line-1"></div>
                    <div className="deco-line line-2"></div>
                    <div className="deco-dot dot-1"></div>
                    <div className="deco-dot dot-2"></div>
                    <div className="deco-dot dot-3"></div>
                </div>
            </div>
        </section>
    );
};

export default Skills;

