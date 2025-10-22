import React from 'react';
import { Mail, Linkedin, Github, ArrowUpRight } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import './Contact.css';

const Contact = () => {
    const isMobile = useIsMobile();
    const contacts = [
        {
            name: 'Email',
            icon: <Mail size={20} />,
            value: 'vargasvargasjoa@gmail.com',
            href: 'mailto:vargasvargasjoa@gmail.com',
            description: 'Send me an email'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={20} />,
            value: '/in/vargxrz',
            href: 'https://www.linkedin.com/in/vargxrz/',
            description: 'Let\'s connect professionally'
        },
        {
            name: 'GitHub',
            icon: <Github size={20} />,
            value: '/vargxrz',
            href: 'https://github.com/vargxrz',
            description: 'Check out my code'
        }
    ];

    return (
        <section id="contact" className="contact section">
            <div className="container">
                <div className="contact-content">
                    <div className="contact-text">
                        <div className="section-tag">
                            <span className="mono">// Get in touch</span>
                        </div>
                        
                        <h2 className="section-title">
                            Let's build something
                            <span className="text-gradient"> amazing together</span>
                        </h2>

                        <p className="contact-description">
                            I'm always interested in new opportunities and exciting projects. 
                            Whether you want to work together or just say hi, I'd love to hear from you.
                        </p>

                        {!isMobile && (
                            <div className="contact-stats">
                                <div className="stat">
                                    <span className="stat-number">24h</span>
                                    <span className="stat-label">Response Time</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">100%</span>
                                    <span className="stat-label">Commitment</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="contact-methods">
                        {contacts.map((contact, index) => (
                            <a
                                key={contact.name}
                                href={contact.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="contact-card-header">
                                    <div className="contact-icon">
                                        {contact.icon}
                                    </div>
                                    <ArrowUpRight size={16} className="contact-arrow" />
                                </div>
                                
                                <div className="contact-info">
                                    <h3 className="contact-name">{contact.name}</h3>
                                    <p className="contact-description-text">{contact.description}</p>
                                    <span className="contact-value mono">{contact.value}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="contact-footer">
                    <div className="footer-divider"></div>
                    <div className="footer-content">
                        <p className="footer-text">
                            build by vargas
                        </p>
                        <p className="footer-copyright">
                            © 2025 All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;