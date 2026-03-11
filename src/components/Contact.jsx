import React, { useEffect, useRef } from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import './Contact.css';

const Contact = () => {
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

    const contacts = [
        {
            name: 'Email',
            icon: <Mail size={20} />,
            value: 'vargasvargasjoa@gmail.com',
            href: 'mailto:vargasvargasjoa@gmail.com',
        },
        {
            name: 'GitHub',
            icon: <Github size={20} />,
            value: '/vargxrz',
            href: 'https://github.com/vargxrz',
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={20} />,
            value: '/in/vargxrz',
            href: 'https://www.linkedin.com/in/vargxrz/',
        }
    ];

    return (
        <section id="contact" className="contact section" ref={sectionRef}>
            <div className="container">
                <div className="contact-inner reveal">
                    <div className="section-label">Contact</div>
                    <h2 className="section-title">
                        Let's build something <span className="text-gradient">great.</span>
                    </h2>
                </div>

                <div className="contact-links">
                    {contacts.map((contact, i) => (
                        <a
                            key={contact.name}
                            href={contact.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-item reveal"
                            style={{ transitionDelay: `${i * 0.1}s` }}
                        >
                            <div className="contact-icon">{contact.icon}</div>
                            <div className="contact-info">
                                <span className="contact-name">{contact.name}</span>
                                <span className="contact-value">{contact.value}</span>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="contact-footer reveal">
                    <p>© 2026 João Vargas — built with care</p>
                </div>
            </div>
        </section>
    );
};

export default Contact;
