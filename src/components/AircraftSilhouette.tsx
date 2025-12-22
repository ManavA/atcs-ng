import { type AircraftSize } from '../assets/airlines';

interface AircraftSilhouetteProps {
  size: AircraftSize;
  color?: string;
  width?: number;
  className?: string;
  isMilitary?: boolean;
}

// SVG path data for different aircraft sizes
const SILHOUETTES = {
  // Regional jet (small, T-tail)
  regional: 'M24 8 L24 4 L23 4 L23 8 L16 8 L16 10 L10 14 L10 16 L16 14 L16 16 L23 16 L23 20 L16 24 L16 26 L24 22 L24 24 L25 24 L25 22 L33 26 L33 24 L26 20 L26 16 L33 16 L33 14 L39 16 L39 14 L33 10 L33 8 L26 8 L26 4 L25 4 L25 8 Z',

  // Narrow-body (single aisle, 737/A320 style)
  narrow: 'M24 6 L24 2 L23 2 L23 6 L18 6 L18 8 L8 14 L8 16 L18 12 L18 18 L23 18 L23 22 L18 26 L18 28 L24 24 L24 26 L25 26 L25 24 L31 28 L31 26 L26 22 L26 18 L31 18 L31 12 L41 16 L41 14 L31 8 L31 6 L26 6 L26 2 L25 2 L25 6 Z',

  // Wide-body (twin aisle, 787/A350 style)
  wide: 'M24 5 L24 1 L23 1 L23 5 L17 5 L17 7 L5 15 L5 17 L17 11 L17 19 L23 19 L23 24 L17 28 L17 30 L24 25 L24 28 L25 28 L25 25 L32 30 L32 28 L26 24 L26 19 L32 19 L32 11 L44 17 L44 15 L32 7 L32 5 L26 5 L26 1 L25 1 L25 5 Z',

  // Heavy (747/777-300ER style, larger wings)
  heavy: 'M24 4 L24 0 L23 0 L23 4 L16 4 L16 6 L2 16 L2 18 L16 10 L16 20 L23 20 L23 26 L16 31 L16 33 L24 27 L24 30 L25 30 L25 27 L33 33 L33 31 L26 26 L26 20 L33 20 L33 10 L47 18 L47 16 L33 6 L33 4 L26 4 L26 0 L25 0 L25 4 Z',

  // Super (A380 style, double-deck, 4 engines)
  super: 'M24 3 L24 0 L23 0 L23 3 L15 3 L15 5 L0 17 L0 19 L15 9 L15 21 L23 21 L23 28 L15 34 L15 36 L24 29 L24 33 L25 33 L25 29 L34 36 L34 34 L26 28 L26 21 L34 21 L34 9 L49 19 L49 17 L34 5 L34 3 L26 3 L26 0 L25 0 L25 3 Z',
};

// Fighter jet silhouette (delta wing)
const FIGHTER_SILHOUETTE = 'M24 6 L24 2 L23 2 L23 6 L20 6 L12 18 L12 20 L20 14 L20 22 L23 22 L23 24 L18 28 L18 30 L24 26 L24 28 L25 28 L25 26 L31 30 L31 28 L26 24 L26 22 L29 22 L29 14 L37 20 L37 18 L29 6 L26 6 L26 2 L25 2 L25 6 Z';

export function AircraftSilhouette({
  size,
  color = '#8b949e',
  width = 24,
  className,
  isMilitary = false,
}: AircraftSilhouetteProps) {
  const path = isMilitary ? FIGHTER_SILHOUETTE : SILHOUETTES[size];

  // Scale based on size
  const viewBoxSize = size === 'super' ? 49 : size === 'heavy' ? 49 : 49;
  const aspectRatio = size === 'super' ? 1.2 : size === 'heavy' ? 1.1 : 1;
  const height = width * aspectRatio;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={className}
      style={{ transform: 'rotate(90deg)' }}
    >
      <path
        d={path}
        fill={color}
        opacity={0.9}
      />
    </svg>
  );
}

// Size indicator dots
export function SizeIndicator({
  size,
  color = '#6e7681',
}: {
  size: AircraftSize;
  color?: string;
}) {
  const dots = {
    regional: 1,
    narrow: 2,
    wide: 3,
    heavy: 4,
    super: 5,
  };

  const count = dots[size];

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </div>
  );
}

// Helper to get size from aircraft type code
export function getAircraftSize(typeCode: string): AircraftSize {
  // Import dynamically to avoid circular deps
  const AIRCRAFT_TYPES: Record<string, { size?: AircraftSize }> = {
    'B737': { size: 'narrow' },
    'B738': { size: 'narrow' },
    'B739': { size: 'narrow' },
    'A320': { size: 'narrow' },
    'A321': { size: 'narrow' },
    'B787': { size: 'wide' },
    'B789': { size: 'wide' },
    'B777': { size: 'wide' },
    'A330': { size: 'wide' },
    'A350': { size: 'wide' },
    'B77W': { size: 'heavy' },
    'B747': { size: 'heavy' },
    'A380': { size: 'super' },
    'E175': { size: 'regional' },
    'CRJ9': { size: 'regional' },
    'SU35': { size: 'regional' },
    'SU57': { size: 'regional' },
    'F22': { size: 'regional' },
    'F15': { size: 'regional' },
    'F16': { size: 'regional' },
  };

  return AIRCRAFT_TYPES[typeCode]?.size || 'narrow';
}
