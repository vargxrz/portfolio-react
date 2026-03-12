import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AnimatedThemeToggler from './ui/animated-theme-toggler';
import { useTheme } from '../contexts/ThemeContext';
import "./Header.css";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logoRotated, setLogoRotated] = useState(false); // Toggle fixo do click
    const { theme, toggleTheme } = useTheme();

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
        { href: "#home", label: "Home", number: "01" },
        { href: "#work", label: "Work", number: "02" },
        { href: "#contact", label: "Contact", number: "03" }
    ];

    const scrollToTop = () => {
        // Toggle fixo da rotação
        setLogoRotated(!logoRotated);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeMenu();
    };

    const handleNavClick = (e, href) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        closeMenu();
    };

    return (
        <motion.header 
            className={`header ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        >
            <div className="container">
                <div className="header-content">
                    <button 
                        className="logo" 
                        onClick={scrollToTop}
                        aria-label="Go to top"
                    >
                        <span className={`logo-mark ${logoRotated ? 'rotated' : ''}`}>V</span>
                    </button>

                    <nav className="desktop-nav">
                        {navLinks.map((link, index) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link"
                                onClick={(e) => handleNavClick(e, link.href)}
                            >
                                <span className="nav-number mono">{link.number}</span>
                                <span className="nav-label">{link.label}</span>
                            </a>
                        ))}
                        <AnimatedThemeToggler theme={theme} onToggle={toggleTheme} />
                    </nav>

                    <button
                        className={`mobile-toggle ${menuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
                    </button>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div 
                            className="mobile-menu"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        >
                            <nav className="mobile-nav">
                                {navLinks.map((link, index) => (
                                    <motion.a
                                        key={link.href}
                                        href={link.href}
                                        className="mobile-nav-link"
                                        onClick={(e) => handleNavClick(e, link.href)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                    >
                                        <span className="nav-number mono">{link.number}</span>
                                        <span className="nav-label">{link.label}</span>
                                    </motion.a>
                                ))}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    paddingTop: 'var(--spacing-lg)',
                                    borderTop: '1px solid var(--border-light)'
                                }}>
                                    <AnimatedThemeToggler theme={theme} onToggle={toggleTheme} />
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Header;