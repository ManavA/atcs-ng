import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Compass,
  ArrowUp,
  ArrowDown,
  Gauge,
  Radio,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { VoiceNotification, CloudTTS } from '../../audio';
import { useUIStore } from '../../store';
import { useDemoMode } from '../../demo';

interface CommandModalProps {
  callsign: string;
  isOpen: boolean;
  onClose: () => void;
  onCommandSent?: (command: string) => void;
}

type CommandType = 'heading' | 'altitude' | 'speed' | 'squawk' | 'frequency' | 'hold' | 'other';

interface QuickCommand {
  label: string;
  command: string;
  type: CommandType;
  icon: typeof Compass;
}

export function CommandModal({
  callsign,
  isOpen,
  onClose,
  onCommandSent,
}: CommandModalProps) {
  const [customCommand, setCustomCommand] = useState('');
  const { addCommandLog } = useUIStore();
  const { state: demoState } = useDemoMode();

  const sendCommand = useCallback((command: string, type: CommandType) => {
    const fullCommand = `${callsign}, ${command}`;

    // Add to command log
    addCommandLog({
      callsign,
      command: fullCommand,
      type,
    });

    // Speak the command (use CloudTTS during demo, VoiceNotification otherwise)
    const isDemoActive = demoState.isActive && demoState.mode === 'playing';
    if (isDemoActive) {
      CloudTTS.speakATC(fullCommand);
    } else {
      VoiceNotification.speakATC(fullCommand);
    }

    // Callback
    onCommandSent?.(fullCommand);

    // Close modal
    onClose();
  }, [callsign, addCommandLog, onCommandSent, onClose, demoState.isActive, demoState.mode]);

  const quickCommands: QuickCommand[] = [
    { label: 'Turn Left 30°', command: 'turn left heading 030', type: 'heading', icon: RotateCcw },
    { label: 'Turn Right 30°', command: 'turn right heading 330', type: 'heading', icon: Compass },
    { label: 'Climb FL350', command: 'climb and maintain flight level 350', type: 'altitude', icon: ArrowUp },
    { label: 'Descend FL250', command: 'descend and maintain flight level 250', type: 'altitude', icon: ArrowDown },
    { label: 'Reduce Speed', command: 'reduce speed to 250 knots', type: 'speed', icon: Gauge },
    { label: 'Hold Position', command: 'hold present position, expect further clearance', type: 'hold', icon: Radio },
    { label: 'Squawk 7700', command: 'squawk 7700, declaring emergency', type: 'squawk', icon: AlertTriangle },
  ];

  const handleCustomSubmit = () => {
    if (customCommand.trim()) {
      sendCommand(customCommand.trim(), 'other');
      setCustomCommand('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9998,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              background: 'rgba(13, 17, 23, 0.98)',
              border: '1px solid rgba(0, 212, 255, 0.5)',
              borderRadius: 12,
              overflow: 'hidden',
              zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.2)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.2), transparent)',
              borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#00d4ff',
                  margin: 0,
                  letterSpacing: 2,
                }}>
                  SEND COMMAND
                </h2>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: '#8b949e',
                  marginTop: 4,
                }}>
                  To: <span style={{ color: '#00ff88', fontWeight: 600 }}>{callsign}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  background: 'transparent',
                  border: '1px solid rgba(255, 51, 102, 0.3)',
                  borderRadius: 4,
                  color: '#ff3366',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick commands grid */}
            <div style={{
              padding: '16px 20px',
            }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: '#6e7681',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                Quick Commands
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
              }}>
                {quickCommands.map((cmd) => (
                  <button
                    key={cmd.label}
                    onClick={() => sendCommand(cmd.command, cmd.type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      background: 'rgba(0, 255, 136, 0.05)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                      borderRadius: 6,
                      color: '#e6edf3',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.2)';
                    }}
                  >
                    <cmd.icon size={14} style={{ color: '#00ff88' }} />
                    {cmd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom command input */}
            <div style={{
              padding: '0 20px 20px',
            }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: '#6e7681',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}>
                Custom Command
              </div>
              <div style={{
                display: 'flex',
                gap: 8,
              }}>
                <input
                  type="text"
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="Enter ATC instruction..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: 6,
                    color: '#e6edf3',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customCommand.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    background: customCommand.trim()
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${customCommand.trim() ? 'rgba(0, 212, 255, 0.5)' : 'rgba(110, 118, 129, 0.3)'}`,
                    borderRadius: 6,
                    color: customCommand.trim() ? '#00d4ff' : '#6e7681',
                    cursor: customCommand.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Hint */}
            <div style={{
              padding: '12px 20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderTop: '1px solid rgba(0, 255, 136, 0.1)',
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: '#6e7681',
                textAlign: 'center',
              }}>
                Commands will be spoken and logged to the command panel
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
