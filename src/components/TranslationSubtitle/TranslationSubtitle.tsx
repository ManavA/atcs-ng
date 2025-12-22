import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useUIStore } from '../../store';
import { CloudTTS } from '../../audio';

interface TranslationSubtitleProps {
  originalText: string;
  translatedText: string;
  languageCode: 'no-NO' | 'sv-SE';
  languageFlag: string;
  onTranslateAudio?: () => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
  'no-NO': 'Norwegian',
  'sv-SE': 'Swedish',
};

export function TranslationSubtitle({
  originalText,
  translatedText,
  languageCode,
  languageFlag,
  onTranslateAudio,
}: TranslationSubtitleProps) {
  const { autoTranslate, audioVolume } = useUIStore();
  const [isPlayingTranslation, setIsPlayingTranslation] = useState(false);

  const handlePlayTranslation = () => {
    if (isPlayingTranslation) return;

    setIsPlayingTranslation(true);
    CloudTTS.setVolume(audioVolume);
    CloudTTS.speakNarrator(translatedText, () => {
      setIsPlayingTranslation(false);
    });
    onTranslateAudio?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 600,
          width: '90%',
          background: 'rgba(10, 14, 20, 0.95)',
          border: '1px solid rgba(255, 136, 0, 0.4)',
          borderRadius: 12,
          padding: 16,
          zIndex: 9600,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Original language */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          marginBottom: autoTranslate ? 12 : 0,
        }}>
          <span style={{ fontSize: 20 }}>{languageFlag}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 10,
              color: '#ff8800',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}>
              {LANGUAGE_NAMES[languageCode] || languageCode}
            </div>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              fontWeight: 500,
              color: '#e6edf3',
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.5,
            }}>
              "{originalText}"
            </p>
          </div>
        </div>

        {/* Translation (shown when autoTranslate is ON) */}
        {autoTranslate && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid rgba(0, 255, 136, 0.2)',
          }}>
            <span style={{ fontSize: 20 }}>🇬🇧</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 10,
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 4,
              }}>
                English Translation
              </div>
              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: '#00ff88',
                margin: 0,
                lineHeight: 1.5,
              }}>
                "{translatedText}"
              </p>
            </div>
          </div>
        )}

        {/* Translate button (shown when autoTranslate is OFF) */}
        {!autoTranslate && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlayTranslation}
            disabled={isPlayingTranslation}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              marginTop: 12,
              padding: '10px 16px',
              background: isPlayingTranslation
                ? 'rgba(0, 255, 136, 0.3)'
                : 'rgba(0, 255, 136, 0.15)',
              border: '1px solid #00ff88',
              borderRadius: 6,
              color: '#00ff88',
              cursor: isPlayingTranslation ? 'not-allowed' : 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            <Volume2 size={16} />
            {isPlayingTranslation ? 'TRANSLATING...' : 'TRANSLATE'}
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
