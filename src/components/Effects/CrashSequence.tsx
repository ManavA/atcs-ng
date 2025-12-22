import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyStore } from '../../store';
import { createParticleBurst, type Particle } from '../../animation';

interface CrashSequenceProps {
  trackId: string;
  callsign: string;
  position: { x: number; y: number };
}

export function CrashSequence({ trackId, callsign, position }: CrashSequenceProps) {
  const emergencies = useEmergencyStore((s: { activeEmergencies: ReturnType<typeof useEmergencyStore.getState>['activeEmergencies'] }) => s.activeEmergencies);
  const emergency = emergencies.find((e: (typeof emergencies)[0]) => e.involvedTrackIds.includes(trackId) && e.type === 'crash');

  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (emergency?.phase === 'active') {
      particlesRef.current = createParticleBurst(position.x, position.y, 50, {
        speed: 150,
        life: 2,
        colors: ['#ff3366', '#ffaa00', '#ff6600', '#ffffff'],
      });
    }
  }, [emergency?.phase, position]);

  if (!emergency) return null;

  return (
    <AnimatePresence>
      {emergency.phase === 'active' && (
        <>
          {/* Impact flash */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              left: position.x,
              top: position.y,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff, #ff6600, transparent)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />

          {/* Shockwave ring */}
          <motion.div
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 4 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: position.x,
              top: position.y,
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: '3px solid #ff3366',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {emergency.phase === 'aftermath' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
            color: '#6e7681',
            fontSize: 24,
            pointerEvents: 'none',
          }}
        >
          ✕
        </motion.div>
      )}

      {/* Emergency banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        style={{
          position: 'fixed',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff3366',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 4,
          fontFamily: "'Orbitron', monospace",
          fontWeight: 600,
          letterSpacing: 2,
          zIndex: 1000,
        }}
      >
        AIRCRAFT DOWN - {callsign}
      </motion.div>
    </AnimatePresence>
  );
}
