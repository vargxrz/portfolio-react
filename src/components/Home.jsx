import React, { useEffect, useRef } from 'react';
import { ArrowDown, Download, Github, Linkedin, Mail } from 'lucide-react';
import './Home.css';

const Home = () => {
    const terminalRef = useRef(null);
    const typingRef = useRef(null);

    useEffect(() => {
        const terminal = terminalRef.current;
        const commands = [
            'vargas',
            'hello-word',
            'npm install',
            'full-stack developer',
            'console.log("vargxrz")',
            '',
        ];

        let commandIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeWriter = () => {
            if (!terminal) return;

            const currentCommand = commands[commandIndex];
            
            if (!isDeleting) {
                terminal.textContent = currentCommand.slice(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentCommand.length) {
                    setTimeout(() => {
                        commandIndex++;
                        charIndex = 0;
                        if (commandIndex >= commands.length) {
                            commandIndex = 0;
                        }
                    }, 1500);
                }
            }

            setTimeout(typeWriter, 100);
        };

        const timer = setTimeout(typeWriter, 1000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToAbout = () => {
        document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    };

    const downloadCV = () => {
        const link = document.createElement('a');
        link.href = '/assets/curriculoVargas.pdf';
        link.download = 'curriculo-joao-vargas.pdf';
        link.click();
    };

    return (
        <section id="home" className="home">
            <div className="container">
                <div className="home-content">
                    <div className="hero-text">
                        <div className="intro-line">
                            <span className="intro-tag mono">// Hello</span>
                        </div>
                        
                        <h1 className="hero-title">
                            <span className="name-line">I'm João Vargas</span>
                            <span className="role-line">
                                <span className="text-gradient">Full-Stack</span> Developer
                            </span>
                        </h1>

                        <p className="hero-description">
                            I'm passionate about technology and code, with a love for design and clean, efficient solutions.
                        </p>

                        <div className="hero-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={downloadCV}
                            >
                                <Download size={18} />
                                Download CV
                            </button>
                            
                            <button 
                                className="btn btn-secondary"
                                onClick={scrollToAbout}
                            >
                                Learn More
                                <ArrowDown size={18} />
                            </button>
                        </div>

                        <div className="hero-links">
                            <a 
                                href="https://github.com/vargxrz" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="GitHub"
                            >
                                <Github size={20} />
                            </a>
                            <a 
                                href="https://linkedin.com/in/vargxrz" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a 
                                href="mailto:vargasvargasjoa@gmail.com"
                                className="social-link"
                                aria-label="Email"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="terminal-window">
                            <div className="terminal-header">
                                <div className="terminal-controls">
                                    <span className="control close"></span>
                                    <span className="control minimize"></span>
                                    <span className="control maximize"></span>
                                </div>
                            </div>
                            <div className="terminal-body">
                                <div className="terminal-line">
                                    <span className="prompt mono">~ $</span>
                                    <span ref={terminalRef} className="command mono"></span>
                                    <span className="cursor"></span>
                                </div>
                            </div>
                        </div>

                        <div className="floating-elements">
                            <div className="floating-icon icon-1">
                                <span className="mono">{`< >`}</span>
                            </div>
                            <div className="floating-icon icon-2">
                                <span className="mono">{'{ }'}</span>
                            </div>
                            <div className="floating-icon icon-3">
                                <span className="mono">{'[ ]'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scroll-indicator">
                    <div className="scroll-line"></div>
                    <span className="scroll-text mono"></span>
                </div>
            </div>
        </section>
    );
};

export default Home;