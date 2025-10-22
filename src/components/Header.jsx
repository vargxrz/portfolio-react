import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import "./Header.css";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: "#about", label: "About" },
        { href: "#skills", label: "Skills" },
        { href: "#projects", label: "Projects" },
        { href: "#contact", label: "Contact" }
    ];

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <div className="header-content">
                    <button 
                        className="logo" 
                        onClick={scrollToTop}
                        aria-label="Go to top"
                    >
                        <span className="logo-text mono">vargas</span>
                    </button>

                    <nav className="desktop-nav">
                        {navLinks.map((link, index) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <button
                        className={`mobile-toggle ${menuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                    {navLinks.map((link, index) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="mobile-nav-link"
                            onClick={closeMenu}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;