import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Instagram } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './Footer.css';

const Footer = () => {
    const isMobile = useIsMobile();
    const [ref, isVisible] = useScrollAnimation(0.3);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.4, 0.25, 1]
            }
        }
    };

    return (
        <footer id="contact" className="footer-section" ref={ref}>
            <div className="container">
                <motion.div
                    className="footer-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {/* CTA Section */}
                    <motion.div variants={itemVariants} className="footer-cta">
                        <h2 className="cta-heading">
                            Let's work
                            <span className="cta-accent"> together</span>
                        </h2>
                        <p className="cta-description">
                            {isMobile 
                                ? "I'm always open to new opportunities and collaborations."
                                : "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision."
                            }
                        </p>
                        <a 
                            href="mailto:vargasvargasjoa@gmail.com" 
                            className="cta-email"
                        >
                            vargasvargasjoa@gmail.com
                        </a>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div variants={itemVariants} className="footer-social">
                        <span className="social-label mono">Connect with me</span>
                        <div className="social-links">
                            <a
                                href="https://github.com/vargxrz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="GitHub"
                            >
                                <Github size={isMobile ? 22 : 20} strokeWidth={1.5} />
                                {!isMobile && <span>GitHub</span>}
                            </a>
                            <a
                                href="https://linkedin.com/in/vargxrz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={isMobile ? 22 : 20} strokeWidth={1.5} />
                                {!isMobile && <span>LinkedIn</span>}
                            </a>
                            <a
                                href="https://instagram.com/vargxrz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="Instagram"
                            >
                                <Instagram size={isMobile ? 22 : 20} strokeWidth={1.5} />
                                {!isMobile && <span>Instagram</span>}
                            </a>
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div 
                        variants={itemVariants}
                        className="footer-divider"
                    ></motion.div>

                    {/* Bottom */}
                    <motion.div variants={itemVariants} className="footer-bottom">
                        <div className="footer-info">
                            <p className="footer-text mono">
                                Built by João Vargas
                            </p>
                            <p className="footer-year">© 2026</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
