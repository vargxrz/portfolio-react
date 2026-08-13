export const sphereVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uDispersion;
    uniform vec2 uMouse;
    uniform float uMouseStrength;

    attribute float aRandom;
    attribute vec3 aSeed;

    varying float vAlpha;
    varying float vRandom;

    void main() {
        vec3 pos = position;

        // Subtle ambient jitter — makes particles feel alive without being noisy
        vec3 jitter = vec3(
            sin(uTime * 0.5 + aSeed.x * 6.28),
            cos(uTime * 0.4 + aSeed.y * 6.28),
            sin(uTime * 0.6 + aSeed.z * 6.28)
        ) * (0.05 + aRandom * 0.05);
        pos += jitter;

        // Radial dispersion — pushes each particle outward from center
        // (further from origin = pushed proportionally more)
        vec2 outward = normalize(pos.xy + vec2(0.001));
        pos.xy += outward * uDispersion * (0.4 + aRandom * 0.9);

        // World position (needed so mouse repulsion applies in world space)
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);

        // Mouse repulsion — cursor pushes nearby particles away
        vec2 mouseWorld = uMouse * 3.5;
        vec2 toMouse = worldPos.xy - mouseWorld;
        float mDist = length(toMouse);
        float force = smoothstep(1.8, 0.0, mDist) * uMouseStrength;
        worldPos.xy += normalize(toMouse + vec2(0.001)) * force;

        vec4 mvPosition = viewMatrix * worldPos;
        gl_Position = projectionMatrix * mvPosition;

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
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float softness = smoothstep(0.5, 0.15, d);

        vec3 col = uColor * (0.85 + vRandom * 0.3);

        gl_FragColor = vec4(col, softness * uOpacity * vAlpha);
    }
`;
