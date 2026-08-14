import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { sphereVertexShader, sphereFragmentShader } from './shaders/sphereShaders';
import './ThreeBackground.css';

const LIGHT_COLOR = new THREE.Color(0xEA580C);
const DARK_COLOR = new THREE.Color(0xA855F7);

const PARTICLE_COUNT_DESKTOP = 1600;
const PARTICLE_COUNT_MOBILE = 700;

// Ring dimensions per viewport. Mobile is narrower & taller (portrait),
// so we tighten the ring and switch the ellipse ratio so particles hug
// the title area instead of hiding at the screen edges.
const RING_DESKTOP = { inner: 2.0, outer: 5.0, xScale: 1.35, yScale: 0.85 };
const RING_MOBILE = { inner: 1.1, outer: 2.4, xScale: 0.95, yScale: 1.15 };

const buildRingGeometry = (count, ring) => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const seeds = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        // Annular (donut) distribution: particles occupy a band around center,
        // leaving the middle empty so the hero title stays clear.
        const angle = Math.random() * Math.PI * 2;
        const rBase = Math.sqrt(Math.random()); // uniform density within the band
        const radius = ring.inner + rBase * (ring.outer - ring.inner);

        const x = Math.cos(angle) * radius * ring.xScale;
        const y = Math.sin(angle) * radius * ring.yScale;
        const z = (Math.random() - 0.5) * 1.2;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        randoms[i] = Math.random();
        seeds[i * 3] = Math.random();
        seeds[i * 3 + 1] = Math.random();
        seeds[i * 3 + 2] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    return geometry;
};

const easeInOut = (t) => t * t * (3 - 2 * t);

const ThreeBackground = () => {
    const containerRef = useRef(null);
    const { theme } = useTheme();
    const themeRef = useRef(theme);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const initialColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR;

        const particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
        const ring = isMobile ? RING_MOBILE : RING_DESKTOP;
        const geometry = buildRingGeometry(particleCount, ring);
        const uniforms = {
            uTime: { value: 0 },
            uSize: { value: isMobile ? 1.4 : 1.8 },
            uDispersion: { value: 0 },
            uColor: { value: initialColor.clone() },
            uOpacity: { value: isMobile ? 0.38 : 0.55 },
        };
        const material = new THREE.ShaderMaterial({
            vertexShader: sphereVertexShader,
            fragmentShader: sphereFragmentShader,
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
        });
        const cloud = new THREE.Points(geometry, material);
        // Start already diagonal — matches the rotated look the cloud drifts
        // toward over time, so first-paint feels intentional, not lopsided.
        const BASE_TILT = 0.55;
        cloud.rotation.z = BASE_TILT;
        scene.add(cloud);

        // --- RESIZE ---
        const resize = () => {
            const { clientWidth: w, clientHeight: h } = container;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        // --- SCROLL ---
        // Animation range spans almost the entire scrollable distance up to just
        // before the Contact section — gives the animation a slow, patient feel.
        let scrollProgress = 0;
        const handleScroll = () => {
            const contact = document.getElementById('contact');
            let range = window.innerHeight * 3.0;
            if (contact) {
                const contactTop = contact.getBoundingClientRect().top + window.scrollY;
                range = Math.max(contactTop - window.innerHeight * 0.15, window.innerHeight);
            }
            scrollProgress = Math.min(Math.max(window.scrollY / range, 0), 1);
        };
        handleScroll();

        // --- ANIMATION ---
        const startTime = performance.now();
        let rafId;

        const render = () => {
            const elapsed = (performance.now() - startTime) * 0.001;
            uniforms.uTime.value = elapsed;

            const p = scrollProgress;
            const eased = easeInOut(p);

            // Dispersion is the whole scroll story:
            //   p = 0 : particles sit in the ring around the title (no push)
            //   p ↑   : each particle is pushed outward, ring expands, particles thin
            // Max 4.5 pushes particles well past visible content area, keeping
            // the center clear so Work cards aren't overlapped.
            uniforms.uDispersion.value = eased * 4.5;

            // Very slow ambient rotation for depth (independent of scroll)
            cloud.rotation.z = BASE_TILT + elapsed * 0.02;

            // Opacity: full through Hero + Work, fades before Contact enters view.
            // Mobile ceiling is lower so background stays clean, not polluted.
            const fadeOut = 1 - easeInOut(Math.min(Math.max((p - 0.65) / 0.35, 0), 1));
            uniforms.uOpacity.value = fadeOut * (isMobile ? 0.35 : 0.5);

            // Theme lerp
            const targetColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR;
            uniforms.uColor.value.lerp(targetColor, 0.08);

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };

        if (prefersReduced) {
            renderer.render(scene, camera);
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
            rafId = requestAnimationFrame(render);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="three-background" />;
};

export default ThreeBackground;
