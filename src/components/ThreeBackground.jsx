import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { sphereVertexShader, sphereFragmentShader } from './shaders/sphereShaders';
import './ThreeBackground.css';

const LIGHT_COLOR = new THREE.Color(0xEA580C);
const DARK_COLOR = new THREE.Color(0xA855F7);

const PARTICLE_COUNT = 900;
const SPHERE_RADIUS = 1.3;

const buildSphereGeometry = () => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Golden-spiral distribution for even sphere coverage
        const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        // Add radial jitter — the "crumbled" look
        const jitter = 0.08;
        const jx = (Math.random() - 0.5) * jitter;
        const jy = (Math.random() - 0.5) * jitter;
        const jz = (Math.random() - 0.5) * jitter;

        positions[i * 3] = x * SPHERE_RADIUS + jx;
        positions[i * 3 + 1] = y * SPHERE_RADIUS + jy;
        positions[i * 3 + 2] = z * SPHERE_RADIUS + jz;

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

        // --- LEFT SPHERE ---
        const leftGeometry = buildSphereGeometry();
        const leftUniforms = {
            uTime: { value: 0 },
            uSize: { value: 1.7 },
            uDispersion: { value: 0 },
            uColor: { value: initialColor.clone() },
            uOpacity: { value: 0.55 },
        };
        const leftMaterial = new THREE.ShaderMaterial({
            vertexShader: sphereVertexShader,
            fragmentShader: sphereFragmentShader,
            uniforms: leftUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
        });
        const leftSphere = new THREE.Points(leftGeometry, leftMaterial);
        scene.add(leftSphere);

        // --- RIGHT SPHERE ---
        const rightGeometry = buildSphereGeometry();
        const rightUniforms = {
            uTime: { value: 0 },
            uSize: { value: 1.7 },
            uDispersion: { value: 0 },
            uColor: { value: initialColor.clone() },
            uOpacity: { value: 0.55 },
        };
        const rightMaterial = new THREE.ShaderMaterial({
            vertexShader: sphereVertexShader,
            fragmentShader: sphereFragmentShader,
            uniforms: rightUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
        });
        const rightSphere = new THREE.Points(rightGeometry, rightMaterial);
        scene.add(rightSphere);

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
        let scrollProgress = 0;
        const handleScroll = () => {
            // Progress mapped over 1.8 viewport heights (approx Hero + Work reveal)
            const total = window.innerHeight * 1.8;
            scrollProgress = Math.min(Math.max(window.scrollY / total, 0), 1);
        };
        handleScroll();

        // --- ANIMATION ---
        const startTime = performance.now();
        let rafId;

        const easeInOut = (t) => t * t * (3 - 2 * t);

        const render = () => {
            const elapsed = (performance.now() - startTime) * 0.001;

            leftUniforms.uTime.value = elapsed;
            rightUniforms.uTime.value = elapsed;

            // --- SCROLL PHASES ---
            // 0.00 – 0.35 : spheres off-screen fading in
            // 0.35 – 0.75 : spheres slide toward center
            // 0.75 – 1.00 : spheres merge & disperse outward
            const p = scrollProgress;

            const fadeIn = easeInOut(Math.min(p / 0.3, 1));
            const slide = easeInOut(Math.min(Math.max((p - 0.1) / 0.55, 0), 1));
            const merge = easeInOut(Math.min(Math.max((p - 0.65) / 0.35, 0), 1));

            const opacity = fadeIn;
            leftUniforms.uOpacity.value = opacity * 0.6;
            rightUniforms.uOpacity.value = opacity * 0.6;

            // Sphere separation: off-screen (±8) to apart-visible (±1.9)
            // Merge phase pulls them from ±1.9 to 0 (center)
            const sep = 8 - slide * 6.1;
            const finalSep = sep * (1 - merge);

            // Merge target rises above viewport center so cards don't cover it
            const mergeY = merge * 0.9;

            // Vertical drift for elegance
            const drift = Math.sin(elapsed * 0.3) * 0.15;
            leftSphere.position.set(-finalSep, drift + mergeY, 0);
            rightSphere.position.set(finalSep, -drift + mergeY, 0);

            // Dispersion pushes particles outward subtly at merge (breathing)
            const dispersion = merge * 0.6;
            leftUniforms.uDispersion.value = dispersion;
            rightUniforms.uDispersion.value = dispersion;

            // Rotation on own axis — spinning faster during merge (impact)
            const rot = elapsed * 0.15 + slide * 0.4 + merge * 2.0;
            leftSphere.rotation.y = rot;
            leftSphere.rotation.x = rot * 0.3;
            rightSphere.rotation.y = -rot;
            rightSphere.rotation.x = -rot * 0.3;

            // Theme lerp
            const targetColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR;
            leftUniforms.uColor.value.lerp(targetColor, 0.08);
            rightUniforms.uColor.value.lerp(targetColor, 0.08);

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
            leftGeometry.dispose();
            rightGeometry.dispose();
            leftMaterial.dispose();
            rightMaterial.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="three-background" />;
};

export default ThreeBackground;
