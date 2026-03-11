import React, { useEffect, useRef } from 'react';
import { Code2, Lightbulb, BookOpen } from 'lucide-react';
import './About.css';

const About = () => {
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
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const traits = [
        {
            icon: <Code2 size={22} />,
            title: "Clean Code",
        },
        {
            icon: <Lightbulb size={22} />,
            title: "Problem Solving",
        },
        {
            icon: <BookOpen size={22} />,
            title: "Continuous Learning",
        }
    ];

    return (
        <section id="about" className="about section" ref={sectionRef}>
            <div className="container">
                <div className="about-inner">
                    <div className="section-label reveal">About</div>

                    <h2 className="section-title reveal">
                        Building digital experiences<br />
                        with <span className="text-gradient">passion</span>
                    </h2>

                    <p className="about-bio reveal">
                        Hi, I'm João Gabriel, a <strong>full-stack developer</strong> passionate about creating user experiences.
                        Currently working as a junior developer, focused on writing clean code and building impactful solutions.
                    </p>

                    <div className="traits-row">
                        {traits.map((trait, i) => (
                            <div
                                key={trait.title}
                                className="trait-item reveal"
                                style={{ transitionDelay: `${i * 0.1}s` }}
                            >
                                <div className="trait-icon">{trait.icon}</div>
                                <span className="trait-title">{trait.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
