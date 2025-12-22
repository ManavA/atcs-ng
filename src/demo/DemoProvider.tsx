import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { DemoState, Scenario, ScenarioStep, SpotlightTarget } from './scenarios/types';
import { demoReducer, initialDemoState, getCurrentStep, getTotalSteps, getProgress } from './DemoController';
import { allScenarios } from './scenarios';
import { useUIStore } from '../store';

interface DemoContextValue {
  state: DemoState;
  currentStep: ScenarioStep | null;
  totalSteps: number;
  progress: number;
  scenarios: Scenario[];
  // Actions
  openMenu: () => void;
  closeDemo: () => void;
  startScenario: (scenarioId: string) => void;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  pause: () => void;
  resume: () => void;
  togglePresenterMode: () => void;
  completeInteraction: () => void;
  // Helpers
  isSpotlighted: (target: SpotlightTarget) => boolean;
  canInteract: (targetId: string) => boolean;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const timerRef = useRef<number | null>(null);
  const eventTimersRef = useRef<number[]>([]);
  const { setHeroModeActive } = useUIStore();

  const currentStep = getCurrentStep(state);
  const totalSteps = getTotalSteps(state);
  const progress = getProgress(state);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    eventTimersRef.current.forEach(t => clearTimeout(t));
    eventTimersRef.current = [];
  }, []);

  // Process step events (data changes during a step)
  const processStepEvents = useCallback((step: ScenarioStep) => {
    if (!step.events) return;

    step.events.forEach((event) => {
      const timer = window.setTimeout(() => {
        switch (event.type) {
          case 'updateTrack': {
            const payload = event.payload as Partial<{ trackId: string }>;
            dispatch({
              type: 'UPDATE_TRACKS',
              tracks: state.tracks.map(t =>
                t.trackId === payload.trackId ? { ...t, ...payload } : t
              ),
            });
            break;
          }
          case 'addAlert': {
            const alert = event.payload as any;
            dispatch({
              type: 'UPDATE_ALERTS',
              alerts: [alert, ...state.alerts],
            });
            break;
          }
          case 'removeAlert': {
            const { id } = event.payload as { id: string };
            dispatch({
              type: 'UPDATE_ALERTS',
              alerts: state.alerts.filter(a => a.alertId !== id),
            });
            break;
          }
          case 'addPrediction': {
            const prediction = event.payload as any;
            dispatch({
              type: 'UPDATE_PREDICTIONS',
              predictions: [prediction, ...state.predictions],
            });
            break;
          }
          case 'updatePrediction': {
            const payload = event.payload as Partial<{ id: string }>;
            dispatch({
              type: 'UPDATE_PREDICTIONS',
              predictions: state.predictions.map(p =>
                p.id === payload.id ? { ...p, ...payload } : p
              ),
            });
            break;
          }
          case 'removePrediction': {
            const { id } = event.payload as { id: string };
            dispatch({
              type: 'UPDATE_PREDICTIONS',
              predictions: state.predictions.filter(p => p.id !== id),
            });
            break;
          }
          case 'triggerHeroMode': {
            const { active } = event.payload as { active: boolean };
            setHeroModeActive(active);
            break;
          }
        }
      }, event.delay);
      eventTimersRef.current.push(timer);
    });
  }, [state.tracks, state.alerts, state.predictions, setHeroModeActive]);

  // NOTE: Auto-advance is handled by NarratorPanel after TTS completes or times out
  // This prevents race conditions between two advancing systems

  // Process events when step changes
  useEffect(() => {
    if (state.mode === 'playing' && currentStep) {
      clearTimers();
      processStepEvents(currentStep);
    }
  }, [state.mode, state.currentStepIndex, currentStep, clearTimers, processStepEvents]);

  // Show mode selection menu on mount (immediately)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo');
    const noDemo = params.get('nodemo');

    // If nodemo is set, don't show any menu
    if (noDemo) return;

    if (demoParam === 'tour') {
      dispatch({ type: 'START_TOUR' });
    } else if (demoParam) {
      const scenario = allScenarios.find(s => s.id === demoParam);
      if (scenario) {
        dispatch({ type: 'START_SCENARIO', scenario });
      }
    } else {
      // Show the menu immediately so user can choose Demo or Live mode
      dispatch({ type: 'OPEN_MENU' });
    }
  }, []);

  // Actions
  const openMenu = useCallback(() => dispatch({ type: 'OPEN_MENU' }), []);
  const closeDemo = useCallback(() => {
    clearTimers();
    dispatch({ type: 'CLOSE_DEMO' });
  }, [clearTimers]);

  const startScenario = useCallback((scenarioId: string) => {
    const scenario = allScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      clearTimers();
      dispatch({ type: 'START_SCENARIO', scenario });
    }
  }, [clearTimers]);

  const startTour = useCallback(() => {
    clearTimers();
    dispatch({ type: 'START_TOUR' });
  }, [clearTimers]);

  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const togglePresenterMode = useCallback(() => dispatch({ type: 'TOGGLE_PRESENTER_MODE' }), []);
  const completeInteraction = useCallback(() => dispatch({ type: 'COMPLETE_INTERACTION' }), []);

  // Helpers
  const isSpotlighted = useCallback((target: SpotlightTarget): boolean => {
    if (!currentStep?.spotlight) return false;
    const spotlight = currentStep.spotlight;

    if (spotlight.type !== target.type) return false;

    switch (spotlight.type) {
      case 'component':
        return spotlight.id === (target as any).id;
      case 'track':
        return spotlight.trackId === (target as any).trackId;
      case 'alert':
        return spotlight.alertId === (target as any).alertId;
      case 'prediction':
        return spotlight.predictionId === (target as any).predictionId;
      case 'flight':
        return spotlight.callsign === (target as any).callsign;
      default:
        return false;
    }
  }, [currentStep]);

  const canInteract = useCallback((targetId: string): boolean => {
    // If demo not active, all interactions allowed
    if (!state.isActive || state.mode === 'menu') return true;

    // If no pending interaction, block all
    if (!state.pendingInteraction) return false;

    // Only allow interaction with the target
    return state.pendingInteraction.target === targetId;
  }, [state.isActive, state.mode, state.pendingInteraction]);

  const value: DemoContextValue = {
    state,
    currentStep,
    totalSteps,
    progress,
    scenarios: allScenarios,
    openMenu,
    closeDemo,
    startScenario,
    startTour,
    nextStep,
    prevStep,
    pause,
    resume,
    togglePresenterMode,
    completeInteraction,
    isSpotlighted,
    canInteract,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
}
