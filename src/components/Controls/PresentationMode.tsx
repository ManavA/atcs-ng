import { motion } from 'framer-motion';
import { useUIStore, type PresentationMode } from '../../store';

const modes: { mode: PresentationMode; label: string; description: string }[] = [
  { mode: 'cinematic', label: 'CINEMATIC', description: 'Full effects' },
  { mode: 'professional', label: 'PROFESSIONAL', description: 'Clean alerts' },
  { mode: 'silent', label: 'SILENT', description: 'Visual only' },
];

export function PresentationModeToggle() {
  const { presentationMode, setPresentationMode } = useUIStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: 8,
      background: 'rgba(13, 17, 23, 0.9)',
      borderRadius: 6,
      border: '1px solid rgba(0, 255, 136, 0.2)',
    }}>
      <div style={{
        fontSize: 9,
        color: '#6e7681',
        fontFamily: "'Orbitron', monospace",
        letterSpacing: 1,
        marginBottom: 4,
      }}>
        PRESENTATION MODE
      </div>
      {modes.map(({ mode, label, description }) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPresentationMode(mode)}
          style={{
            padding: '6px 12px',
            background: presentationMode === mode ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
            color: presentationMode === mode ? '#00ff88' : '#8b949e',
            border: presentationMode === mode ? '1px solid #00ff88' : '1px solid transparent',
            borderRadius: 4,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
          <span style={{ fontSize: 9, opacity: 0.7 }}>{description}</span>
        </motion.button>
      ))}
    </div>
  );
}
