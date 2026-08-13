export const sphereVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    uniform float uDispersion;
    uniform float uSwirl;
    uniform float uTurbulence;
    uniform vec2 uMouse;
    uniform float uMouseStrength;

    attribute float aRandom;
    attribute vec3 aSeed;

    varying float vAlpha;
    varying float vRandom;

    // 2D rotation
    vec2 rot2(vec2 v, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
    }

    void main() {
        vec3 pos = position;

        // Base ambient jitter (always alive)
        vec3 jitter = vec3(
            sin(uTime * 0.5 + aSeed.x * 6.28),
            cos(uTime * 0.4 + aSeed.y * 6.28),
            sin(uTime * 0.6 + aSeed.z * 6.28)
        ) * (0.06 + aRandom * 0.08);
        pos += jitter;

        // Turbulence — increases with scroll: particles wander further from origin
        vec2 turbNoise = vec2(
            sin(uTime * 0.3 + aSeed.x * 12.0),
            cos(uTime * 0.35 + aSeed.y * 12.0)
        );
        pos.xy += turbNoise * uTurbulence * (0.3 + aRandom * 0.7);

        // Radial dispersion — pushes particles outward from center
        vec2 outward = normalize(pos.xy + vec2(0.001));
        pos.xy += outward * uDispersion * (0.4 + aRandom * 0.8);

        // Swirl — spiral rotation around center, stronger the further from origin
        float dist = length(pos.xy);
        float swirlAngle = uSwirl * (0.4 + dist * 0.15) * (0.7 + aRandom * 0.6);
        pos.xy = rot2(pos.xy, swirlAngle);

        // World position — must expand before mouse repulsion in world space
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);

        // Mouse repulsion in world space
        vec2 mouseWorld = uMouse * 3.5;
        vec2 toMouse = worldPos.xy - mouseWorld;
        float mDist = length(toMouse);
        float force = smoothstep(2.0, 0.0, mDist) * uMouseStrength;
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
