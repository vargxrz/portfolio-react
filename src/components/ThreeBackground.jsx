import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { sphereVertexShader, sphereFragmentShader } from './shaders/sphereShaders';
import './ThreeBackground.css';

const LIGHT_COLOR = new THREE.Color(0xEA580C);
const DARK_COLOR = new THREE.Color(0xA855F7);

const PARTICLE_COUNT_DESKTOP = 1600;
const PARTICLE_COUNT_MOBILE = 700;

// Mobile — annular ring hugging the centered hero title (portrait).
const RING_MOBILE = { inner: 1.1, outer: 2.4, xScale: 0.95, yScale: 1.15 };

// Desktop editorial config: main cluster gently left-biased so it feels
// like it comes from the "2026" without dominating the top-left, plus
// sparse spark clusters at the four corners echoing the meta-bar framing.
const EDITORIAL_DESKTOP = {
    mainOffsetX: -1.2,
    mainInner: 1.4,
    mainOuter: 4.0,
    mainXScale: 1.15,
    mainYScale: 1.0,
    cornerRadius: 0.9,
    corners: [
        [-4.7, 2.4],
        [4.7, 2.4],
        [-4.7, -2.4],
        [4.7, -2.4],
    ],
    mainShare: 0.82, // rest split evenly across the 4 corners
};

const writeParticle = (buffers, i, x, y, z) => {
    buffers.positions[i * 3] = x;
    buffers.positions[i * 3 + 1] = y;
    buffers.positions[i * 3 + 2] = z;
    buffers.randoms[i] = Math.random();
    buffers.seeds[i * 3] = Math.random();
    buffers.seeds[i * 3 + 1] = Math.random();
    buffers.seeds[i * 3 + 2] = Math.random();
};

const buildRingGeometry = (count, ring) => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const seeds = new Float32Array(count * 3);
    const buffers = { positions, randoms, seeds };

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rBase = Math.sqrt(Math.random());
        const radius = ring.inner + rBase * (ring.outer - ring.inner);
        const x = Math.cos(angle) * radius * ring.xScale;
        const y = Math.sin(angle) * radius * ring.yScale;
        const z = (Math.random() - 0.5) * 1.2;
        writeParticle(buffers, i, x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    return geometry;
};

const buildEditorialGeometry = (count, cfg) => {
    const mainCount = Math.floor(count * cfg.mainShare);
    const perCornerCount = Math.floor((count - mainCount) / cfg.corners.length);
    const totalCount = mainCount + perCornerCount * cfg.corners.length;

    const positions = new Float32Array(totalCount * 3);
    const randoms = new Float32Array(totalCount);
    const seeds = new Float32Array(totalCount * 3);
    const buffers = { positions, randoms, seeds };

    // Main cluster — annular, vertical ellipse, offset to the left so
    // it emanates from the "2026" area and clears the right sidebar.
    for (let i = 0; i < mainCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rBase = Math.sqrt(Math.random());
        const radius = cfg.mainInner + rBase * (cfg.mainOuter - cfg.mainInner);
        const x = Math.cos(angle) * radius * cfg.mainXScale + cfg.mainOffsetX;
        const y = Math.sin(angle) * radius * cfg.mainYScale;
        const z = (Math.random() - 0.5) * 1.0;
        writeParticle(buffers, i, x, y, z);
    }

    // Corner sparks — small dense clusters framing the viewport corners.
    let idx = mainCount;
    for (const [cx, cy] of cfg.corners) {
        for (let i = 0; i < perCornerCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * cfg.cornerRadius;
            const x = Math.cos(angle) * r + cx;
            const y = Math.sin(angle) * r + cy;
            const z = (Math.random() - 0.5) * 0.6;
            writeParticle(buffers, idx, x, y, z);
            idx++;
        }
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
        const geometry = isMobile
            ? buildRingGeometry(particleCount, RING_MOBILE)
            : buildEditorialGeometry(particleCount, EDITORIAL_DESKTOP);

        const uniforms = {
            uTime: { value: 0 },
            uSize: { value: isMobile ? 1.4 : 1.7 },
            uDispersion: { value: 0 },
            uColor: { value: initialColor.clone() },
            uOpacity: { value: isMobile ? 0.38 : 0.5 },
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

        // Mobile keeps the diagonal ring look. Desktop editorial layout is
        // intentionally still — asymmetry does the visual work, not rotation.
        const BASE_TILT = isMobile ? 0.55 : 0;
        const AMBIENT_ROT_SPEED = isMobile ? 0.02 : 0.008;
        cloud.rotation.z = BASE_TILT;
        scene.add(cloud);

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

        const startTime = performance.now();
        let rafId;

        const render = () => {
            const elapsed = (performance.now() - startTime) * 0.001;
            uniforms.uTime.value = elapsed;

            const p = scrollProgress;
            const eased = easeInOut(p);

            uniforms.uDispersion.value = eased * 4.5;

            cloud.rotation.z = BASE_TILT + elapsed * AMBIENT_ROT_SPEED;

            const fadeOut = 1 - easeInOut(Math.min(Math.max((p - 0.65) / 0.35, 0), 1));
            uniforms.uOpacity.value = fadeOut * (isMobile ? 0.35 : 0.5);

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
