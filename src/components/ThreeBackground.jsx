import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders/waveShaders';
import './ThreeBackground.css';

const DEFAULT_COLOR = new THREE.Color(0xA855F7);

const ThreeBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(5, 5, 80, 80);

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uAmplitude: { value: 0.25 },
            uColor: { value: DEFAULT_COLOR.clone() },
            uOpacity: { value: 1.0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            wireframe: true,
        });

        const BASE_TILT = -Math.PI / 6;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = BASE_TILT;
        scene.add(mesh);

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

        const targetMouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('mousemove', handleMouseMove);

        let scrollProgress = 0;
        const handleScroll = () => {
            const heroHeight = window.innerHeight;
            scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        const clock = new THREE.Clock();
        let rafId;

        const render = () => {
            uniforms.uTime.value = clock.getElapsedTime();

            uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.05;
            uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.05;

            uniforms.uAmplitude.value = 0.25 + scrollProgress * 0.5;
            uniforms.uOpacity.value = 1 - scrollProgress;
            mesh.rotation.x = BASE_TILT - scrollProgress * 0.8;

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
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
