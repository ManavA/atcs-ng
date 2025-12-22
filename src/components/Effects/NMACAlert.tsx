import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyStore } from '../../store';

interface NMACAlertProps {
  trackId1: string;
  trackId2: string;
  callsign1: string;
  callsign2: string;
}

export function NMACAlert({ trackId1, trackId2, callsign1, callsign2 }: NMACAlertProps) {
  const emergencies = useEmergencyStore((s: { activeEmergencies: ReturnType<typeof useEmergencyStore.getState>['activeEmergencies'] }) => s.activeEmergencies);
  const emergency = emergencies.find(
    (e: (typeof emergencies)[0]) => e.type === 'nmac' &&
    e.involvedTrackIds.includes(trackId1) &&
    e.involvedTrackIds.includes(trackId2)
  );

  if (!emergency) return null;

  const isActive = emergency.phase === 'active' || emergency.phase === 'warning';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(13, 17, 23, 0.95)',
            border: '2px solid #ff3366',
            borderRadius: 8,
            padding: 24,
            zIndex: 1000,
            textAlign: 'center',
            fontFamily: "'Orbitron', monospace",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              color: '#ff3366',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            ⚠️ TCAS RA ⚠️
          </motion.div>

          <div style={{ color: '#e6edf3', marginBottom: 16 }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>
              {callsign1} ↔ {callsign2}
            </div>
            <div style={{ fontSize: 14, color: '#8b949e' }}>
              NEAR MID-AIR COLLISION
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <div style={{
              padding: '8px 16px',
              background: '#00ff88',
              color: '#0a0e14',
              borderRadius: 4,
              fontWeight: 600,
            }}>
              ↑ CLIMB
            </div>
            <div style={{
              padding: '8px 16px',
              background: '#00d4ff',
              color: '#0a0e14',
              borderRadius: 4,
              fontWeight: 600,
            }}>
              ↓ DESCEND
            </div>
          </div>
        </motion.div>
      )}

      {emergency.phase === 'resolved' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 }}
          style={{
            position: 'fixed',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#00ff88',
            color: '#0a0e14',
            padding: '12px 24px',
            borderRadius: 4,
            fontFamily: "'Orbitron', monospace",
            fontWeight: 600,
            zIndex: 1000,
          }}
        >
          CONFLICT RESOLVED
        </motion.div>
      )}
    </AnimatePresence>
  );
}
