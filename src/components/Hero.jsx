import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import './Hero.css';

const Hero = () => {
    const isMobile = useIsMobile();
    const shouldReduceMotion = useReducedMotion();

    const scrollToWork = () => {
        document.querySelector('#work')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = shouldReduceMotion ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    } : {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.4, 0.25, 1]
            }
        }
    };

    const headingContainerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.4
            }
        }
    };

    const wordVariants = shouldReduceMotion ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    } : {
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

    const yearVariants = shouldReduceMotion ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } }
    } : {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1.1,
                ease: [0.25, 0.4, 0.25, 1],
                delay: 0.5
            }
        }
    };

    return (
        <section id="home" className="hero-section">
            <div className="container">
                <motion.div
                    className="hero-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Vertical year — desktop-only decorative index */}
                    <motion.div
                        className="hero-year"
                        variants={yearVariants}
                        aria-hidden="true"
                    >
                        2026
                    </motion.div>

                    {/* Center column: status, heading, signature */}
                    <div className="hero-content">
                        <motion.div variants={itemVariants} className="hero-label">
                            <span className="status-dot"></span>
                            <span className="label-text mono">Available for opportunities</span>
                        </motion.div>

                        <motion.h1
                            className="hero-heading"
                            initial="hidden"
                            animate="visible"
                            variants={headingContainerVariants}
                        >
                            <motion.span variants={wordVariants}>Designer</motion.span>{' '}
                            <motion.span variants={wordVariants}>&</motion.span>{' '}
                            <motion.span variants={wordVariants}>Developer</motion.span>
                            <br />
                            <motion.span variants={wordVariants}>blending</motion.span>{' '}
                            <motion.span variants={wordVariants}>creativity</motion.span>
                            <br />
                            <motion.span variants={wordVariants}>with</motion.span>{' '}
                            <motion.span variants={wordVariants}>code</motion.span>
                        </motion.h1>

                        <motion.div variants={itemVariants} className="hero-signature">
                            <span className="signature-line"></span>
                            <span className="hero-subtitle">João Vargas</span>
                        </motion.div>

                        {/* Mobile-only CTAs live inside hero-content */}
                        {isMobile && (
                            <motion.div variants={itemVariants} className="hero-actions">
                                <motion.button
                                    className="btn-primary-minimal"
                                    onClick={scrollToWork}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>View work</span>
                                    <ArrowRight size={18} strokeWidth={2} />
                                </motion.button>
                                <motion.a
                                    href="/assets/CurriculoVargas2026.pdf"
                                    download="curriculo-vargas.pdf"
                                    className="link-secondary"
                                >
                                    Download CV →
                                </motion.a>
                            </motion.div>
                        )}

                        {/* Mobile-only marquee */}
                        {isMobile && (
                            <motion.div
                                className="hero-marquee"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                                aria-hidden="true"
                            >
                                <div className="marquee-track">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div className="marquee-group" key={i}>
                                            <span className="marquee-item">React</span>
                                            <span className="marquee-dot">●</span>
                                            <span className="marquee-item">TypeScript</span>
                                            <span className="marquee-dot">●</span>
                                            <span className="marquee-item">Node.js</span>
                                            <span className="marquee-dot">●</span>
                                            <span className="marquee-item">Java</span>
                                            <span className="marquee-dot">●</span>
                                            <span className="marquee-item">Spring Boot</span>
                                            <span className="marquee-dot">●</span>
                                            <span className="marquee-item">UI / UX</span>
                                            <span className="marquee-dot">●</span>
                                            <span className="marquee-item">Design Systems</span>
                                            <span className="marquee-dot">●</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right sidebar: role, based, CTAs — desktop only */}
                    {!isMobile && (
                        <motion.aside variants={itemVariants} className="hero-side">
                            <div className="side-meta">
                                <span className="side-meta-key mono">Role</span>
                                <span className="side-meta-value mono">Full-stack<br />&amp; Design</span>
                            </div>
                            <div className="side-meta">
                                <span className="side-meta-key mono">Based</span>
                                <span className="side-meta-value mono">Santa Catarina, BR</span>
                            </div>
                            <div className="side-actions">
                                <motion.button
                                    className="btn-primary-minimal"
                                    onClick={scrollToWork}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>View work</span>
                                    <ArrowRight size={18} strokeWidth={2} />
                                </motion.button>
                                <motion.a
                                    href="/assets/CurriculoVargas2026.pdf"
                                    download="curriculo-vargas.pdf"
                                    className="link-secondary"
                                    whileHover={{ x: 4 }}
                                >
                                    Download CV ↓
                                </motion.a>
                            </div>
                        </motion.aside>
                    )}
                </motion.div>
            </div>

            {/* Bottom meta bar — desktop only */}
            <div className="hero-meta-bar hero-meta-bar--bottom">
                <span className="meta-mark mono">Santa Catarina · UTC−3</span>
                <span className="meta-mark mono">Scroll to explore ↓</span>
            </div>

            {/* Background Elements */}
            <div className="hero-bg">
                <div className="bg-noise"></div>
            </div>
        </section>
    );
};

export default Hero;
