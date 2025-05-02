import React, { useState, useEffect, useRef } from 'react';
import logoJV from '/assets/logoJV.svg';
import "./Header.css";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const menuIconRef = useRef(null);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                menuIconRef.current &&
                !menuIconRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <header>
            <div className="content">
                <div className="logo-container">
                    <img src={logoJV} alt="LogoVargas" className="logo" />
                </div>

                <div ref={menuIconRef} style={{ position: 'relative' }}>
                    <div
                        className={`menu-icon ${menuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </div>

                    <div
                        ref={menuRef}
                        className={`options-home ${menuOpen ? 'open' : ''}`}
                    >
                        <a href="#about" onClick={closeMenu}><p>About</p></a>
                        <a href="#skills" onClick={closeMenu}><p>Skills/Projects</p></a>
                        <a href="#contact" onClick={closeMenu}><p>Contact</p></a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;