import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastForward, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../store';

const SPEED_OPTIONS = [
  { value: 1, label: '1x Real-time' },
  { value: 2, label: '2x Fast' },
  { value: 4, label: '4x Demo', default: true },
  { value: 8, label: '8x Rapid' },
  { value: 16, label: '16x Ultra' },
];

export function SpeedControl() {
  const { simulationSpeed, setSimulationSpeed } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: simulationSpeed > 1
            ? 'rgba(0, 212, 255, 0.15)'
            : 'rgba(0, 255, 136, 0.05)',
          border: `1px solid ${simulationSpeed > 1 ? 'rgba(0, 212, 255, 0.4)' : 'rgba(0, 255, 136, 0.2)'}`,
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: simulationSpeed > 1 ? '#00d4ff' : '#6e7681',
        }}
      >
        <motion.div
          animate={simulationSpeed > 1 ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <FastForward size={12} />
        </motion.div>
        <span style={{ fontWeight: 600 }}>{simulationSpeed}x</span>
        <span style={{
          fontSize: 9,
          color: '#6e7681',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          SPEED
        </span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99,
              }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                minWidth: 140,
                background: 'rgba(13, 17, 23, 0.98)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 6,
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              }}
            >
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSimulationSpeed(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 12px',
                    background: option.value === simulationSpeed
                      ? 'rgba(0, 255, 136, 0.15)'
                      : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
                    color: option.value === simulationSpeed ? '#00ff88' : '#8b949e',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{option.label}</span>
                  {option.default && (
                    <span style={{
                      fontSize: 9,
                      padding: '2px 4px',
                      background: 'rgba(0, 212, 255, 0.2)',
                      borderRadius: 2,
                      color: '#00d4ff',
                    }}>
                      DEFAULT
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
