export const radarSweepVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const radarSweepFragmentShader = `
uniform float uTime;
uniform float uSweepAngle;
uniform float uDecayRate;
uniform vec3 uColor;

varying vec2 vUv;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

void main() {
  // Convert UV to polar coordinates centered at (0.5, 0.5)
  vec2 center = vUv - 0.5;
  float angle = atan(center.y, center.x);
  float dist = length(center);

  // Normalize angle to 0-1 range
  float normalizedAngle = (angle + PI) / TWO_PI;

  // Calculate angle difference from sweep line
  float sweepNorm = mod(uSweepAngle / TWO_PI, 1.0);
  float angleDiff = mod(sweepNorm - normalizedAngle + 1.0, 1.0);

  // Phosphor decay - brighter near sweep, fading behind
  float phosphor = exp(-uDecayRate * angleDiff * 8.0);

  // Sweep line (bright leading edge)
  float sweepLine = smoothstep(0.02, 0.0, angleDiff) * 0.8;

  // Combine effects
  float intensity = phosphor * 0.3 + sweepLine;

  // Fade at edges
  float edgeFade = smoothstep(0.5, 0.4, dist);
  intensity *= edgeFade;

  // Add subtle noise
  float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
  intensity += noise * 0.02;

  gl_FragColor = vec4(uColor, intensity);
}
`;

export const radarSweepUniforms = {
  uTime: { value: 0 },
  uSweepAngle: { value: 0 },
  uDecayRate: { value: 2.0 },
  uColor: { value: [0, 1, 0.53] }, // #00ff88
};
