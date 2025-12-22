import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { useUIStore, type CommandLogEntry } from '../../store';

export function CommandLog() {
  const { commandLog } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (commandLog.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed',
        bottom: 60,
        left: 20,
        width: 320,
        background: 'rgba(10, 14, 20, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 14px',
          background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.15), transparent)',
          border: 'none',
          borderBottom: isExpanded ? '1px solid rgba(0, 212, 255, 0.2)' : 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={14} style={{ color: '#00d4ff' }} />
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1,
            color: '#00d4ff',
          }}>
            ATC COMMAND LOG
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: '#6e7681',
            padding: '2px 6px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: 4,
          }}>
            {commandLog.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown size={14} style={{ color: '#6e7681' }} />
        ) : (
          <ChevronUp size={14} style={{ color: '#6e7681' }} />
        )}
      </button>

      {/* Log entries */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            style={{
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            {commandLog.slice(0, 10).map((entry, index) => (
              <CommandLogRow key={entry.id} entry={entry} isLatest={index === 0} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommandLogRow({ entry, isLatest }: { entry: CommandLogEntry; isLatest: boolean }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTypeColor = (type: CommandLogEntry['type']) => {
    switch (type) {
      case 'heading': return '#00d4ff';
      case 'altitude': return '#00ff88';
      case 'speed': return '#ffaa00';
      case 'squawk': return '#ff3366';
      case 'frequency': return '#aa88ff';
      case 'hold': return '#ff6600';
      default: return '#8b949e';
    }
  };

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, x: -20 } : {}}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 14px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
        background: isLatest ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
      }}
    >
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        color: '#6e7681',
        whiteSpace: 'nowrap',
      }}>
        {formatTime(entry.timestamp)}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        color: getTypeColor(entry.type),
        minWidth: 60,
      }}>
        {entry.callsign}
      </span>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 11,
        color: '#e6edf3',
        flex: 1,
      }}>
        {entry.command}
      </span>
    </motion.div>
  );
}
