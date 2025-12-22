import { Volume2, Mic, Bell, Globe } from 'lucide-react';
import { useUIStore } from '../../store';

interface ToggleProps {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

function AudioToggle({ icon, label, enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: enabled ? 'rgba(0, 255, 136, 0.15)' : 'rgba(100, 100, 100, 0.2)',
        border: `1px solid ${enabled ? '#00ff88' : '#444'}`,
        borderRadius: 4,
        color: enabled ? '#00ff88' : '#666',
        cursor: 'pointer',
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
    >
      {icon}
      <span>{label}</span>
      <span style={{
        padding: '1px 6px',
        background: enabled ? '#00ff88' : '#444',
        color: enabled ? '#000' : '#888',
        borderRadius: 3,
        fontSize: 9,
        fontWeight: 700,
      }}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

export function AudioControls() {
  const {
    narrationEnabled,
    atcAudioEnabled,
    alertSoundsEnabled,
    autoTranslate,
    audioVolume,
    setNarrationEnabled,
    setAtcAudioEnabled,
    setAlertSoundsEnabled,
    setAutoTranslate,
    setAudioVolume,
  } = useUIStore();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 12px',
      background: 'rgba(13, 17, 23, 0.9)',
      borderRadius: 6,
      border: '1px solid rgba(0, 255, 136, 0.15)',
    }}>
      <AudioToggle
        icon={<Volume2 size={14} />}
        label="Narration"
        enabled={narrationEnabled}
        onToggle={() => setNarrationEnabled(!narrationEnabled)}
      />

      <AudioToggle
        icon={<Mic size={14} />}
        label="ATC"
        enabled={atcAudioEnabled}
        onToggle={() => setAtcAudioEnabled(!atcAudioEnabled)}
      />

      <AudioToggle
        icon={<Bell size={14} />}
        label="Alerts"
        enabled={alertSoundsEnabled}
        onToggle={() => setAlertSoundsEnabled(!alertSoundsEnabled)}
      />

      <AudioToggle
        icon={<Globe size={14} />}
        label="Auto-Translate"
        enabled={autoTranslate}
        onToggle={() => setAutoTranslate(!autoTranslate)}
      />

      {/* Volume slider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
        paddingLeft: 8,
        borderLeft: '1px solid rgba(0, 255, 136, 0.2)',
      }}>
        <Volume2 size={14} color="#00ff88" />
        <input
          type="range"
          min={0}
          max={100}
          value={audioVolume * 100}
          onChange={(e) => setAudioVolume(Number(e.target.value) / 100)}
          style={{
            width: 60,
            accentColor: '#00ff88',
            cursor: 'pointer',
          }}
        />
        <span style={{
          color: '#00ff88',
          fontSize: 10,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 600,
          minWidth: 28,
        }}>
          {Math.round(audioVolume * 100)}%
        </span>
      </div>
    </div>
  );
}
