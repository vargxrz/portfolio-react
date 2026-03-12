import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import InteractiveCanvas from './InteractiveCanvas';
import './Hero.css';

const Hero = () => {
    const isMobile = useIsMobile();
    const shouldReduceMotion = useReducedMotion();

    // Parallax effect for background elements
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const parallaxX = useTransform(mouseX, [-1, 1], [-20, 20]);
    const parallaxY = useTransform(mouseY, [-1, 1], [-20, 20]);

    useEffect(() => {
        if (isMobile) return;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            mouseX.set((clientX / innerWidth) * 2 - 1);
            mouseY.set((clientY / innerHeight) * 2 - 1);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isMobile, mouseX, mouseY]);

    const scrollToWork = () => {
        document.querySelector('#work')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const downloadCV = () => {
        const link = document.createElement('a');
        link.href = '/assets/CurriculoVargas.pdf';
        link.download = 'curriculo-vargas.pdf';
        link.click();
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

    return (
        <section id="home" className="hero-section">
            <div className="container">
                <motion.div
                    className="hero-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Main Content */}
                    <div className="hero-content">
                        {/* Label superior minimalista */}
                        <motion.div variants={itemVariants} className="hero-label">
                            <span className="status-dot"></span>
                            <span className="label-text mono">Available for opportunities</span>
                        </motion.div>

                        {/* Heading statement - staggered por palavra */}
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

                        {/* Subtitle com nome */}
                        <motion.p variants={itemVariants} className="hero-subtitle">
                            João Vargas
                        </motion.p>

                        {/* CTA simplificado - apenas 1 principal */}
                        <motion.div variants={itemVariants} className="hero-actions">
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
                                href="/assets/CurriculoVargas.pdf"
                                download="curriculo-vargas.pdf"
                                className="link-secondary"
                                whileHover={{ x: 4 }}
                            >
                                Download CV →
                            </motion.a>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                {!isMobile && (
                    <motion.div 
                        className="scroll-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                    >
                        <div className="scroll-line"></div>
                        <span className="scroll-text mono">scroll</span>
                    </motion.div>
                )}
            </div>

            {/* Background Elements */}
            <div className="hero-bg">
                {/* Elemento interativo principal */}
                {!isMobile && <InteractiveCanvas />}
                
                {/* Noise texture sutil */}
                <div className="bg-noise"></div>
            </div>
        </section>
    );
};

export default Hero;
