import { motion, AnimatePresence } from 'framer-motion';

interface WhatIfOverlayProps {
  isActive: boolean;
  onApply: () => void;
  onCancel: () => void;
}

export function WhatIfOverlay({ isActive, onApply, onCancel }: WhatIfOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 100, 200, 0.1)',
              pointerEvents: 'none',
              zIndex: 800,
            }}
          />
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            style={{
              position: 'fixed',
              top: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(13, 17, 23, 0.95)',
              border: '2px solid #00d4ff',
              borderRadius: 8,
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              zIndex: 900,
              fontFamily: "'Orbitron', monospace",
            }}
          >
            <div style={{
              width: 12,
              height: 12,
              background: '#00d4ff',
              borderRadius: '50%',
              animation: 'pulse 1s infinite',
            }} />
            <span style={{ color: '#00d4ff', letterSpacing: 2 }}>
              SIMULATION MODE
            </span>
            <button
              onClick={onApply}
              style={{
                padding: '6px 16px',
                background: '#00ff88',
                color: '#0a0e14',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              APPLY
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '6px 16px',
                background: 'transparent',
                color: '#ff3366',
                border: '1px solid #ff3366',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
