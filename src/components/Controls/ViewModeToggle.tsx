import { motion } from 'framer-motion';
import { useUIStore, type ViewMode } from '../../store';

const viewModes: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: '2d', label: '2D RADAR', icon: '◫' },
  { mode: '3d', label: '3D VIEW', icon: '◇' },
];

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: 4,
      background: 'rgba(13, 17, 23, 0.9)',
      borderRadius: 6,
      border: '1px solid rgba(0, 255, 136, 0.2)',
    }}>
      {viewModes.map(({ mode, label, icon }) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode(mode)}
          style={{
            padding: '6px 12px',
            background: viewMode === mode ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            color: viewMode === mode ? '#00ff88' : '#6e7681',
            border: viewMode === mode ? '1px solid #00ff88' : '1px solid transparent',
            borderRadius: 4,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>{icon}</span>
          {label}
        </motion.button>
      ))}
    </div>
  );
}
