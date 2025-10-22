
import React from 'react';
import { Code2, Coffee, Lightbulb, Target } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import './About.css';

const About = () => {
    const isMobile = useIsMobile();
    
    const highlights = [
        {
            icon: <Code2 size={24} />,
            title: "Clean Code",
            description: "Writing maintainable and efficient code"
        },
        {
            icon: <Lightbulb size={24} />,
            title: "Problem Solving",
            description: "Finding creative solutions to complex challenges"
        },
        {
            icon: <Target size={24} />,
            title: "Goal Oriented",
            description: "Focused on delivering results that matter"
        },
        {
            icon: <Coffee size={24} />,
            title: "Always Learning",
            description: "Constantly evolving with new technologies"
        }
    ];

    return (
        <section id="about" className="about section">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <div className="section-tag">
                            <span className="mono">// About me</span>
                        </div>
                        
                        <h2 className="section-title">
                            Building digital experiences with
                            <span className="text-gradient"> passion</span>
                        </h2>

                        <div className="about-description">
                            <p>
                                Hi, I'm João Gabriel, a <strong>full-stack developer</strong> passionate about creating user experiences.
                                Currently working as a junior developer, I aim to write clean code and build solutions that generate real impact.
                            </p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number text-gradient">2+</span>
                                <span className="stat-label">Years of Experience</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number text-gradient">∞</span>
                                <span className="stat-label">Learning Never Stops</span>
                            </div>
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="about-visual">
                            <div className="highlights-grid">
                                {highlights.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="highlight-card"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="highlight-icon">
                                            {item.icon}
                                        </div>
                                        <h3 className="highlight-title">{item.title}</h3>
                                        <p className="highlight-description">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;
