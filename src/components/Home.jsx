import React, { useEffect, useRef } from 'react';
import { Github, ArrowRight } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import './Home.css';

const Home = () => {
    const terminalRef = useRef(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        const terminal = terminalRef.current;
        const commands = [
            'vargas',
            'cd vargas-dev',
            'git commit -m "vargxrz"',
            'git clone https://github.com/vargxrz',
            'full-stack developer',
            'console.log("vargxrz")',
            '',
        ];

        let commandIndex = 0;
        let charIndex = 0;

        const typeWriter = () => {
            if (!terminal) return;

            const currentCommand = commands[commandIndex];
            
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

            setTimeout(typeWriter, 100);
        };

        const timer = setTimeout(typeWriter, 1000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToProjects = () => {
        document.querySelector('#projects')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    return (
        <section id="home" className="home">
            <div className="container">
                <div className="home-content">
                    <div className="hero-text">
                        <div className="intro-line">
                            <span className="intro-tag mono">Hello —</span>
                        </div>
                        
                        <h1 className="hero-title">
                            <span className="name-line">I'm João Vargas</span>
                            <span className="role-line">
                                <span className="text-gradient">Full Stack</span> Developer
                            </span>
                        </h1>

                        <p className="hero-description">
                            Passionate about building clean and scalable software.
                        </p>

                        <div className="hero-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={scrollToProjects}
                            >
                                View Projects
                                <ArrowRight size={18} />
                            </button>
                            
                            <a 
                                href="https://github.com/vargxrz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                <Github size={18} />
                                GitHub
                            </a>
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="hero-visual">
                            <div className="terminal-window">
                                <div className="terminal-header">
                                    <div className="terminal-controls">
                                        <span className="control close"></span>
                                        <span className="control minimize"></span>
                                        <span className="control maximize"></span>
                                    </div>
                                    <span className="terminal-title mono">@vargxrz</span>
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
                    )}
                </div>
            </div>
        </section>
    );
};

export default Home;