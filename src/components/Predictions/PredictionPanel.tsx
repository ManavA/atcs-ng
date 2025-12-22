import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Zap, Clock, TrendingUp } from 'lucide-react';
import type { Prediction } from '../../types';

interface PredictionPanelProps {
  predictions: Prediction[];
  onSelectFlight?: (flightId: string) => void;
}

function getProbabilityColor(probability: number): string {
  if (probability >= 0.8) return '#ff3366';
  if (probability >= 0.6) return '#ffaa00';
  if (probability >= 0.4) return '#00d4ff';
  return '#00ff88';
}

function formatTimeToEvent(predictedTime: string): string {
  const diff = new Date(predictedTime).getTime() - Date.now();
  if (diff < 0) return 'NOW';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
  return `${secs}s`;
}

function PredictionItem({
  prediction,
  onSelectFlight,
}: {
  prediction: Prediction;
  onSelectFlight?: (flightId: string) => void;
}) {
  const probabilityColor = getProbabilityColor(prediction.probability);
  const probabilityPercent = Math.round(prediction.probability * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        background: 'rgba(21, 27, 35, 0.8)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: 6,
        padding: 10,
        marginBottom: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Probability bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: probabilityColor,
      }} />

      <div style={{ display: 'flex', gap: 10 }}>
        {/* Probability gauge */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 50,
        }}>
          <div style={{
            position: 'relative',
            width: 44,
            height: 44,
          }}>
            {/* Background ring */}
            <svg width="44" height="44" style={{ position: 'absolute' }}>
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="rgba(0, 255, 136, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={probabilityColor}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 18 * prediction.probability} ${2 * Math.PI * 18}`}
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
                style={{
                  filter: `drop-shadow(0 0 4px ${probabilityColor})`,
                }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              color: probabilityColor,
            }}>
              {probabilityPercent}%
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}>
            <Zap size={12} style={{ color: probabilityColor }} />
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 10,
              fontWeight: 600,
              color: probabilityColor,
              textTransform: 'uppercase',
            }}>
              {prediction.predictionType}
            </span>
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Clock size={10} style={{ color: '#6e7681' }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: prediction.probability >= 0.8 ? '#ff3366' : '#8b949e',
                fontWeight: prediction.probability >= 0.8 ? 600 : 400,
              }}>
                T-{formatTimeToEvent(prediction.predictedTime)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 11,
            color: '#e6edf3',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {prediction.description}
          </p>

          {/* Involved flights */}
          {prediction.involvedFlights.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 6,
            }}>
              {prediction.involvedFlights.map((flightId) => (
                <button
                  key={flightId}
                  onClick={() => onSelectFlight?.(flightId)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                    cursor: 'pointer',
                  }}
                >
                  {flightId}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PredictionPanel({
  predictions,
  onSelectFlight,
}: PredictionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Sort by probability (highest first)
  const sortedPredictions = [...predictions].sort(
    (a, b) => b.probability - a.probability
  );

  const highRiskCount = predictions.filter(p => p.probability >= 0.7).length;

  return (
    <div className="prediction-panel panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="panel-header" style={{ flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <Brain size={14} />
          AI PREDICTIONS
          {highRiskCount > 0 && (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 10,
                background: '#ffaa00',
                color: '#000',
                fontWeight: 600,
              }}
            >
              {highRiskCount}
            </motion.span>
          )}
        </span>
        <TrendingUp size={14} style={{ color: '#8b949e' }} />
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

      {/* Content */}
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
              {sortedPredictions.map((prediction) => (
                <PredictionItem
                  key={prediction.id}
                  prediction={prediction}
                  onSelectFlight={onSelectFlight}
                />
              ))}
            </AnimatePresence>

            {predictions.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 20,
                color: '#6e7681',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 12,
              }}>
                No active predictions
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
