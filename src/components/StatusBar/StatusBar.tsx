import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Server,
  Clock,
  Radio,
  Cpu,
  Database,
  Activity,
} from 'lucide-react';

interface StatusBarProps {
  connected: boolean;
  trackCount: number;
  alertCount: number;
  sectorId?: string;
}

function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function formatZuluTime(date: Date): string {
  return date.toISOString().slice(11, 19) + 'Z';
}

function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function StatusBar({
  connected,
  trackCount,
  alertCount,
  sectorId = 'BOS_33',
}: StatusBarProps) {
  const currentTime = useCurrentTime();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '8px 16px',
      background: 'rgba(13, 17, 23, 0.95)',
      borderTop: '1px solid rgba(0, 255, 136, 0.2)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
    }}>
      {/* Connection status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {connected ? (
          <>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wifi size={14} style={{ color: '#00ff88' }} />
            </motion.div>
            <span style={{ color: '#00ff88' }}>CONNECTED</span>
          </>
        ) : (
          <>
            <WifiOff size={14} style={{ color: '#ff3366' }} />
            <span style={{ color: '#ff3366' }}>DISCONNECTED</span>
          </>
        )}
      </div>

      <div style={{ width: 1, height: 16, background: 'rgba(0, 255, 136, 0.2)' }} />

      {/* Sector ID */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: '#00d4ff',
      }}>
        <Radio size={12} />
        <span style={{ fontWeight: 600 }}>{sectorId}</span>
      </div>

      <div style={{ width: 1, height: 16, background: 'rgba(0, 255, 136, 0.2)' }} />

      {/* Track count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: '#8b949e',
      }}>
        <Activity size={12} />
        <span>
          <span style={{ color: '#00ff88', fontWeight: 600 }}>{trackCount}</span> TRK
        </span>
      </div>

      {/* Alert count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: '#8b949e',
      }}>
        <span>
          <span style={{ color: alertCount > 0 ? '#ffaa00' : '#00ff88', fontWeight: 600 }}>
            {alertCount}
          </span> ALT
        </span>
      </div>

      {/* System status indicators */}
      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* CPU usage mock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#6e7681',
        }}>
          <Cpu size={12} />
          <span style={{ color: '#00ff88' }}>12%</span>
        </div>

        {/* Memory mock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#6e7681',
        }}>
          <Database size={12} />
          <span style={{ color: '#00ff88' }}>2.4GB</span>
        </div>

        {/* Server status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <Server size={12} style={{ color: '#00ff88' }} />
          <span style={{ color: '#6e7681' }}>7/7</span>
        </div>
      </div>

      <div style={{ width: 1, height: 16, background: 'rgba(0, 255, 136, 0.2)' }} />

      {/* Time display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Clock size={12} style={{ color: '#6e7681' }} />
          <span style={{ color: '#8b949e' }}>LCL</span>
          <span style={{ color: '#e6edf3', fontWeight: 500 }}>
            {formatLocalTime(currentTime)}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ color: '#00d4ff' }}>UTC</span>
          <span style={{
            color: '#00d4ff',
            fontWeight: 600,
            textShadow: '0 0 8px rgba(0, 212, 255, 0.5)',
          }}>
            {formatZuluTime(currentTime)}
          </span>
        </div>
      </div>

      <div style={{ width: 1, height: 16, background: 'rgba(0, 255, 136, 0.2)' }} />

      {/* Version */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: '#6e7681',
        fontSize: 10,
      }}>
        <span>v2.5.0</span>
      </div>
    </div>
  );
}
