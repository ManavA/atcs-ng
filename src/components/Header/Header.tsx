import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  Settings,
  Maximize,
  Minimize,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { SettingsModal, HelpModal } from '../Modals';
import { SpeedControl, ModeToggle } from '../Controls';
import { AudioControls } from '../AudioControls';

interface HeaderProps {
  onToggleDataBlocks: () => void;
  onToggleTrails: () => void;
  showDataBlocks: boolean;
  showTrails: boolean;
}

export function Header({
  onToggleDataBlocks,
  onToggleTrails,
  showDataBlocks,
  showTrails,
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleResetView = useCallback(() => {
    // Dispatch a custom event that the map can listen to
    window.dispatchEvent(new CustomEvent('resetMapView'));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fullscreen not available
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 20px',
        background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.98), rgba(10, 14, 20, 0.95))',
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
      }}>
        {/* Logo and title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radar size={28} style={{ color: '#00ff88' }} />
          </motion.div>
          <div>
            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              color: '#00ff88',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              margin: 0,
            }}>
              ATCS-NG
            </h1>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9,
              letterSpacing: 2,
              color: '#6e7681',
              textTransform: 'uppercase',
            }}>
              Command Center
            </div>
          </div>
        </div>

        {/* Version badge */}
        <div style={{
          padding: '4px 8px',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: 4,
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: '#00d4ff',
            letterSpacing: 0.5,
          }}>
            v2.4.0
          </span>
        </div>

        {/* Mode Toggle (DEMO/LIVE) */}
        <ModeToggle />

        {/* Simulation Speed Control */}
        <SpeedControl />

        {/* Sector info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: 4,
        }}>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 10,
            color: '#6e7681',
            letterSpacing: 1,
          }}>
            SECTOR
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: '#00d4ff',
          }}>
            BOS_33
          </span>
        </div>

        {/* Audio Controls */}
        <AudioControls />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Display controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <ToggleButton
            active={showDataBlocks}
            onClick={onToggleDataBlocks}
            label="📊 Data Blocks"
            tooltip="Toggle data blocks (D)"
          />
          <ToggleButton
            active={showTrails}
            onClick={onToggleTrails}
            label="〰️ Trails"
            tooltip="Toggle track trails (T)"
          />
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(0, 255, 136, 0.2)' }} />

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <IconButton
            icon={RotateCcw}
            tooltip="Reset view"
            onClick={handleResetView}
          />
          <IconButton
            icon={isFullscreen ? Minimize : Maximize}
            tooltip={isFullscreen ? "Exit fullscreen (F11)" : "Fullscreen (F11)"}
            onClick={handleToggleFullscreen}
          />
          <IconButton
            icon={Settings}
            tooltip="Settings"
            onClick={() => setIsSettingsOpen(true)}
          />
          <IconButton
            icon={HelpCircle}
            tooltip="Help (?)"
            onClick={() => setIsHelpOpen(true)}
          />
        </div>
      </header>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  tooltip,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tooltip: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 1,
        padding: '6px 12px',
        background: active ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
        border: `1px solid ${active ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 255, 136, 0.2)'}`,
        borderRadius: 4,
        color: active ? '#00ff88' : '#6e7681',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}

function IconButton({
  icon: Icon,
  tooltip,
  onClick,
}: {
  icon: typeof Settings;
  tooltip: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, borderColor: 'rgba(0, 255, 136, 0.5)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={tooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        background: 'transparent',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: 4,
        color: '#6e7681',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon size={16} />
    </motion.button>
  );
}
