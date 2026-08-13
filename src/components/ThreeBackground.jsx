import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { sphereVertexShader, sphereFragmentShader } from './shaders/sphereShaders';
import './ThreeBackground.css';

const LIGHT_COLOR = new THREE.Color(0xEA580C);
const DARK_COLOR = new THREE.Color(0xA855F7);

const PARTICLE_COUNT = 1800;

const buildCloudGeometry = () => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Distribute in a wide oblate disc — dense at center, thinning outward.
        // Uses inverse-CDF trick: radius proportional to sqrt(rand) gives uniform disc density.
        const angle = Math.random() * Math.PI * 2;
        const rBase = Math.sqrt(Math.random());
        const radius = rBase * 3.2; // horizontal extent

        // Softly elliptical: wider than tall so cloud frames the viewport
        const x = Math.cos(angle) * radius * 1.15;
        const y = Math.sin(angle) * radius * 0.7;
        const z = (Math.random() - 0.5) * 1.4;

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

        const geometry = buildCloudGeometry();
        const uniforms = {
            uTime: { value: 0 },
            uSize: { value: 1.8 },
            uDispersion: { value: 0 },
            uSwirl: { value: 0 },
            uTurbulence: { value: 0 },
            uMouse: { value: new THREE.Vector2(-10, -10) },
            uMouseStrength: { value: 0.7 },
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
        // Animation range: 0 → position where Contact section starts entering view.
        // Recomputed each scroll so it stays accurate as layout changes.
        let scrollProgress = 0;
        const handleScroll = () => {
            const contact = document.getElementById('contact');
            let range = window.innerHeight * 2.5;
            if (contact) {
                const contactTop = contact.getBoundingClientRect().top + window.scrollY;
                range = Math.max(contactTop - window.innerHeight * 0.4, window.innerHeight * 0.8);
            }
            scrollProgress = Math.min(Math.max(window.scrollY / range, 0), 1);
        };
        handleScroll();

        // --- MOUSE ---
        const targetMouse = new THREE.Vector2(-10, -10);
        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        const handleMouseLeave = () => {
            targetMouse.set(-10, -10);
        };

        // --- ANIMATION ---
        const startTime = performance.now();
        let rafId;

        const render = () => {
            const elapsed = (performance.now() - startTime) * 0.001;
            uniforms.uTime.value = elapsed;

            const p = scrollProgress;
            const eased = easeInOut(p);

            // Scroll-driven behaviour:
            //   Hero (p=0)   : cloud slightly expanded, gentle ambient
            //   Middle (p=0.5): swirl and dispersion pick up, cloud rotates/expands
            //   Approaching Contact (p→1): particles fade to zero, no lingering
            uniforms.uDispersion.value = eased * 1.4;
            uniforms.uSwirl.value = elapsed * 0.03 + eased * 1.8;
            uniforms.uTurbulence.value = eased * 0.35;

            // Cloud tilts slightly on scroll for depth
            cloud.rotation.z = eased * 0.25;
            cloud.rotation.x = -0.1 + Math.sin(elapsed * 0.15) * 0.05;

            // Vertical drift so cloud feels alive
            cloud.position.y = Math.sin(elapsed * 0.2) * 0.15;

            // Opacity: full early, fades to zero before Contact
            const fadeOut = 1 - easeInOut(Math.min(Math.max((p - 0.6) / 0.4, 0), 1));
            uniforms.uOpacity.value = fadeOut * 0.55;

            // Mouse — smooth lerp toward cursor
            uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.12;
            uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.12;

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
