export const sphereVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uDispersion;

    attribute float aRandom;
    attribute vec3 aSeed;

    varying float vAlpha;
    varying float vRandom;

    void main() {
        vec3 pos = position;

        // Subtle continuous jitter (crumbled / breathing feel)
        vec3 jitter = vec3(
            sin(uTime * 0.6 + aSeed.x * 6.28),
            cos(uTime * 0.5 + aSeed.y * 6.28),
            sin(uTime * 0.7 + aSeed.z * 6.28)
        ) * (0.04 + aRandom * 0.05);
        pos += jitter;

        // Dispersion pushes particles outward radially (at merge point)
        pos += normalize(pos + 0.001) * uDispersion * (0.6 + aRandom * 0.8);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation by depth (subtle)
        gl_PointSize = uSize * (0.6 + aRandom * 0.7) * (12.0 / -mvPosition.z);

        vAlpha = 1.0;
        vRandom = aRandom;
    }
`;

export const sphereFragmentShader = /* glsl */ `
    precision mediump float;

    uniform vec3 uColor;
    uniform float uOpacity;

    varying float vAlpha;
    varying float vRandom;

    void main() {
        // Soft circular particle
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float softness = smoothstep(0.5, 0.15, d);

        // Slight color variation per particle
        vec3 col = uColor * (0.85 + vRandom * 0.3);

        gl_FragColor = vec4(col, softness * uOpacity * vAlpha);
    }
`;
