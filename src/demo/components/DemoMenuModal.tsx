import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  AlertTriangle,
  Cloud,
  Shield,
  Navigation,
  ArrowRightLeft,
  Siren,
  Clock,
  Zap,
  BookOpen,
  Flame,
  Plane,
  Radio,
} from 'lucide-react';
import { useDemoMode } from '../DemoProvider';
import { useUIStore } from '../../store';
import type { Scenario } from '../scenarios/types';

const iconMap: Record<string, typeof AlertTriangle> = {
  'alert-triangle': AlertTriangle,
  'cloud': Cloud,
  'shield': Shield,
  'navigation': Navigation,
  'arrow-right-left': ArrowRightLeft,
  'siren': Siren,
  'zap': Zap,
  'book-open': BookOpen,
  'flame': Flame,
};

// Showcase is the primary demo - shown as featured
const featuredIds = ['showcase-demo'];

export function DemoMenuModal() {
  const { state, scenarios, closeDemo, startScenario, startTour } = useDemoMode();
  const { setLiveOnly } = useUIStore();

  if (!state.isActive || state.mode !== 'menu') {
    return null;
  }

  // Handle entering live mode (no demo)
  const handleLiveMode = () => {
    setLiveOnly(true);
    closeDemo();
  };

  // Filter out featured modes to show separately
  const scenarioLibrary = scenarios.filter(s => !featuredIds.includes(s.id));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={closeDemo}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 900,
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(13, 17, 23, 0.98)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 16,
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.1)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1), transparent)',
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 22,
                fontWeight: 700,
                color: '#00ff88',
                margin: 0,
                letterSpacing: 2,
              }}>
                ATCS-NG DEMO CENTER
              </h2>
              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 13,
                color: '#8b949e',
                margin: '4px 0 0',
              }}>
                Experience ATCS-NG capabilities through guided demonstrations
              </p>
            </div>
            <button
              onClick={closeDemo}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                background: 'transparent',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                borderRadius: 8,
                color: '#ff3366',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Selection */}
          <div style={{
            display: 'flex',
            gap: 16,
            padding: '20px 24px 0',
          }}>
            {/* Live Mode Option */}
            <motion.button
              whileHover={{ scale: 1.02, borderColor: 'rgba(0, 212, 255, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLiveMode}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 20,
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 136, 255, 0.15))',
                border: '2px solid rgba(0, 212, 255, 0.4)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                background: 'rgba(0, 212, 255, 0.2)',
                borderRadius: 12,
                flexShrink: 0,
              }}>
                <Radio size={28} style={{ color: '#00d4ff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#00d4ff',
                  letterSpacing: 1,
                }}>
                  LIVE MODE
                </div>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 13,
                  color: '#8b949e',
                  marginTop: 4,
                }}>
                  Real-time data from live sensors
                </div>
              </div>
              <Play size={24} style={{ color: '#00d4ff' }} />
            </motion.button>
          </div>

          {/* Divider - Demo Mode */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '20px 24px 12px',
          }}>
            <div style={{
              flex: 1,
              height: 1,
              background: 'rgba(0, 255, 136, 0.15)',
            }} />
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
              Demo Mode
            </span>
            <div style={{
              flex: 1,
              height: 1,
              background: 'rgba(0, 255, 136, 0.15)',
            }} />
          </div>

          {/* Featured Demo - Crisis Showcase */}
          <div style={{ padding: '0 24px' }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255, 51, 102, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startScenario('showcase-demo')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: 24,
                background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.2), rgba(255, 170, 0, 0.15))',
                border: '2px solid rgba(255, 51, 102, 0.5)',
                borderRadius: 16,
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated plane icon */}
              <motion.div
                animate={{ x: [0, 5, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.3), rgba(255, 170, 0, 0.3))',
                  borderRadius: 16,
                  flexShrink: 0,
                }}
              >
                <Plane size={40} style={{ color: '#ff3366' }} />
              </motion.div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#ff3366',
                    margin: 0,
                    letterSpacing: 2,
                  }}>
                    CRISIS SHOWCASE
                  </h3>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(255, 51, 102, 0.3)',
                      borderRadius: 4,
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 10,
                      color: '#ff3366',
                      fontWeight: 600,
                      letterSpacing: 1,
                    }}
                  >
                    RECOMMENDED
                  </motion.span>
                </div>
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 15,
                  color: '#c9d1d9',
                  margin: '8px 0 0',
                  lineHeight: 1.5,
                }}>
                  Experience dramatic aviation crises: Air India hijacking, Qantas hero rescue, stealth incursion, near mid-air collision, and severe weather. Multi-accent voices with radio effects.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} style={{ color: '#ffaa00' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#ffaa00', fontWeight: 600 }}>
                      ~5 min
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flame size={14} style={{ color: '#ff3366' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#ff3366', fontWeight: 600 }}>
                      Hero Mode Interactive
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                background: 'rgba(255, 51, 102, 0.3)',
                borderRadius: 28,
                flexShrink: 0,
              }}>
                <Play size={28} style={{ color: '#ff3366', marginLeft: 4 }} />
              </div>
            </motion.button>
          </div>

          {/* Divider - Scenario Library */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '24px 24px 12px',
          }}>
            <div style={{
              flex: 1,
              height: 1,
              background: 'rgba(0, 255, 136, 0.15)',
            }} />
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
              Scenario Library
            </span>
            <div style={{
              flex: 1,
              height: 1,
              background: 'rgba(0, 255, 136, 0.15)',
            }} />
          </div>

          {/* Scenario Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: '0 24px 16px',
          }}>
            {scenarioLibrary.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onClick={() => startScenario(scenario.id)}
              />
            ))}
          </div>

          {/* Divider - Full Tour */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 24px 12px',
          }}>
            <div style={{
              flex: 1,
              height: 1,
              background: 'rgba(0, 255, 136, 0.15)',
            }} />
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
              Complete Experience
            </span>
            <div style={{
              flex: 1,
              height: 1,
              background: 'rgba(0, 255, 136, 0.15)',
            }} />
          </div>

          {/* Full Tour Button */}
          <div style={{ padding: '0 24px 24px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startTour}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 212, 255, 0.15))',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              <Play size={22} style={{ color: '#00ff88' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#00ff88',
                  letterSpacing: 1,
                }}>
                  FULL TOUR
                </div>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 11,
                  color: '#8b949e',
                  marginTop: 2,
                }}>
                  All 6 scenarios in sequence
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#6e7681',
              }}>
                <Clock size={14} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}>
                  ~10 min
                </span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ScenarioCard({
  scenario,
  onClick,
}: {
  scenario: Scenario;
  onClick: () => void;
}) {
  const Icon = iconMap[scenario.icon] || AlertTriangle;

  return (
    <motion.button
      whileHover={{ scale: 1.02, borderColor: 'rgba(0, 255, 136, 0.5)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        background: 'rgba(21, 27, 35, 0.8)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        background: 'rgba(0, 255, 136, 0.1)',
        borderRadius: 8,
        flexShrink: 0,
      }}>
        <Icon size={18} style={{ color: '#00ff88' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#e6edf3',
          margin: 0,
          marginBottom: 3,
        }}>
          {scenario.title}
        </h4>
        <p style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 11,
          color: '#6e7681',
          margin: 0,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {scenario.description}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 6,
          color: '#6e7681',
        }}>
          <Clock size={10} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
          }}>
            ~{scenario.duration} min
          </span>
        </div>
      </div>
    </motion.button>
  );
}
