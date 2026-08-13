import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { sphereVertexShader, sphereFragmentShader } from './shaders/sphereShaders';
import './ThreeBackground.css';

const LIGHT_COLOR = new THREE.Color(0xEA580C);
const DARK_COLOR = new THREE.Color(0xA855F7);

const PARTICLE_COUNT = 1600;
const INNER_RADIUS = 1.9;
const OUTER_RADIUS = 3.3;

const buildRingGeometry = () => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Annular (donut) distribution: particles occupy a band around center,
        // leaving the middle empty so the hero title stays clear.
        const angle = Math.random() * Math.PI * 2;
        const rBase = Math.sqrt(Math.random()); // uniform density within the band
        const radius = INNER_RADIUS + rBase * (OUTER_RADIUS - INNER_RADIUS);

        // Elliptical: slightly wider than tall to match viewport aspect
        const x = Math.cos(angle) * radius * 1.2;
        const y = Math.sin(angle) * radius * 0.75;
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

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const initialColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR;

        const geometry = buildRingGeometry();
        const uniforms = {
            uTime: { value: 0 },
            uSize: { value: 1.8 },
            uDispersion: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uMouseStrength: { value: 0 },
            uColor: { value: initialColor.clone() },
            uOpacity: { value: 0.55 },
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

        // --- MOUSE ---
        // targetMouse tracks last known cursor position (stays even after leave).
        // mouseActiveTarget/mouseActive fades the effect in/out on enter/leave
        // so particles smoothly relax instead of snapping when cursor leaves.
        const targetMouse = new THREE.Vector2(0, 0);
        let mouseActiveTarget = 0;
        let mouseActive = 0;
        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
            mouseActiveTarget = 1;
        };
        const handleMouseLeave = () => {
            mouseActiveTarget = 0;
        };

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
            uniforms.uDispersion.value = eased * 2.0;

            // Very slow ambient rotation for depth (independent of scroll)
            cloud.rotation.z = elapsed * 0.02;

            // Opacity: full through Hero + Work, fades before Contact enters view
            const fadeOut = 1 - easeInOut(Math.min(Math.max((p - 0.65) / 0.35, 0), 1));
            uniforms.uOpacity.value = fadeOut * 0.5;

            // Mouse — smooth lerp toward cursor position
            uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.09;
            uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.09;

            // Ease strength up on hover, ease down on leave — no snap
            mouseActive += (mouseActiveTarget - mouseActive) * 0.06;
            uniforms.uMouseStrength.value = mouseActive * 0.55;

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
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseleave', handleMouseLeave);
            rafId = requestAnimationFrame(render);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
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
