import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoMode } from '../DemoProvider';

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Map component IDs to DOM selectors
const componentSelectors: Record<string, string> = {
  radar: '[data-demo-id="radar"]',
  alerts: '[data-demo-id="alerts"]',
  predictions: '[data-demo-id="predictions"]',
  strips: '[data-demo-id="strips"]',
  header: '[data-demo-id="header"]',
};

export function SpotlightOverlay() {
  const { state, currentStep } = useDemoMode();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!state.isActive || state.mode === 'menu' || !currentStep?.spotlight) {
      setSpotlightRect(null);
      return;
    }

    const spotlight = currentStep.spotlight;
    let selector: string | null = null;

    switch (spotlight.type) {
      case 'component':
        selector = componentSelectors[spotlight.id];
        break;
      case 'track':
        selector = `[data-track-id="${spotlight.trackId}"]`;
        break;
      case 'alert':
        selector = `[data-alert-id="${spotlight.alertId}"]`;
        break;
      case 'prediction':
        selector = `[data-prediction-id="${spotlight.predictionId}"]`;
        break;
      case 'flight':
        selector = `[data-callsign="${spotlight.callsign}"]`;
        break;
    }

    if (!selector) {
      setSpotlightRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(selector!);
      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;
        setSpotlightRect({
          x: rect.x - padding,
          y: rect.y - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setSpotlightRect(null);
      }
    };

    // Initial update
    updateRect();

    // Watch for size/position changes
    const element = document.querySelector(selector);
    if (element) {
      observerRef.current = new ResizeObserver(updateRect);
      observerRef.current.observe(element);
    }

    // Also update on scroll/resize
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [state.isActive, state.mode, currentStep]);

  if (!state.isActive || state.mode === 'menu' || !spotlightRect) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          pointerEvents: 'none',
        }}
      >
        {/* Dark overlay with cutout */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="spotlight-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#00ff88" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Mask for the cutout */}
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <motion.rect
                initial={{
                  x: spotlightRect.x,
                  y: spotlightRect.y,
                  width: spotlightRect.width,
                  height: spotlightRect.height,
                }}
                animate={{
                  x: spotlightRect.x,
                  y: spotlightRect.y,
                  width: spotlightRect.width,
                  height: spotlightRect.height,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>

          {/* Dark overlay */}
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />

          {/* Glowing border around spotlight */}
          <motion.rect
            initial={{
              x: spotlightRect.x,
              y: spotlightRect.y,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            animate={{
              x: spotlightRect.x,
              y: spotlightRect.y,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            rx="8"
            fill="none"
            stroke="#00ff88"
            strokeWidth="2"
            filter="url(#spotlight-glow)"
          />
        </svg>

        {/* Pulse animation on the border */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(0, 255, 136, 0.4)',
              '0 0 0 8px rgba(0, 255, 136, 0)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            left: spotlightRect.x,
            top: spotlightRect.y,
            width: spotlightRect.width,
            height: spotlightRect.height,
            borderRadius: 8,
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
