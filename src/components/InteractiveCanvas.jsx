import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import './InteractiveCanvas.css';

const InteractiveCanvas = () => {
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    
    // Transform mouse position para gradient position
    const gradientX = useTransform(mouseX, [0, 1], [20, 80]);
    const gradientY = useTransform(mouseY, [0, 1], [20, 80]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            mouseX.set(clientX / innerWidth);
            mouseY.set(clientY / innerHeight);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="interactive-canvas">
            <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="xMidYMid slice"
                className="mesh-svg"
            >
                <defs>
                    {/* Mesh Gradient com blur */}
                    <filter id="gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 20 -10" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                    
                    <radialGradient id="grad1" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(234, 88, 12, 0.15)" />
                        <stop offset="100%" stopColor="rgba(234, 88, 12, 0)" />
                    </radialGradient>
                    
                    <radialGradient id="grad2" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(168, 162, 158, 0.1)" />
                        <stop offset="100%" stopColor="rgba(168, 162, 158, 0)" />
                    </radialGradient>
                </defs>
                
                <g filter="url(#gooey)">
                    {/* Blob 1 - segue mouse */}
                    <motion.circle
                        cx={gradientX}
                        cy={gradientY}
                        r="25"
                        fill="url(#grad1)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                    
                    {/* Blob 2 - animação independente */}
                    <motion.circle
                        cx="70"
                        cy="60"
                        r="30"
                        fill="url(#grad2)"
                        animate={{
                            cx: [70, 75, 70],
                            cy: [60, 55, 60],
                            r: [30, 35, 30]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    
                    {/* Blob 3 - animação offset */}
                    <motion.circle
                        cx="30"
                        cy="40"
                        r="20"
                        fill="url(#grad2)"
                        animate={{
                            cx: [30, 25, 30],
                            cy: [40, 45, 40],
                            r: [20, 25, 20]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                </g>
            </svg>
        </div>
    );
};

export default InteractiveCanvas;
