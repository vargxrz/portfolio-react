export const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uAmplitude;

    varying float vHeight;
    varying vec2 vUv;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
            v += amp * noise(p);
            p = p * 2.1 + vec2(1.7, 9.2);
            amp *= 0.5;
        }
        return v;
    }

    void main() {
        vUv = uv;
        vec3 pos = position;

        vec2 flow1 = pos.xy * 0.8 + uTime * 0.15;
        vec2 flow2 = pos.xy * 0.6 - uTime * 0.12 + vec2(5.2, 1.3);
        float height = (fbm(flow1) + fbm(flow2) * 0.5 - 0.7) * uAmplitude;

        float dist = length(pos.xy - uMouse * 2.5);
        float ripple = sin(dist * 8.0 - uTime * 3.0) * exp(-dist * 2.5) * 0.15;
        height += ripple;

        vHeight = height;
        pos.z = height;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

export const fragmentShader = /* glsl */ `
    precision mediump float;

    uniform vec3 uColor;
    uniform float uOpacity;

    varying float vHeight;
    varying vec2 vUv;

    void main() {
        float edge = min(min(vUv.x, vUv.y), min(1.0 - vUv.x, 1.0 - vUv.y));
        float edgeFade = smoothstep(0.0, 0.2, edge);

        float intensity = clamp(0.4 + vHeight * 1.5, 0.15, 1.0);

        float alpha = intensity * edgeFade * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
    }
`;
