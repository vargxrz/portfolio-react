import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const SmoothCursor = () => {
  const { theme } = useTheme();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring animation with specified config
  const springConfig = { damping: 30, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Theme-aware colors
  const cursorColor = theme === 'dark' ? '#A855F7' : '#EA580C'; // purple in dark, orange in light

  useEffect(() => {
    // Detect touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Only show on desktop (min-width 1024px)
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    if (!mediaQuery.matches) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);

    // Keep system cursor visible (don't set cursor: none)
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: cursorXSpring,
        top: cursorYSpring,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(10px, 10px)', // 10px offset from cursor
        fontFamily: 'var(--font-mono)', // JetBrains Mono
        fontSize: '22px',
        fontWeight: '500',
        color: cursorColor,
        opacity: 0.75,
        textShadow: `0 0 8px ${cursorColor}40`, // subtle glow
        userSelect: 'none',
        transition: 'color 0.3s ease, text-shadow 0.3s ease', // smooth theme transition
      }}
    >
      V
    </motion.div>
  );
};

export default SmoothCursor;
