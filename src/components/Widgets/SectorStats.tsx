import { motion } from 'framer-motion';
import {
  Plane,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Gauge,
} from 'lucide-react';
import type { Track } from '../../types';

interface SectorStatsProps {
  tracks: Track[];
}

export function SectorStats({ tracks }: SectorStatsProps) {
  // Calculate stats
  const totalAircraft = tracks.length;
  const climbingCount = tracks.filter(t => t.verticalRateFpm > 500).length;
  const descendingCount = tracks.filter(t => t.verticalRateFpm < -500).length;
  const levelCount = tracks.filter(t => Math.abs(t.verticalRateFpm) <= 500).length;

  const avgAltitude = tracks.length > 0
    ? Math.round(tracks.reduce((sum, t) => sum + t.altitudeFt, 0) / tracks.length)
    : 0;

  const avgSpeed = tracks.length > 0
    ? Math.round(tracks.reduce((sum, t) => sum + t.speedKt, 0) / tracks.length)
    : 0;

  // Sector capacity (mock value for demo)
  const sectorCapacity = 15;
  const capacityUsage = Math.round((totalAircraft / sectorCapacity) * 100);

  return (
    <div className="panel" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Header */}
      <div className="panel-header" style={{ flexShrink: 0 }}>
        <Gauge size={14} />
        <span>SECTOR STATS</span>
      </div>

      {/* Content */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Capacity bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              color: '#8b949e',
            }}>
              Sector Capacity
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: capacityUsage > 80 ? '#ff3366' : capacityUsage > 60 ? '#ffaa00' : '#00ff88',
            }}>
              {capacityUsage}%
            </span>
          </div>
          <div style={{
            height: 4,
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityUsage}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background: capacityUsage > 80 ? '#ff3366' : capacityUsage > 60 ? '#ffaa00' : '#00ff88',
                borderRadius: 2,
              }}
            />
          </div>
        </div>

        {/* Aircraft breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
          <StatBox
            icon={ArrowUp}
            value={climbingCount}
            label="CLIMB"
            color="#00d4ff"
          />
          <StatBox
            icon={ArrowRight}
            value={levelCount}
            label="LEVEL"
            color="#00ff88"
          />
          <StatBox
            icon={ArrowDown}
            value={descendingCount}
            label="DESC"
            color="#ffaa00"
          />
        </div>

        {/* Averages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <div style={{
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.1)',
            borderRadius: 6,
            padding: 10,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16,
              fontWeight: 600,
              color: '#00d4ff',
            }}>
              FL{Math.round(avgAltitude / 100)}
            </div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9,
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Avg Alt
            </div>
          </div>
          <div style={{
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.1)',
            borderRadius: 6,
            padding: 10,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16,
              fontWeight: 600,
              color: '#00d4ff',
            }}>
              {avgSpeed}
            </div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9,
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Avg GS (kt)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Plane;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div style={{
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: 6,
      padding: 8,
      textAlign: 'center',
    }}>
      <Icon size={14} style={{ color, marginBottom: 4 }} />
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 16,
        fontWeight: 600,
        color,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 9,
        color: '#6e7681',
        letterSpacing: 0.5,
      }}>
        {label}
      </div>
    </div>
  );
}
