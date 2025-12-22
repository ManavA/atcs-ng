import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Monitor, Palette, Bell } from 'lucide-react';
import { AudioManager } from '../../audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [volume, setVolume] = useState(AudioManager.getVolume() * 100);
  const [muted, setMuted] = useState(AudioManager.isMuted());
  const [showScanlines, setShowScanlines] = useState(true);
  const [theme, setTheme] = useState<'default' | 'high-contrast' | 'classic'>('default');
  const [alertSounds, setAlertSounds] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    AudioManager.setVolume(newVolume / 100);
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    AudioManager.setMuted(newMuted);
  };

  const handleTestSound = () => {
    AudioManager.play('alert');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 480,
            maxHeight: '80vh',
            background: 'rgba(13, 17, 23, 0.98)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1), transparent)',
          }}>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 16,
              fontWeight: 600,
              color: '#00ff88',
              margin: 0,
              letterSpacing: 2,
            }}>
              SETTINGS
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                borderRadius: 4,
                padding: 8,
                color: '#ff3366',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 20, overflowY: 'auto' }}>
            {/* Audio Section */}
            <SettingsSection title="Audio" icon={Volume2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={handleMuteToggle}
                    style={{
                      background: muted ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                      border: `1px solid ${muted ? 'rgba(255, 51, 102, 0.5)' : 'rgba(0, 255, 136, 0.5)'}`,
                      borderRadius: 4,
                      padding: 8,
                      color: muted ? '#ff3366' : '#00ff88',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      disabled={muted}
                      style={{ width: '100%', accentColor: '#00ff88' }}
                    />
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: muted ? '#6e7681' : '#e6edf3',
                    width: 40,
                    textAlign: 'right',
                  }}>
                    {Math.round(volume)}%
                  </span>
                </div>
                <button
                  onClick={handleTestSound}
                  disabled={muted}
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: 4,
                    padding: '8px 16px',
                    color: muted ? '#6e7681' : '#00d4ff',
                    cursor: muted ? 'not-allowed' : 'pointer',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Test Alert Sound
                </button>
              </div>
            </SettingsSection>

            {/* Display Section */}
            <SettingsSection title="Display" icon={Monitor}>
              <ToggleSetting
                label="Scanline Effect"
                description="CRT-style scanline overlay"
                checked={showScanlines}
                onChange={setShowScanlines}
              />
              <ToggleSetting
                label="Reduced Motion"
                description="Minimize animations"
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </SettingsSection>

            {/* Alerts Section */}
            <SettingsSection title="Alerts" icon={Bell}>
              <ToggleSetting
                label="Alert Sounds"
                description="Play sounds for new alerts"
                checked={alertSounds}
                onChange={setAlertSounds}
              />
            </SettingsSection>

            {/* Theme Section */}
            <SettingsSection title="Theme" icon={Palette}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['default', 'high-contrast', 'classic'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: theme === t ? 'rgba(0, 255, 136, 0.2)' : 'rgba(30, 35, 42, 0.5)',
                      border: `1px solid ${theme === t ? 'rgba(0, 255, 136, 0.5)' : 'rgba(110, 118, 129, 0.3)'}`,
                      borderRadius: 4,
                      color: theme === t ? '#00ff88' : '#8b949e',
                      cursor: 'pointer',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </SettingsSection>
          </div>

          {/* Footer */}
          <div style={{
            padding: 16,
            borderTop: '1px solid rgba(0, 255, 136, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid rgba(0, 255, 136, 0.5)',
                borderRadius: 6,
                padding: '10px 24px',
                color: '#00ff88',
                cursor: 'pointer',
                fontFamily: "'Orbitron', monospace",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              DONE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: typeof Volume2;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <Icon size={14} style={{ color: '#00d4ff' }} />
        <h3 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: '#00d4ff',
          margin: 0,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {title}
        </h3>
      </div>
      <div style={{
        background: 'rgba(30, 35, 42, 0.5)',
        border: '1px solid rgba(0, 255, 136, 0.1)',
        borderRadius: 6,
        padding: 16,
      }}>
        {children}
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
    }}>
      <div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: '#e6edf3',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 11,
          color: '#6e7681',
        }}>
          {description}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: 'none',
          background: checked ? '#00ff88' : 'rgba(110, 118, 129, 0.4)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}
