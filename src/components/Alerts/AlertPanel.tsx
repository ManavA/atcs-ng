import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Bell,
} from 'lucide-react';
import type { Alert } from '../../types';
import { AudioManager, VoiceNotification } from '../../audio';
import { useDemoMode } from '../../demo';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onSelectFlight?: (flightId: string) => void;
}

const severityConfig = {
  CRITICAL: {
    icon: AlertTriangle,
    color: '#ff3366',
    bgColor: 'rgba(255, 51, 102, 0.15)',
    borderColor: 'rgba(255, 51, 102, 0.5)',
    label: 'CRIT',
  },
  WARNING: {
    icon: AlertCircle,
    color: '#ffaa00',
    bgColor: 'rgba(255, 170, 0, 0.1)',
    borderColor: 'rgba(255, 170, 0, 0.4)',
    label: 'WARN',
  },
  INFO: {
    icon: Info,
    color: '#00d4ff',
    bgColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    label: 'INFO',
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function AlertItem({
  alert,
  onAcknowledge,
  onSelectFlight,
}: {
  alert: Alert;
  onAcknowledge: () => void;
  onSelectFlight?: (flightId: string) => void;
}) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        ...(alert.severity === 'CRITICAL' && !alert.acknowledged
          ? { boxShadow: ['0 0 5px rgba(255, 51, 102, 0.3)', '0 0 15px rgba(255, 51, 102, 0.5)', '0 0 5px rgba(255, 51, 102, 0.3)'] }
          : {}),
      }}
      transition={{
        boxShadow: { repeat: Infinity, duration: 1 },
      }}
      exit={{ opacity: 0, scale: 0.9, x: 100 }}
      layout
      style={{
        background: alert.acknowledged ? 'rgba(21, 27, 35, 0.5)' : config.bgColor,
        border: `1px solid ${alert.acknowledged ? 'rgba(110, 118, 129, 0.2)' : config.borderColor}`,
        borderRadius: 6,
        padding: 10,
        marginBottom: 6,
        opacity: alert.acknowledged ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Critical pulse indicator */}
      {alert.severity === 'CRITICAL' && !alert.acknowledged && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: config.color,
          }}
        />
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: 2,
        }}>
          <Icon
            size={16}
            style={{
              color: alert.acknowledged ? '#6e7681' : config.color,
            }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}>
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 3,
              background: alert.acknowledged ? 'rgba(110, 118, 129, 0.2)' : config.bgColor,
              color: alert.acknowledged ? '#6e7681' : config.color,
              border: `1px solid ${alert.acknowledged ? 'rgba(110, 118, 129, 0.3)' : config.borderColor}`,
            }}>
              {config.label}
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#6e7681',
            }}>
              {formatTimestamp(alert.timestamp)}
            </span>
            {alert.acknowledged && (
              <Check size={12} style={{ color: '#00ff88', marginLeft: 'auto' }} />
            )}
          </div>

          {/* Message */}
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 12,
            color: alert.acknowledged ? '#8b949e' : '#e6edf3',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {alert.message}
          </p>

          {/* Flight tags */}
          {alert.involvedFlightIds.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 6,
            }}>
              {alert.involvedFlightIds.map((flightId) => (
                <button
                  key={flightId}
                  onClick={() => onSelectFlight?.(flightId)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    color: '#00ff88',
                    cursor: 'pointer',
                  }}
                >
                  {flightId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Acknowledge button */}
        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: `1px solid ${config.borderColor}`,
              borderRadius: 4,
              padding: '4px 8px',
              color: config.color,
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={12} />
            ACK
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function AlertPanel({
  alerts,
  onAcknowledge,
  onSelectFlight,
}: AlertPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const previousAlertIdsRef = useRef<Set<string>>(new Set());

  // Check if demo mode is active - don't use VoiceNotification during demo (CloudTTS handles it)
  const { state: demoState } = useDemoMode();

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  const displayedAlerts = showAcknowledged ? alerts : unacknowledgedAlerts;

  // Play sound and voice when new alerts are added
  useEffect(() => {
    if (isMuted) return;

    const currentAlertIds = new Set(alerts.map(a => a.alertId));
    const newAlerts = alerts.filter(a => !previousAlertIdsRef.current.has(a.alertId));

    if (newAlerts.length > 0 && previousAlertIdsRef.current.size > 0) {
      // Find the highest severity alert to announce
      const criticalAlert = newAlerts.find(a => a.severity === 'CRITICAL');
      const warningAlert = newAlerts.find(a => a.severity === 'WARNING');
      const alertToAnnounce = criticalAlert || warningAlert || newAlerts[0];

      // Play audio sound
      if (criticalAlert) {
        AudioManager.play('critical');
      } else if (warningAlert) {
        AudioManager.play('warning');
      } else {
        AudioManager.play('alert');
      }

      // Speak the alert with voice notification (only if NOT in demo mode - CloudTTS handles demo)
      const isDemoActive = demoState.isActive && demoState.mode === 'playing';
      if (alertToAnnounce && !isDemoActive) {
        VoiceNotification.speakAlert(alertToAnnounce.severity, alertToAnnounce.message);
      }
    }

    previousAlertIdsRef.current = currentAlertIds;
  }, [alerts, isMuted, demoState.isActive, demoState.mode]);

  // Sync mute state with AudioManager and VoiceNotification
  useEffect(() => {
    AudioManager.setMuted(isMuted);
    VoiceNotification.setEnabled(!isMuted);
  }, [isMuted]);

  return (
    <div className="alert-panel panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="panel-header" style={{
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Critical flash overlay */}
        {criticalCount > 0 && (
          <motion.div
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(255, 51, 102, 0.2), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}

        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <Bell size={14} />
          ALERTS
          {unacknowledgedAlerts.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 10,
                background: criticalCount > 0 ? '#ff3366' : '#ffaa00',
                color: criticalCount > 0 ? '#fff' : '#000',
                fontWeight: 600,
              }}
            >
              {unacknowledgedAlerts.length}
            </motion.span>
          )}
        </span>

        <button
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          style={{
            background: 'transparent',
            border: 'none',
            color: showAcknowledged ? '#00ff88' : '#6e7681',
            cursor: 'pointer',
            padding: 4,
            fontSize: 9,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {showAcknowledged ? 'ALL' : 'ACTIVE'}
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            background: 'transparent',
            border: 'none',
            color: isMuted ? '#ff3366' : '#8b949e',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Alert list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: 8,
            }}
          >
            <AnimatePresence mode="popLayout">
              {displayedAlerts.map((alert) => (
                <AlertItem
                  key={alert.alertId}
                  alert={alert}
                  onAcknowledge={() => onAcknowledge(alert.alertId)}
                  onSelectFlight={onSelectFlight}
                />
              ))}
            </AnimatePresence>

            {displayedAlerts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 20,
                color: '#6e7681',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 12,
              }}>
                No active alerts
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
