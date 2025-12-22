import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { Trajectory } from '../../types';

interface Trajectory4DProps {
  trajectory: Trajectory;
  mapCenter: [number, number];
  timeOffsetMinutes: number;
}

function latLngToScene(lat: number, lng: number, center: [number, number]): [number, number] {
  const scale = 100;
  const x = (lng - center[1]) * Math.cos((center[0] * Math.PI) / 180) * 60 * (scale / 100);
  const z = (lat - center[0]) * 60 * (scale / 100);
  return [x, -z];
}

export function Trajectory4D({ trajectory, mapCenter, timeOffsetMinutes }: Trajectory4DProps) {
  const now = Date.now();
  const futureTime = now + timeOffsetMinutes * 60 * 1000;

  const points = useMemo(() => {
    return trajectory.points
      .filter((p) => p.timestamp <= futureTime)
      .map((p) => {
        const [x, z] = latLngToScene(p.lat, p.lng, mapCenter);
        const y = p.altitude / 10000;
        return [x, y, z] as [number, number, number];
      });
  }, [trajectory.points, mapCenter, futureTime]);

  if (points.length < 2) return null;

  return (
    <group>
      <Line points={points} color="#00ff88" lineWidth={2} />
      {trajectory.conflicts.map((conflict, i) => {
        const [cx, cz] = latLngToScene(conflict.lat, conflict.lng, mapCenter);
        const cy = conflict.altitude / 10000;
        return (
          <mesh key={i} position={[cx, cy, cz]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
