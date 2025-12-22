import { motion } from 'framer-motion';
import { Play, Radio } from 'lucide-react';
import { useUIStore } from '../../store';
import { useDemoMode } from '../../demo';

export function ModeToggle() {
  const { appMode, setAppMode } = useUIStore();
  const { openMenu, closeDemo, state: demoState } = useDemoMode();

  const handleModeChange = (mode: 'demo' | 'live') => {
    if (mode === appMode) return;

    setAppMode(mode);

    if (mode === 'demo') {
      // Switch to demo - open the demo
      openMenu();
    } else {
      // Switch to live - close any running demo
      if (demoState.isActive) {
        closeDemo();
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: 2,
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 6,
      border: '1px solid rgba(0, 255, 136, 0.2)',
    }}>
      <ModeButton
        active={appMode === 'demo'}
        onClick={() => handleModeChange('demo')}
        icon={Play}
        label="DEMO"
        activeColor="#00ff88"
      />
      <ModeButton
        active={appMode === 'live'}
        onClick={() => handleModeChange('live')}
        icon={Radio}
        label="LIVE"
        activeColor="#00d4ff"
      />
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
  activeColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Play;
  label: string;
  activeColor: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        background: active
          ? `linear-gradient(135deg, ${activeColor}20, ${activeColor}10)`
          : 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        color: active ? activeColor : '#6e7681',
        transition: 'all 0.2s ease',
      }}
    >
      <motion.div
        animate={active ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.6 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Icon size={12} />
      </motion.div>
      {label}
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: activeColor,
            boxShadow: `0 0 8px ${activeColor}`,
          }}
        />
      )}
    </motion.button>
  );
}
