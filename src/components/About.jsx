
import React from 'react';
import { Card } from 'antd';
import './About.css';

const About = () => {
    return (
        <section id="about" className="about-section">
            <div className="section-bg">
                <div className="bg-gradient"></div>
            </div>

            <div className="about-container">
                <div className="section-header reveal">
                    <h2 className="section-title">
                        About <span className="gradient-text">Me</span>
                    </h2>
                    <div className="title-underline"></div>
                </div>

                <div className="about-content">
                    <div className="about-text reveal">
                        <Card className="about-card">
                            <div className="card-content">
                                <h3 className="about-subtitle">My Journey</h3>
                                <p className="about-description">
                                    My name is João Gabriel, I'm 19 years old, and I've always been passionate about technology.
                                    In 2023, I started my career as a trainee, focusing on backend development and eventually
                                    exploring frontend as well.
                                </p>
                                <p className="about-description">
                                    Currently, I'm a junior developer working with both backend and frontend technologies,
                                    always seeking to grow and take on new challenges. I believe in writing clean,
                                    maintainable code and creating solutions that make a real impact.
                                </p>

                                <div className="about-highlights">
                                    <div className="highlight-item">
                                        <div className="highlight-number gradient-text">2</div>
                                        <div className="highlight-label">Years Experience</div>
                                    </div>
                                    <div className="highlight-item">
                                        <div className="highlight-number gradient-text">∞</div>
                                        <div className="highlight-label">Learning Never Stops</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="about-visual reveal">
                        <div className="profile-container">
                            <div className="profile-ring">
                                <div className="profile-image">
                                    <img src="/assets/fotoPerfil.svg" alt="João Vargas" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
