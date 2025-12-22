import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plane,
  AlertTriangle,
  Radio,
  Target,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { CloudTTS, HeroModeTheme } from '../../audio';
import { useUIStore } from '../../store';

interface HeroModePanelProps {
  hijackedFlightId: string;
  onComplete: (success: boolean) => void;
}

type HeroPhase = 'intro' | 'contact' | 'vectors' | 'approach' | 'landing' | 'success' | 'failure';

interface HeroCommand {
  id: string;
  label: string;
  command: string;
  correct: boolean;
  phase: HeroPhase;
}

export function HeroModePanel({
  hijackedFlightId: _hijackedFlightId,
  onComplete,
}: HeroModePanelProps) {
  const [phase, setPhase] = useState<HeroPhase>('intro');
  const [altitude, setAltitude] = useState(35000);
  const [distance, setDistance] = useState(180); // nm to JFK
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [fuelRemaining, setFuelRemaining] = useState(45); // minutes of fuel
  const [sarahMessage, setSarahMessage] = useState<string | null>(null);
  const { heroModeActive, setHeroModeActive, addCommandLog } = useUIStore();

  // Start theme on mount
  useEffect(() => {
    if (heroModeActive) {
      HeroModeTheme.play();
    }
    return () => {
      HeroModeTheme.stop();
    };
  }, [heroModeActive]);

  // Intro sequence
  useEffect(() => {
    if (phase === 'intro') {
      // Sarah's distress call - Australian accent with radio effect
      setTimeout(() => {
        setSarahMessage("Mayday mayday! This is Qantas 8. We've... we've regained control. I fought him off! I'm Sarah, a passenger. The pilots are unconscious. I have 489 people on this A380. Please, you have to help us!");
        CloudTTS.speakSarah(
          "Mayday mayday! This is Qantas 8. We've regained control. I fought him off! I'm Sarah, a passenger. The pilots are unconscious. I have 489 people on this A380. Please, you have to help us!",
          () => {
            setPhase('contact');
          }
        );
      }, 1000);
    }
  }, [phase]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'intro' && phase !== 'success' && phase !== 'failure') {
      const timer = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 0) {
            setPhase('failure');
            return 0;
          }
          return t - 1;
        });
        setFuelRemaining(f => Math.max(0, f - 0.05));
        setDistance(d => Math.max(0, d - 0.3));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase]);

  // Check for success
  useEffect(() => {
    if (distance <= 5 && altitude <= 3000 && phase === 'landing') {
      setPhase('success');
      CloudTTS.speakSarah(
        "We made it! We're on the ground! Thank you! Oh god, thank you so much!",
        () => onComplete(true)
      );
    }
  }, [distance, altitude, phase, onComplete]);

  // Check for failure
  useEffect(() => {
    if (fuelRemaining <= 0 || timeRemaining <= 0) {
      if (phase !== 'success' && phase !== 'failure') {
        setPhase('failure');
        onComplete(false);
      }
    }
  }, [fuelRemaining, timeRemaining, phase, onComplete]);

  const handleCommand = useCallback((command: HeroCommand) => {
    // Add to log
    addCommandLog({
      callsign: 'QFA8',
      command: `QFA8, ${command.command}`,
      type: 'other',
    });

    // Speak command with ATC voice and radio effect
    CloudTTS.speakATC(`Qantas 8, ${command.command}`);

    // Handle the command
    if (command.correct) {
      switch (command.phase) {
        case 'contact':
          setTimeout(() => {
            setSarahMessage("Copy that! I'm looking at the instruments... there's so many buttons...");
            CloudTTS.speakSarah("Copy that! I'm looking at the instruments... there's so many buttons...", () => {
              setPhase('vectors');
            });
          }, 2000);
          break;

        case 'vectors':
          setTimeout(() => {
            setSarahMessage("Turning now. I found the autopilot heading dial. Is this right?");
            CloudTTS.speakSarah("Turning now. I found the autopilot heading dial. Is this right?", () => {
              setPhase('approach');
            });
          }, 2000);
          break;

        case 'approach':
          setAltitude(a => Math.max(3000, a - 5000));
          setTimeout(() => {
            setSarahMessage("Descending... the runway lights! I can see them! Oh my god, I can see JFK!");
            CloudTTS.speakSarah("Descending... the runway lights! I can see them! I can see JFK!", () => {
              setPhase('landing');
            });
          }, 2000);
          break;

        case 'landing':
          setAltitude(a => Math.max(0, a - 3000));
          setTimeout(() => {
            setPhase('success');
          }, 3000);
          break;
      }
    } else {
      // Wrong command - Sarah gets confused
      setSarahMessage("Wait, what? I don't understand! Please, you have to be more clear!");
      CloudTTS.speakSarah("Wait, what? I don't understand! Please, you have to be more clear!");
    }
  }, [addCommandLog]);

  // Commands for each phase - memoized for stability
  const phaseCommands = useMemo((): HeroCommand[] => {
    switch (phase) {
      case 'contact':
        return [
          { id: 'c1', label: 'Stay Calm', command: 'remain calm, help is on the way', correct: true, phase: 'contact' },
          { id: 'c2', label: 'Squawk 7500', command: 'squawk 7500', correct: false, phase: 'contact' },
          { id: 'c3', label: 'Identify Location', command: 'say position and altitude', correct: false, phase: 'contact' },
        ];

      case 'vectors':
        return [
          { id: 'v1', label: 'Turn to JFK', command: 'turn left heading 250, direct JFK', correct: true, phase: 'vectors' },
          { id: 'v2', label: 'Hold Position', command: 'maintain present heading', correct: false, phase: 'vectors' },
          { id: 'v3', label: 'Turn Away', command: 'turn right heading 090', correct: false, phase: 'vectors' },
        ];

      case 'approach':
        return [
          { id: 'a1', label: 'Begin Descent', command: 'descend to 10,000, expect ILS approach runway 31L', correct: true, phase: 'approach' },
          { id: 'a2', label: 'Maintain Altitude', command: 'maintain flight level 350', correct: false, phase: 'approach' },
          { id: 'a3', label: 'Speed Up', command: 'increase speed to 400 knots', correct: false, phase: 'approach' },
        ];

      case 'landing':
        return [
          { id: 'l1', label: 'Final Approach', command: 'cleared ILS runway 31L, gear down, flaps full', correct: true, phase: 'landing' },
          { id: 'l2', label: 'Go Around', command: 'go around, climb to 3000', correct: false, phase: 'landing' },
          { id: 'l3', label: 'Hold Short', command: 'hold short of runway', correct: false, phase: 'landing' },
        ];

      default:
        return [];
    }
  }, [phase]);

  // Auto-play: Controller E97 automatically issues commands with proper ATC terminology
  useEffect(() => {
    if (!heroModeActive) return;
    if (phase === 'intro' || phase === 'success' || phase === 'failure') return;

    const autoPlayDelay = 4000; // Wait 4 seconds before auto-commanding

    const autoPlayTimer = setTimeout(() => {
      const correctCommand = phaseCommands.find(c => c.correct);

      if (correctCommand) {
        // E97 announces the command with proper radio protocol
        CloudTTS.speakControllerE97(
          `Boston Center, Controller Echo-Niner-Seven. Qantas 8 heavy, ${correctCommand.command}`,
          () => {
            // Then automatically execute the command
            handleCommand(correctCommand);
          }
        );
      }
    }, autoPlayDelay);

    return () => clearTimeout(autoPlayTimer);
  }, [phase, heroModeActive, phaseCommands, handleCommand]);

  if (!heroModeActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          background: 'rgba(13, 17, 23, 0.98)',
          border: '2px solid #ff3366',
          borderRadius: 12,
          overflow: 'hidden',
          zIndex: 10000,
          boxShadow: '0 0 50px rgba(255, 51, 102, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(90deg, rgba(255, 51, 102, 0.3), transparent)',
          borderBottom: '1px solid rgba(255, 51, 102, 0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Shield size={24} style={{ color: '#ff3366' }} />
            </motion.div>
            <div>
              <h2 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: '#ff3366',
                margin: 0,
                letterSpacing: 2,
              }}>
                HERO MODE - RESCUE QFA8
              </h2>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 12,
                color: '#ffaa00',
                marginTop: 2,
              }}>
                312 SOULS ON BOARD | PILOTS INCAPACITATED
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div style={{ display: 'flex', gap: 16 }}>
            <StatusIndicator
              icon={Plane}
              label="ALT"
              value={`${Math.round(altitude / 100)}00 ft`}
              color={altitude > 10000 ? '#ffaa00' : '#00ff88'}
            />
            <StatusIndicator
              icon={Target}
              label="DIST"
              value={`${Math.round(distance)} nm`}
              color={distance < 50 ? '#00ff88' : '#00d4ff'}
            />
            <StatusIndicator
              icon={AlertTriangle}
              label="FUEL"
              value={`${Math.round(fuelRemaining)} min`}
              color={fuelRemaining < 15 ? '#ff3366' : fuelRemaining < 30 ? '#ffaa00' : '#00ff88'}
            />
          </div>
        </div>

        {/* Sarah's message */}
        {sarahMessage && (
          <motion.div
            key={sarahMessage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '16px 20px',
              background: 'rgba(255, 170, 0, 0.1)',
              borderBottom: '1px solid rgba(255, 170, 0, 0.3)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              <Radio size={16} style={{ color: '#ffaa00', marginTop: 2 }} />
              <div>
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 10,
                  color: '#ffaa00',
                  marginBottom: 4,
                }}>
                  SARAH - QANTAS A380
                </div>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 15,
                  color: '#e6edf3',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}>
                  "{sarahMessage}"
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase-specific content */}
        {(phase === 'success' || phase === 'failure') ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            {phase === 'success' ? (
              <>
                <CheckCircle size={64} style={{ color: '#00ff88', marginBottom: 16 }} />
                <h3 style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 24,
                  color: '#00ff88',
                  marginBottom: 8,
                }}>
                  MISSION SUCCESS
                </h3>
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 16,
                  color: '#8b949e',
                }}>
                  You saved 312 lives. United 787 landed safely at JFK.
                </p>
              </>
            ) : (
              <>
                <XCircle size={64} style={{ color: '#ff3366', marginBottom: 16 }} />
                <h3 style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 24,
                  color: '#ff3366',
                  marginBottom: 8,
                }}>
                  MISSION FAILED
                </h3>
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 16,
                  color: '#8b949e',
                }}>
                  The aircraft ran out of fuel or time.
                </p>
              </>
            )}
            <button
              onClick={() => {
                setHeroModeActive(false);
                onComplete(phase === 'success');
              }}
              style={{
                marginTop: 24,
                padding: '12px 32px',
                background: 'rgba(0, 212, 255, 0.2)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                borderRadius: 6,
                color: '#00d4ff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              RETURN TO CONTROL
            </button>
          </div>
        ) : (
          /* Command buttons */
          <div style={{
            padding: '16px 20px',
          }}>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              color: '#6e7681',
              marginBottom: 12,
              letterSpacing: 1,
            }}>
              SELECT COMMAND
            </div>
            <div style={{
              display: 'flex',
              gap: 12,
            }}>
              {phaseCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleCommand(cmd)}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: 'rgba(0, 255, 136, 0.05)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 8,
                    color: '#e6edf3',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                  }}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timer bar */}
        {phase !== 'success' && phase !== 'failure' && phase !== 'intro' && (
          <div style={{
            height: 4,
            background: 'rgba(255, 51, 102, 0.2)',
          }}>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / 300) * 100}%` }}
              style={{
                height: '100%',
                background: timeRemaining < 60 ? '#ff3366' : timeRemaining < 120 ? '#ffaa00' : '#00ff88',
              }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function StatusIndicator({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Plane;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}>
      <Icon size={14} style={{ color }} />
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        color,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 9,
        color: '#6e7681',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );
}
