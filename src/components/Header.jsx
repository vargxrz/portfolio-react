import React, {useState, useEffect, useRef} from 'react';
import {Menu, X} from 'lucide-react';
import "./Header.css";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);
    const menuIconRef = useRef(null);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);
        };

        const handleClickOutside = (event) => {
            if (menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                menuIconRef.current &&
                !menuIconRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const navLinks = [
        {href: "#about", label: "About"},
        {href: "#skills-projects", label: "Skills & Projects"},
        {href: "#contact", label: "Contact"}
    ];

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="logo-section">
                    <a href="#" className="logo">
                         <span className="logo-text">
                             J<span className="logo-accent">V</span>
                        </span>
                    </a>
                </div>

                <nav className="desktop-nav">
                    <div className="nav-links">
                        {navLinks.map((link, index) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link"
                                style={{animationDelay: `${index * 0.1}s`}}
                            >
                                <span className="nav-text">{link.label}</span>
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="mobile-nav" ref={menuIconRef}>
                    <button
                        className={`menu-toggle ${menuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>

                    <div
                        ref={menuRef}
                        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
                    >
                        <div className="mobile-menu-content">
                            {navLinks.map((link, index) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="mobile-nav-link"
                                    onClick={closeMenu}
                                    style={{animationDelay: `${index * 0.1}s`}}
                                >
                                    <span className="mobile-nav-text">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;