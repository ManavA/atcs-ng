export const glowVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragmentShader = `
uniform float uIntensity;
uniform vec3 uColor;
uniform float uTime;
uniform float uPulseSpeed;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Fresnel effect for edge glow
  vec3 viewDirection = normalize(cameraPosition - vNormal);
  float fresnel = pow(1.0 - dot(vNormal, viewDirection), 3.0);

  // Pulsing effect
  float pulse = 0.8 + 0.2 * sin(uTime * uPulseSpeed);

  float intensity = fresnel * uIntensity * pulse;

  gl_FragColor = vec4(uColor, intensity);
}
`;

export const glowUniforms = {
  uIntensity: { value: 1.0 },
  uColor: { value: [0, 1, 0.53] },
  uTime: { value: 0 },
  uPulseSpeed: { value: 2.0 },
};
