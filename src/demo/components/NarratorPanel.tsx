import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  MousePointer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useDemoMode } from '../DemoProvider';
import { CloudTTS, VoiceNotification } from '../../audio';
import { useUIStore } from '../../store';

// Helper to detect character type from narrative text
function detectCharacterFromNarrative(text: string): 'narrator' | 'atc' | 'captain_sharma' | 'fa_priya' | 'captain_williams' | 'sarah' | 'hijacker_norway' | 'hijacker_sweden' | 'british_crew' {
  // Check for specific character dialogue markers
  if (/Captain Sharma:|Air India 302.*Captain/i.test(text)) return 'captain_sharma';
  if (/Flight Attendant Priya:|Priya:/i.test(text)) return 'fa_priya';
  if (/Captain Williams:|Qantas.*Captain/i.test(text)) return 'captain_williams';
  if (/Sarah:/i.test(text)) return 'sarah';
  if (/hijacker.*Norwegian|Norwegian.*hijacker|Jeg krever|Wakanda/i.test(text)) return 'hijacker_norway';
  if (/hijacker.*Swedish|Swedish.*hijacker|Nej\.\.\.|Vakanda för/i.test(text)) return 'hijacker_sweden';
  if (/British Airways.*crew|BAW.*crew/i.test(text)) return 'british_crew';
  if (/Boston Center|Tower|Approach|Departure|ATC:/i.test(text)) return 'atc';
  return 'narrator';
}

export function NarratorPanel() {
  const {
    state,
    currentStep,
    totalSteps,
    progress,
    closeDemo,
    nextStep,
    prevStep,
    pause,
    resume,
    togglePresenterMode,
  } = useDemoMode();

  const lastSpokenStepRef = useRef<string | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const ttsSucceededRef = useRef(false);
  const { addCommandLog, narrationEnabled } = useUIStore();
  const [usingBrowserAudio, setUsingBrowserAudio] = useState(false);

  // Toggle browser fallback mode
  const toggleBrowserFallback = () => {
    const newValue = !usingBrowserAudio;
    setUsingBrowserAudio(newValue);
    CloudTTS.setBrowserFallback(newValue);
    // Also disable VoiceNotification to prevent any dual audio
    VoiceNotification.setEnabled(false);
  };

  // Speak the narrative when step changes, auto-advance when done
  useEffect(() => {
    if (state.mode === 'playing' && currentStep?.narrative && currentStep.id !== lastSpokenStepRef.current) {
      lastSpokenStepRef.current = currentStep.id;
      ttsSucceededRef.current = false;

      // Clear any pending timers
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      // Get the step's autoAdvance time (default 8s for drama)
      const stepDuration = currentStep.autoAdvance ?? 8000;

      // Function to advance after all speech is done
      const advanceAfterSpeech = () => {
        ttsSucceededRef.current = true;
        // Clear fallback timer since TTS succeeded
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        // Brief pause after speech ends before advancing
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          if (state.mode === 'playing' && !state.pendingInteraction && !state.presenterMode) {
            nextStep();
          }
        }, 1000); // 1 second pause after speech
      };

      // Set up fallback timer in case TTS fails or takes too long
      // This ensures the demo keeps moving even without audio
      fallbackTimerRef.current = window.setTimeout(() => {
        if (!ttsSucceededRef.current && state.mode === 'playing' && !state.pendingInteraction && !state.presenterMode) {
          console.log('[Demo] TTS fallback timer fired for step:', currentStep.id);
          nextStep();
        }
      }, stepDuration);

      // Detect the character speaking from the narrative text
      const character = detectCharacterFromNarrative(currentStep.narrative);

      // Only attempt TTS if narration is enabled
      if (narrationEnabled) {
        // Slight delay to let audio effects play first
        setTimeout(() => {
          // Use CloudTTS with appropriate character voice
          CloudTTS.speak(currentStep.narrative, character, () => {
            // If there's an ATC command, speak it and log it
            if (currentStep.atcCommand) {
              // Parse command for logging
              const callsignMatch = currentStep.atcCommand.match(/^([A-Za-z\s]+\d+)/);
              const callsign = callsignMatch ? callsignMatch[1].toUpperCase() : 'ALL';

              // Determine command type
              let type: 'heading' | 'altitude' | 'speed' | 'squawk' | 'frequency' | 'hold' | 'other' = 'other';
              if (/heading|turn/i.test(currentStep.atcCommand)) type = 'heading';
              else if (/climb|descend|flight level|altitude/i.test(currentStep.atcCommand)) type = 'altitude';
              else if (/speed|reduce|increase/i.test(currentStep.atcCommand)) type = 'speed';
              else if (/squawk/i.test(currentStep.atcCommand)) type = 'squawk';
              else if (/contact|frequency/i.test(currentStep.atcCommand)) type = 'frequency';
              else if (/hold/i.test(currentStep.atcCommand)) type = 'hold';

              // Add to command log
              addCommandLog({
                callsign: callsign.replace(/\s+/g, ''),
                command: currentStep.atcCommand,
                type,
              });

              // Use CloudTTS for ATC voice with radio effect
              CloudTTS.speakATC(currentStep.atcCommand, advanceAfterSpeech);
            } else {
              advanceAfterSpeech();
            }
          });
        }, 300);
      }
      // If narration disabled, fallback timer will handle advancement
    }

    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [state.mode, state.presenterMode, currentStep?.id, currentStep?.narrative, currentStep?.atcCommand, currentStep?.autoAdvance, state.pendingInteraction, nextStep, addCommandLog, narrationEnabled]);

  // Cancel speech when demo closes or pauses
  useEffect(() => {
    if (state.mode === 'paused' || !state.isActive) {
      CloudTTS.cancel();
      VoiceNotification.cancel(); // Also cancel fallback
    }
  }, [state.mode, state.isActive]);

  // Disable VoiceNotification entirely during demo to prevent dual audio
  useEffect(() => {
    if (state.isActive && state.mode === 'playing') {
      // Disable VoiceNotification during demo - CloudTTS handles all audio
      VoiceNotification.setEnabled(false);
    }
    return () => {
      // Re-enable VoiceNotification when demo ends
      VoiceNotification.setEnabled(true);
      // Reset browser fallback mode
      CloudTTS.setBrowserFallback(false);
    };
  }, [state.isActive, state.mode]);

  if (!state.isActive || state.mode === 'menu') {
    return null;
  }

  const isPlaying = state.mode === 'playing';
  const isCompleted = state.mode === 'completed';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 340, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 340, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 70,
          right: 8,
          width: 320,
          background: 'rgba(10, 14, 20, 0.98)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: 12,
          overflow: 'hidden',
          zIndex: 9500,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 136, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
              }}
            />
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 2,
              color: '#00ff88',
            }}>
              DEMO MODE
            </span>
          </div>
          <button
            onClick={closeDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              background: 'transparent',
              border: '1px solid rgba(255, 51, 102, 0.3)',
              borderRadius: 4,
              color: '#ff3366',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress */}
        {state.isTourMode && (
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 10,
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6,
            }}>
              Scenario {state.tourScenarioIndex + 1} of {6}
            </div>
          </div>
        )}

        {/* Scenario title */}
        <div style={{ padding: '12px 16px' }}>
          <h3 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 14,
            fontWeight: 600,
            color: '#00d4ff',
            margin: 0,
            marginBottom: 4,
            letterSpacing: 1,
          }}>
            {state.currentScenario?.title || 'Demo Complete'}
          </h3>

          {/* Step progress bar */}
          <div style={{
            height: 3,
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: 2,
            marginTop: 8,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                borderRadius: 2,
              }}
            />
          </div>
        </div>

        {/* Narrative text - larger and more prominent */}
        <div style={{
          padding: '0 16px 16px',
          minHeight: 120,
        }}>
          {isCompleted ? (
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 18,
              color: '#e6edf3',
              lineHeight: 1.5,
              textAlign: 'center',
              padding: '20px 0',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              Demo complete! You've seen all the key features of ATCS-NG.
            </div>
          ) : (
            <motion.p
              key={currentStep?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 17,
                fontWeight: 500,
                color: '#e6edf3',
                lineHeight: 1.7,
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {currentStep?.narrative || ''}
            </motion.p>
          )}
        </div>

        {/* Interaction prompt */}
        <AnimatePresence>
          {state.pendingInteraction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                margin: '0 16px 16px',
                padding: 12,
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: 8,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <MousePointer size={16} style={{ color: '#00d4ff' }} />
                </motion.div>
                <span style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#00d4ff',
                }}>
                  {state.pendingInteraction.hint}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(0, 255, 136, 0.2)',
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          {/* Playback controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 12,
          }}>
            <ControlButton
              icon={SkipBack}
              label="PREV"
              onClick={prevStep}
              disabled={state.currentStepIndex === 0}
              tooltip="Previous step"
            />
            <ControlButton
              icon={isPlaying ? Pause : Play}
              label={isPlaying ? 'PAUSE' : 'PLAY'}
              onClick={isPlaying ? pause : resume}
              primary
              disabled={isCompleted}
              tooltip={isPlaying ? 'Pause' : 'Play'}
            />
            <ControlButton
              icon={SkipForward}
              label="SKIP"
              onClick={nextStep}
              disabled={isCompleted}
              tooltip="Next step"
            />
          </div>

          {/* Step counter and presenter mode toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#6e7681',
            }}>
              Step {state.currentStepIndex + 1} of {totalSteps}
            </span>

            <button
              onClick={togglePresenterMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: state.presenterMode ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                border: `1px solid ${state.presenterMode ? 'rgba(0, 255, 136, 0.4)' : 'rgba(110, 118, 129, 0.3)'}`,
                borderRadius: 4,
                color: state.presenterMode ? '#00ff88' : '#6e7681',
                cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              <Settings size={10} />
              Presenter Mode
            </button>
          </div>

          {/* Audio fallback button */}
          <div style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(110, 118, 129, 0.2)',
          }}>
            <button
              onClick={toggleBrowserFallback}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '6px 10px',
                background: usingBrowserAudio ? 'rgba(255, 170, 0, 0.15)' : 'transparent',
                border: `1px solid ${usingBrowserAudio ? 'rgba(255, 170, 0, 0.4)' : 'rgba(110, 118, 129, 0.2)'}`,
                borderRadius: 4,
                color: usingBrowserAudio ? '#ffaa00' : '#6e7681',
                cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              {usingBrowserAudio ? (
                <>
                  <Volume2 size={12} />
                  Using Browser Audio (Click to use AI Voices)
                </>
              ) : (
                <>
                  <VolumeX size={12} />
                  Audio not working? Click here for fallback
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  primary,
  tooltip,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  tooltip: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: primary ? '8px 16px' : '6px 12px',
        background: primary ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
        border: `1px solid ${primary ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 255, 136, 0.2)'}`,
        borderRadius: 6,
        color: disabled ? '#3d4450' : primary ? '#00ff88' : '#8b949e',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon size={primary ? 18 : 14} />
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 0.5,
      }}>
        {label}
      </span>
    </button>
  );
}
