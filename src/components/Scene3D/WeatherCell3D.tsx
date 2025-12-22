import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WeatherCell } from '../../types';

interface WeatherCell3DProps {
  cell: WeatherCell;
  mapCenter: [number, number];
}

function latLngToScene(lat: number, lng: number, center: [number, number]): [number, number] {
  const scale = 100;
  const x = (lng - center[1]) * Math.cos((center[0] * Math.PI) / 180) * 60 * (scale / 100);
  const z = (lat - center[0]) * 60 * (scale / 100);
  return [x, -z];
}

const severityColors: Record<number, string> = {
  1: '#00d4ff',
  2: '#ffff00',
  3: '#ffaa00',
  4: '#ff6600',
  5: '#ff3366',
};

export function WeatherCell3D({ cell, mapCenter }: WeatherCell3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [x, z] = latLngToScene(cell.centerLat, cell.centerLng, mapCenter);
  const baseY = cell.baseAltitude / 10000;
  const topY = cell.topAltitude / 10000;
  const height = topY - baseY;
  const radius = cell.radiusNm * 0.5;

  useFrame(() => {
    if (meshRef.current && cell.lightningActive) {
      const flash = Math.random() > 0.995;
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = flash ? 0.8 : 0.4;
    }
  });

  return (
    <group position={[x, baseY + height / 2, z]}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius, radius * 1.2, height, 16]} />
        <meshStandardMaterial
          color={severityColors[cell.severity] || '#ffaa00'}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
