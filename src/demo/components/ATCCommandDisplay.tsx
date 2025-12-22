import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Mic } from 'lucide-react';
import { CloudTTS } from '../../audio';

interface ATCCommandDisplayProps {
  command: string | null;
  onComplete?: () => void;
}

export function ATCCommandDisplay({ command, onComplete }: ATCCommandDisplayProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastCommandRef = useRef<string | null>(null);
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!command || command === lastCommandRef.current) return;

    lastCommandRef.current = command;
    setDisplayedText('');
    setIsTyping(true);
    setIsSpeaking(false);

    // Clear any existing typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // Type out the command character by character
    let charIndex = 0;
    const typingSpeed = 40; // ms per character

    typingIntervalRef.current = window.setInterval(() => {
      if (charIndex < command.length) {
        setDisplayedText(command.substring(0, charIndex + 1));
        charIndex++;
      } else {
        // Typing complete - start speaking
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        setIsSpeaking(true);

        // Speak the command with ATC voice
        CloudTTS.speakATC(command, () => {
          setIsSpeaking(false);
          onComplete?.();
        });
      }
    }, typingSpeed);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [command, onComplete]);

  if (!command) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(0, 100, 50, 0.95), rgba(0, 60, 30, 0.98))',
          border: '2px solid rgba(0, 255, 136, 0.6)',
          borderRadius: 16,
          padding: '16px 24px',
          minWidth: 400,
          maxWidth: 700,
          zIndex: 9600,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Header with "YOU" label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
        }}>
          <motion.div
            animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              background: 'rgba(0, 255, 136, 0.2)',
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 136, 0.5)',
            }}
          >
            {isSpeaking ? (
              <Mic size={16} style={{ color: '#00ff88' }} />
            ) : (
              <Radio size={16} style={{ color: '#00ff88' }} />
            )}
          </motion.div>

          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 14,
            fontWeight: 700,
            color: '#00ff88',
            letterSpacing: 3,
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          }}>
            YOU (ATC)
          </div>

          {/* Status indicator */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {isTyping && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#ffaa00',
                  textTransform: 'uppercase',
                }}
              >
                TYPING...
              </motion.div>
            )}
            {isSpeaking && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#00d4ff',
                  textTransform: 'uppercase',
                }}
              >
                TRANSMITTING
              </motion.div>
            )}
          </div>
        </div>

        {/* Command text with typing cursor */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 18,
          fontWeight: 500,
          color: '#ffffff',
          lineHeight: 1.5,
          letterSpacing: 0.5,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>
          {displayedText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ color: '#00ff88' }}
            >
              ▌
            </motion.span>
          )}
        </div>

        {/* Radio static visual effect when speaking */}
        {isSpeaking && (
          <motion.div
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
              pointerEvents: 'none',
              borderRadius: 16,
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
