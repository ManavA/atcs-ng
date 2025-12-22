import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Track } from '../../types';

interface AircraftModelProps {
  track: Track;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

export function AircraftModel({ track, position, isSelected, onClick }: AircraftModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Rotate aircraft to heading
  const headingRad = ((track.headingDeg - 90) * Math.PI) / 180;

  useFrame(({ clock }) => {
    if (glowRef.current && isSelected) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const getColor = () => {
    if (track.verticalRateFpm > 500) return '#00ff88'; // Climbing
    if (track.verticalRateFpm < -500) return '#00d4ff'; // Descending
    return '#ffffff'; // Level
  };

  return (
    <group position={position}>
      {/* Selection glow */}
      {isSelected && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Aircraft body (simplified cone) */}
      <mesh
        ref={meshRef}
        rotation={[0, -headingRad, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={isSelected ? '#00ff88' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      {/* Trail line to ground */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0, -position[1], 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff8844" transparent opacity={0.3} />
      </line>

      {/* Data block */}
      {isSelected && (
        <Html position={[0.3, 0.2, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(13, 17, 23, 0.9)',
              border: '1px solid #00ff88',
              borderRadius: 4,
              padding: '4px 8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#00ff88',
              whiteSpace: 'nowrap',
            }}
          >
            <div>{track.callsign}</div>
            <div>FL{Math.round(track.altitudeFt / 100)}</div>
            <div>{track.speedKt}KT</div>
          </div>
        </Html>
      )}
    </group>
  );
}
