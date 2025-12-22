import { motion } from 'framer-motion';

interface QuickActionsProps {
  onAction: (type: string) => void;
  disabled?: boolean;
}

const actions = [
  { type: 'CLIMB', label: 'CLIMB', color: '#00ff88' },
  { type: 'DESCEND', label: 'DESCEND', color: '#00d4ff' },
  { type: 'TURN', label: 'TURN', color: '#ffaa00' },
  { type: 'SPEED', label: 'SPEED', color: '#ff6600' },
  { type: 'HOLD', label: 'HOLD', color: '#8b949e' },
];

export function QuickActions({ onAction, disabled = false }: QuickActionsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: 8,
      background: 'rgba(13, 17, 23, 0.9)',
      borderRadius: 4,
      border: '1px solid rgba(0, 255, 136, 0.2)',
    }}>
      {actions.map(({ type, label, color }) => (
        <motion.button
          key={type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(type)}
          disabled={disabled}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            color: disabled ? '#6e7681' : color,
            border: `1px solid ${disabled ? '#6e7681' : color}`,
            borderRadius: 4,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}
