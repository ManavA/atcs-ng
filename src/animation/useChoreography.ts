import { useCallback, useRef, useState } from 'react';
import { useAnimationFrame } from './useAnimationFrame';

interface ChoreographyStep {
  id: string;
  startTime: number;
  duration: number;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

interface Choreography {
  id: string;
  steps: ChoreographyStep[];
  loop?: boolean;
}

export function useChoreography() {
  const [activeChoreographies, setActive] = useState<Map<string, Choreography>>(new Map());
  const startTimes = useRef<Map<string, number>>(new Map());
  const completedSteps = useRef<Set<string>>(new Set());

  const startChoreography = useCallback((choreography: Choreography) => {
    setActive((prev) => new Map(prev).set(choreography.id, choreography));
    startTimes.current.set(choreography.id, performance.now() / 1000);
    completedSteps.current = new Set();
  }, []);

  const stopChoreography = useCallback((id: string) => {
    setActive((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    startTimes.current.delete(id);
  }, []);

  useAnimationFrame(({ time }) => {
    activeChoreographies.forEach((choreo, id) => {
      const startTime = startTimes.current.get(id) || time;
      const elapsed = time - startTime;

      choreo.steps.forEach((step) => {
        const stepKey = `${id}-${step.id}`;
        const stepStart = step.startTime;
        const stepEnd = stepStart + step.duration;

        if (elapsed >= stepStart && elapsed < stepEnd) {
          // Step is active
          if (!completedSteps.current.has(`${stepKey}-started`)) {
            step.onStart?.();
            completedSteps.current.add(`${stepKey}-started`);
          }

          const progress = (elapsed - stepStart) / step.duration;
          step.onUpdate?.(Math.min(1, progress));
        } else if (elapsed >= stepEnd && !completedSteps.current.has(`${stepKey}-completed`)) {
          // Step just completed
          step.onComplete?.();
          completedSteps.current.add(`${stepKey}-completed`);
        }
      });

      // Check if choreography is complete
      const lastStep = choreo.steps[choreo.steps.length - 1];
      const totalDuration = lastStep.startTime + lastStep.duration;

      if (elapsed >= totalDuration) {
        if (choreo.loop) {
          startTimes.current.set(id, time);
          completedSteps.current = new Set();
        } else {
          stopChoreography(id);
        }
      }
    });
  });

  return { startChoreography, stopChoreography, activeChoreographies };
}
