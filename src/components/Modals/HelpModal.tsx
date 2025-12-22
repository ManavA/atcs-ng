import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Mouse, Monitor, Zap, AlertCircle, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
            width: 600,
            maxHeight: '85vh',
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
              HELP & CONTROLS
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
          <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}>
            {/* Quick Start */}
            <HelpSection title="Quick Start" icon={Zap}>
              <p style={{ color: '#e6edf3', lineHeight: 1.6, margin: 0 }}>
                ATCS-NG is an AI-powered air traffic control system. Click on any aircraft to see details,
                acknowledge alerts in the right panel, and use the Demo button to explore system capabilities.
              </p>
            </HelpSection>

            {/* Mouse Controls */}
            <HelpSection title="Mouse Controls" icon={Mouse}>
              <HelpItem shortcut="Click aircraft" description="Select and view flight details" />
              <HelpItem shortcut="Click empty space" description="Deselect current aircraft" />
              <HelpItem shortcut="Scroll" description="Zoom radar in/out" />
              <HelpItem shortcut="Drag" description="Pan radar view" />
              <HelpItem shortcut="Click callsign tag" description="Jump to flight on map" />
            </HelpSection>

            {/* Keyboard Shortcuts */}
            <HelpSection title="Keyboard Shortcuts" icon={Keyboard}>
              <HelpItem shortcut="D" description="Toggle data blocks" />
              <HelpItem shortcut="T" description="Toggle track trails" />
              <HelpItem shortcut="Esc" description="Close modals / Deselect" />
              <HelpItem shortcut="F11" description="Toggle fullscreen" />
              <HelpItem shortcut="M" description="Mute/unmute sounds" />
            </HelpSection>

            {/* Display */}
            <HelpSection title="Display Elements" icon={Monitor}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <DisplayItem color="#00ff88" label="Aircraft Track" description="Normal flight" />
                <DisplayItem color="#00d4ff" label="Selected Track" description="Currently selected aircraft" />
                <DisplayItem color="#ffaa00" label="Warning" description="Potential conflict or issue" />
                <DisplayItem color="#ff3366" label="Critical" description="Emergency or immediate action required" />
              </div>
            </HelpSection>

            {/* Alert Types */}
            <HelpSection title="Alert Types" icon={AlertCircle}>
              <AlertTypeItem
                severity="CRITICAL"
                color="#ff3366"
                description="Immediate action required - emergency, loss of separation, TCAS RA"
              />
              <AlertTypeItem
                severity="WARNING"
                color="#ffaa00"
                description="Attention needed - predicted conflict, weather hazard, deviation"
              />
              <AlertTypeItem
                severity="INFO"
                color="#00d4ff"
                description="Informational - handoffs, status updates, advisories"
              />
            </HelpSection>

            {/* About */}
            <HelpSection title="About ATCS-NG" icon={Info}>
              <p style={{ color: '#8b949e', lineHeight: 1.6, margin: 0, fontSize: 13 }}>
                ATCS-NG (Next Generation Air Traffic Control System) is a demonstration of AI-powered
                air traffic management. This system showcases real-time surveillance, predictive conflict
                detection, and intelligent traffic optimization.
              </p>
              <div style={{
                marginTop: 12,
                padding: 12,
                background: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: 6,
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#6e7681',
                }}>
                  Version 2.0.0 | Sector: BOS_33
                </span>
              </div>
            </HelpSection>
          </div>

          {/* Footer */}
          <div style={{
            padding: 16,
            borderTop: '1px solid rgba(0, 255, 136, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
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
              CLOSE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function HelpSection({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: typeof Keyboard;
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

function HelpItem({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: '1px solid rgba(110, 118, 129, 0.1)',
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        padding: '4px 8px',
        background: 'rgba(0, 255, 136, 0.1)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: 4,
        color: '#00ff88',
      }}>
        {shortcut}
      </span>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 13,
        color: '#8b949e',
      }}>
        {description}
      </span>
    </div>
  );
}

function DisplayItem({ color, label, description }: { color: string; label: string; description: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }} />
      <div>
        <span style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#e6edf3',
        }}>
          {label}
        </span>
        <span style={{ color: '#6e7681', fontSize: 12 }}> — {description}</span>
      </div>
    </div>
  );
}

function AlertTypeItem({ severity, color, description }: { severity: string; color: string; description: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '8px 0',
      borderBottom: '1px solid rgba(110, 118, 129, 0.1)',
    }}>
      <span style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 9,
        fontWeight: 600,
        padding: '4px 8px',
        borderRadius: 4,
        background: `${color}20`,
        border: `1px solid ${color}50`,
        color: color,
        flexShrink: 0,
      }}>
        {severity}
      </span>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 12,
        color: '#8b949e',
        lineHeight: 1.5,
      }}>
        {description}
      </span>
    </div>
  );
}
