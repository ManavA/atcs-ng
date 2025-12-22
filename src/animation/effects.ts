// Easing functions
export const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutElastic: (t: number) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

// Color interpolation
export function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

// Screen shake generator
export function generateShake(intensity: number): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;
  const magnitude = intensity * (0.5 + Math.random() * 0.5);
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

// Particle burst generator
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function createParticleBurst(
  x: number,
  y: number,
  count: number,
  options: {
    speed?: number;
    life?: number;
    size?: number;
    colors?: string[];
  } = {}
): Particle[] {
  const { speed = 100, life = 1, size = 4, colors = ['#ff3366', '#ffaa00', '#ff6600'] } = options;

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (0.5 + Math.random() * 0.5);
    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life,
      maxLife: life,
      size: size * (0.5 + Math.random() * 0.5),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
}

// Phosphor decay function (for radar)
export function phosphorDecay(timeSinceSweep: number, decayRate: number = 2): number {
  return Math.exp(-decayRate * timeSinceSweep);
}
