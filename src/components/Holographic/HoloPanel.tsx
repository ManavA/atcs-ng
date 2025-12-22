import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface HoloPanelProps {
  children: ReactNode;
  title?: string;
  priority?: 'normal' | 'warning' | 'critical';
  className?: string;
  onClose?: () => void;
  floating?: boolean;
}

const priorityColors = {
  normal: 'rgba(0, 212, 255, 0.8)',
  warning: 'rgba(255, 170, 0, 0.8)',
  critical: 'rgba(255, 51, 102, 0.8)',
};

const priorityGlows = {
  normal: '0 0 20px rgba(0, 212, 255, 0.3)',
  warning: '0 0 20px rgba(255, 170, 0, 0.3)',
  critical: '0 0 30px rgba(255, 51, 102, 0.4)',
};

export function HoloPanel({
  children,
  title,
  priority = 'normal',
  className = '',
  onClose,
  floating = false,
}: HoloPanelProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!floating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x: x * 5, y: y * 5 });
  };

  return (
    <motion.div
      className={`holo-panel ${className}`}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      style={{
        background: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${priorityColors[priority]}`,
        borderRadius: 8,
        boxShadow: priorityGlows[priority],
        overflow: 'hidden',
        transform: floating
          ? `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`
          : undefined,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.02) 2px, rgba(0, 212, 255, 0.02) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Data stream decoration */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          right: 8,
          width: 2,
          height: '100%',
          background: `linear-gradient(180deg, transparent, ${priorityColors[priority]}, transparent)`,
          opacity: 0.3,
        }}
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Header */}
      {title && (
        <div
          style={{
            padding: '8px 16px',
            borderBottom: `1px solid ${priorityColors[priority]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'Orbitron', monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: priorityColors[priority],
          }}
        >
          <span>{title}</span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: priorityColors[priority],
                cursor: 'pointer',
                fontSize: 16,
                opacity: 0.7,
              }}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: 16 }}>{children}</div>

      {/* Corner accents */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          borderTop: `2px solid ${priorityColors[priority]}`,
          borderLeft: `2px solid ${priorityColors[priority]}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 20,
          height: 20,
          borderTop: `2px solid ${priorityColors[priority]}`,
          borderRight: `2px solid ${priorityColors[priority]}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 20,
          height: 20,
          borderBottom: `2px solid ${priorityColors[priority]}`,
          borderLeft: `2px solid ${priorityColors[priority]}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          borderBottom: `2px solid ${priorityColors[priority]}`,
          borderRight: `2px solid ${priorityColors[priority]}`,
        }}
      />
    </motion.div>
  );
}
