import { motion } from 'framer-motion';
import type { AIRecommendation } from '../../types';
import { HoloPanel } from '../Holographic';

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSimulate: (id: string) => void;
}

export function AIRecommendationCard({
  recommendation,
  onApprove,
  onReject,
  onSimulate,
}: AIRecommendationCardProps) {
  const confidenceColor = recommendation.confidence >= 0.9
    ? '#00ff88'
    : recommendation.confidence >= 0.7
    ? '#ffaa00'
    : '#ff6600';

  return (
    <HoloPanel
      title={recommendation.type === 'conflict_resolution' ? 'CONFLICT PREDICTED' : 'AI RECOMMENDATION'}
      priority={recommendation.type === 'conflict_resolution' ? 'warning' : 'normal'}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
        <div style={{ marginBottom: 12, color: '#e6edf3' }}>
          {recommendation.description}
        </div>

        <div style={{
          padding: '8px 12px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: 4,
          marginBottom: 12,
        }}>
          <div style={{ color: '#00ff88', fontWeight: 600 }}>
            RECOMMENDATION: {recommendation.action}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11 }}>
          <div>
            <span style={{ color: '#8b949e' }}>Confidence:</span>{' '}
            <span style={{ color: confidenceColor }}>{Math.round(recommendation.confidence * 100)}%</span>
          </div>
          <div>
            <span style={{ color: '#8b949e' }}>Fuel:</span>{' '}
            <span style={{ color: '#e6edf3' }}>+{recommendation.impacts.fuelLbs} lbs</span>
          </div>
          <div>
            <span style={{ color: '#8b949e' }}>Time:</span>{' '}
            <span style={{ color: '#e6edf3' }}>+{recommendation.impacts.timeMinutes} min</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onApprove(recommendation.id)}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#00ff88',
              color: '#0a0e14',
              border: 'none',
              borderRadius: 4,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            APPROVE
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSimulate(recommendation.id)}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: 'transparent',
              color: '#00d4ff',
              border: '1px solid #00d4ff',
              borderRadius: 4,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            SIMULATE
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReject(recommendation.id)}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: 'transparent',
              color: '#ff3366',
              border: '1px solid #ff3366',
              borderRadius: 4,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            REJECT
          </motion.button>
        </div>
      </div>
    </HoloPanel>
  );
}
