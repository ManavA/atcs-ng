import { useMemo } from 'react';
import { Text } from '@react-three/drei';

const ALTITUDE_LAYERS = [
  { altitude: 10000, label: 'FL100', color: '#00ff8822' },
  { altitude: 20000, label: 'FL200', color: '#00ff8833' },
  { altitude: 30000, label: 'FL300', color: '#00ff8844' },
  { altitude: 40000, label: 'FL400', color: '#00ff8855' },
];

export function AltitudeLayers() {
  const layers = useMemo(() => {
    return ALTITUDE_LAYERS.map(({ altitude, label, color }) => ({
      y: altitude / 10000,
      label,
      color,
    }));
  }, []);

  return (
    <>
      {layers.map(({ y, label, color }) => (
        <group key={label} position={[0, y, 0]}>
          {/* Altitude plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshBasicMaterial color={color} transparent opacity={0.1} side={2} />
          </mesh>

          {/* Altitude label */}
          <Text
            position={[-18, 0, 0]}
            fontSize={0.3}
            color="#00ff88"
            anchorX="left"
            anchorY="middle"
          >
            {label}
          </Text>
        </group>
      ))}
    </>
  );
}
