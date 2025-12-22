import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { useUIStore } from '../../store';
import { AircraftModel } from './AircraftModel';
import { AltitudeLayers } from './AltitudeLayers';
import type { Track } from '../../types';

interface Scene3DProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  mapCenter: [number, number];
}

// Convert lat/lng to scene coordinates (simplified mercator)
function latLngToScene(lat: number, lng: number, center: [number, number]): [number, number] {
  const scale = 100; // nm per unit
  const x = (lng - center[1]) * Math.cos((center[0] * Math.PI) / 180) * 60 * (scale / 100);
  const z = (lat - center[0]) * 60 * (scale / 100);
  return [x, -z];
}

// Convert altitude to scene Y coordinate
function altitudeToY(altitudeFt: number): number {
  return altitudeFt / 10000; // 1 unit = 10,000 ft
}

export function Scene3D({ tracks, selectedTrackId, onSelectTrack, mapCenter }: Scene3DProps) {
  const viewMode = useUIStore((s: { viewMode: string }) => s.viewMode);

  // Simplified camera positions for 2D and 3D modes
  const getCameraPosition = (): [number, number, number] => {
    if (viewMode === '3d') {
      return [8, 10, 12]; // Isometric-like 3D view
    }
    return [0, 15, 0.01]; // Top-down 2D view
  };

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <PerspectiveCamera
          makeDefault
          position={getCameraPosition()}
          fov={viewMode === '3d' ? 50 : 30}
        />

        {/* Enable orbit controls only in 3D mode */}
        {viewMode === '3d' && (
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            minDistance={5}
            maxDistance={40}
          />
        )}

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50, 50, 50]} />
          <meshBasicMaterial color="#0a0e14" wireframe opacity={0.3} transparent />
        </mesh>

        {/* Altitude layers */}
        <AltitudeLayers />

        {/* Aircraft */}
        {tracks.map((track) => {
          const [x, z] = latLngToScene(track.latitudeDeg, track.longitudeDeg, mapCenter);
          const y = altitudeToY(track.altitudeFt);

          return (
            <AircraftModel
              key={track.trackId}
              track={track}
              position={[x, y, z]}
              isSelected={track.trackId === selectedTrackId}
              onClick={() => onSelectTrack(track.trackId)}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
}
