export const holographicVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const holographicFragmentShader = `
uniform float uTime;
uniform vec3 uBaseColor;
uniform float uOpacity;
uniform float uScanlineIntensity;
uniform float uGlitchIntensity;

varying vec2 vUv;
varying vec3 vPosition;

// Pseudo-random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec3 color = uBaseColor;
  float alpha = uOpacity;

  // Horizontal scanlines
  float scanline = sin(vUv.y * 200.0 + uTime * 2.0) * 0.5 + 0.5;
  scanline = pow(scanline, 8.0) * uScanlineIntensity;
  color += vec3(scanline * 0.1);

  // Data stream effect (vertical scrolling)
  float dataStream = step(0.98, random(vec2(floor(vUv.x * 50.0), floor(vUv.y * 100.0 - uTime * 10.0))));
  color += vec3(0.0, dataStream * 0.3, dataStream * 0.15);

  // Edge glow
  float edgeX = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  float edgeY = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  float edge = 1.0 - edgeX * edgeY;
  color += vec3(0.0, edge * 0.2, edge * 0.1);

  // Occasional glitch
  float glitch = step(0.99, random(vec2(uTime * 0.1, 0.0))) * uGlitchIntensity;
  if (glitch > 0.0) {
    float glitchOffset = random(vec2(floor(vUv.y * 20.0), uTime)) * 0.1;
    color.r += glitchOffset;
    color.b -= glitchOffset * 0.5;
  }

  gl_FragColor = vec4(color, alpha);
}
`;

export const holographicUniforms = {
  uTime: { value: 0 },
  uBaseColor: { value: [0.05, 0.1, 0.15] },
  uOpacity: { value: 0.85 },
  uScanlineIntensity: { value: 0.3 },
  uGlitchIntensity: { value: 0.5 },
};
