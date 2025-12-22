import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergencyStore } from '../../store';
import { generateShake } from '../../animation';

export function ScreenEffects() {
  const { screenShake, clearScreenShake, vignetteColor } = useEmergencyStore();
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!screenShake) {
      setShakeOffset({ x: 0, y: 0 });
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= screenShake.duration) {
        setShakeOffset({ x: 0, y: 0 });
        clearScreenShake();
        return;
      }

      const decay = 1 - elapsed / screenShake.duration;
      const shake = generateShake(screenShake.intensity * decay);
      setShakeOffset(shake);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [screenShake, clearScreenShake]);

  return (
    <>
      {/* Screen shake transform */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
          pointerEvents: 'none',
          zIndex: 9990,
        }}
      />

      {/* Vignette overlay */}
      {vignetteColor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 30%, ${vignetteColor} 100%)`,
            pointerEvents: 'none',
            zIndex: 9991,
          }}
        />
      )}
    </>
  );
}
