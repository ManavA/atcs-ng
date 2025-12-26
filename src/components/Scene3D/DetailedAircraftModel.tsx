/**
 * Detailed Aircraft Model with LOD Support
 *
 * Renders aircraft at different detail levels based on camera distance:
 * - LOD 0: Simple point/pyramid (>50 units away)
 * - LOD 1: Basic cone shape (10-50 units)
 * - LOD 2: Recognizable aircraft with fuselage, wings (2-10 units)
 * - LOD 3: Detailed model with engines, windows, tail details (<2 units)
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Track } from '../../types';
import type { LODLevel } from '../../utils/LODManager';

interface DetailedAircraftModelProps {
  track: Track;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

export function DetailedAircraftModel({
  track,
  position,
  isSelected,
  onClick,
}: DetailedAircraftModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [lodLevel, setLodLevel] = useState<LODLevel>(1);

  // Calculate LOD based on distance from camera
  useEffect(() => {
    const cameraPos = camera.position;
    const dx = cameraPos.x - position[0];
    const dy = cameraPos.y - position[1];
    const dz = cameraPos.z - position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let newLod: LODLevel = 1;
    if (distance > 50) newLod = 0;
    else if (distance > 10) newLod = 1;
    else if (distance > 2) newLod = 2;
    else newLod = 3;

    setLodLevel(newLod);
  }, [camera.position.x, camera.position.y, camera.position.z, position]);

  // Rotate aircraft to heading
  const headingRad = useMemo(
    () => ((track.headingDeg - 90) * Math.PI) / 180,
    [track.headingDeg]
  );

  // Animate selection glow
  useFrame(({ clock }) => {
    if (glowRef.current && isSelected) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      glowRef.current.scale.setScalar(scale);
    }
  });

  // Get color based on climb/descent
  const getColor = () => {
    // Visual state colors take priority
    switch (track.visualState) {
      case 'hostile': return '#ff0000';
      case 'hijacked': return '#ff3300';
      case 'ghost': return '#6e7681';
      case 'hero': return '#00ff88';
    }

    // Normal flight phase colors
    if (track.verticalRateFpm > 500) return '#00ff88'; // Climbing
    if (track.verticalRateFpm < -500) return '#00d4ff'; // Descending
    return '#ffffff'; // Level
  };

  const color = getColor();

  return (
    <group ref={groupRef} position={position}>
      {/* Selection glow */}
      {isSelected && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.25} />
        </mesh>
      )}

      {/* Aircraft model at appropriate LOD */}
      <group rotation={[0, -headingRad, 0]}>
        {lodLevel === 0 && <SimpleDotModel color={color} isSelected={isSelected} />}
        {lodLevel === 1 && <BasicConeModel color={color} isSelected={isSelected} onClick={onClick} />}
        {lodLevel === 2 && <DetailedAircraftMesh color={color} isSelected={isSelected} onClick={onClick} track={track} />}
        {lodLevel === 3 && <FullDetailModel color={color} isSelected={isSelected} onClick={onClick} track={track} />}
      </group>

      {/* Trail line to ground (only at LOD 1+) */}
      {lodLevel >= 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, 0, 0, 0, -position[1], 0]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={`${color}44`} transparent opacity={0.3} />
        </line>
      )}

      {/* Data block (only at LOD 2+) */}
      {isSelected && lodLevel >= 2 && (
        <Html position={[0.4, 0.3, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(13, 17, 23, 0.95)',
              border: `1px solid ${color}`,
              borderRadius: 6,
              padding: '6px 10px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: color,
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{track.callsign}</div>
            <div>FL{Math.round(track.altitudeFt / 100)}</div>
            <div>{track.speedKt} KT</div>
            <div>{Math.round(track.headingDeg)}°</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// LOD 0: Simple glowing dot
function SimpleDotModel({ color, isSelected }: { color: string; isSelected: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 1.0 : 0.5}
      />
    </mesh>
  );
}

// LOD 1: Basic cone (current model)
function BasicConeModel({
  color,
  isSelected,
  onClick,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <coneGeometry args={[0.08, 0.25, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? color : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : 0}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

// LOD 2: Detailed aircraft with fuselage, wings, tail
function DetailedAircraftMesh({
  color,
  isSelected,
  onClick,
  track,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  track: Track;
}) {
  // Determine if wide-body (A380, 777, 747) or narrow-body
  const isWidebody = track.aircraftType?.includes('A380') ||
                     track.aircraftType?.includes('777') ||
                     track.aircraftType?.includes('747');

  const fuselageWidth = isWidebody ? 0.12 : 0.08;
  const fuselageLength = isWidebody ? 0.6 : 0.45;
  const wingSpan = isWidebody ? 0.65 : 0.5;

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Fuselage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[fuselageWidth, fuselageWidth * 0.6, fuselageLength, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Wings */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[wingSpan, 0.02, 0.15]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Horizontal Stabilizer */}
      <mesh position={[0, 0, -fuselageLength * 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[wingSpan * 0.4, 0.015, 0.08]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Vertical Stabilizer */}
      <mesh position={[0, fuselageWidth * 0.6, -fuselageLength * 0.35]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.015, fuselageWidth * 1.2, 0.12]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Engines (2 or 4 depending on type) */}
      {isWidebody ? (
        <>
          {/* 4 engines for wide-body */}
          <mesh position={[-wingSpan * 0.25, -0.05, 0.05]}>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-wingSpan * 0.4, -0.05, 0.05]}>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[wingSpan * 0.25, -0.05, 0.05]}>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[wingSpan * 0.4, -0.05, 0.05]}>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      ) : (
        <>
          {/* 2 engines for narrow-body */}
          <mesh position={[-wingSpan * 0.35, -0.04, 0.05]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[wingSpan * 0.35, -0.04, 0.05]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
}

// LOD 3: Full detail with windows, engine details, winglets
function FullDetailModel({
  color,
  isSelected,
  onClick,
  track,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  track: Track;
}) {
  const isWidebody = track.aircraftType?.includes('A380') ||
                     track.aircraftType?.includes('777') ||
                     track.aircraftType?.includes('747');

  const fuselageWidth = isWidebody ? 0.14 : 0.09;
  const fuselageLength = isWidebody ? 0.7 : 0.5;
  const wingSpan = isWidebody ? 0.75 : 0.55;

  // Window positions along fuselage
  const windowCount = isWidebody ? 24 : 16;
  const windows = Array.from({ length: windowCount }, (_, i) => i);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Main fuselage with segments for detail */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[fuselageWidth, fuselageWidth * 0.5, fuselageLength, 24, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Cockpit windows */}
      <mesh position={[0, fuselageWidth * 0.3, fuselageLength * 0.45]}>
        <sphereGeometry args={[fuselageWidth * 0.4, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#00d4ff"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Passenger windows */}
      {windows.map((i) => {
        const z = (i / windowCount - 0.5) * fuselageLength * 0.7;
        return (
          <group key={i}>
            <mesh position={[-fuselageWidth, 0, z]}>
              <circleGeometry args={[0.01, 8]} />
              <meshStandardMaterial color="#2a2a4e" emissive="#00d4ff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[fuselageWidth, 0, z]}>
              <circleGeometry args={[0.01, 8]} />
              <meshStandardMaterial color="#2a2a4e" emissive="#00d4ff" emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Main wings with airfoil shape */}
      <mesh position={[0, -fuselageWidth * 0.1, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[wingSpan, 0.03, 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Winglets */}
      <mesh position={[-wingSpan * 0.5, fuselageWidth * 0.3, 0.05]} rotation={[0, -Math.PI / 8, Math.PI / 2]}>
        <boxGeometry args={[0.08, 0.02, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[wingSpan * 0.5, fuselageWidth * 0.3, 0.05]} rotation={[0, Math.PI / 8, Math.PI / 2]}>
        <boxGeometry args={[0.08, 0.02, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Horizontal Stabilizer */}
      <mesh position={[0, 0, -fuselageLength * 0.42]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[wingSpan * 0.45, 0.02, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Vertical Stabilizer */}
      <mesh position={[0, fuselageWidth * 0.7, -fuselageLength * 0.38]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.02, fuselageWidth * 1.4, 0.15]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Detailed engines with nacelles */}
      {isWidebody ? (
        <>
          {[{ x: -wingSpan * 0.25 }, { x: -wingSpan * 0.42 }, { x: wingSpan * 0.25 }, { x: wingSpan * 0.42 }].map((pos, i) => (
            <Engine key={i} position={[pos.x, -fuselageWidth * 0.25, 0.05]} />
          ))}
        </>
      ) : (
        <>
          <Engine position={[-wingSpan * 0.38, -fuselageWidth * 0.2, 0.05]} />
          <Engine position={[wingSpan * 0.38, -fuselageWidth * 0.2, 0.05]} />
        </>
      )}

      {/* Landing gear (simplified) */}
      <mesh position={[0, -fuselageWidth * 0.8, fuselageLength * 0.1]}>
        <cylinderGeometry args={[0.01, 0.01, fuselageWidth * 0.6, 6]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Detailed engine component
function Engine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Engine nacelle */}
      <mesh>
        <cylinderGeometry args={[0.035, 0.04, 0.12, 16]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Intake */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.032, 0.035, 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Turbine blades (visible inside) */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={1.0} roughness={0.0} />
      </mesh>
    </group>
  );
}
