import { motion } from 'framer-motion';
import { useUIStore } from '../../store';

export function TimeSlider() {
  const { timeOffsetMinutes, setTimeOffset, isPlaying, togglePlayback, playbackSpeed, setPlaybackSpeed } = useUIStore();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      background: 'rgba(13, 17, 23, 0.9)',
      borderRadius: 6,
      border: '1px solid rgba(0, 255, 136, 0.2)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
    }}>
      <span style={{ color: '#00d4ff' }}>4D</span>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlayback}
        style={{
          width: 28,
          height: 28,
          background: isPlaying ? '#00ff88' : 'transparent',
          color: isPlaying ? '#0a0e14' : '#00ff88',
          border: '1px solid #00ff88',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </motion.button>

      <input
        type="range"
        min={0}
        max={60}
        value={timeOffsetMinutes}
        onChange={(e) => setTimeOffset(Number(e.target.value))}
        style={{
          width: 120,
          accentColor: '#00ff88',
        }}
      />

      <span style={{ color: '#e6edf3', minWidth: 50 }}>
        +{timeOffsetMinutes}min
      </span>

      <select
        value={playbackSpeed}
        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
        style={{
          padding: '4px 8px',
          background: 'rgba(0, 0, 0, 0.3)',
          color: '#00ff88',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: 4,
          fontSize: 10,
        }}
      >
        <option value={1}>1x</option>
        <option value={5}>5x</option>
        <option value={10}>10x</option>
      </select>
    </div>
  );
}
