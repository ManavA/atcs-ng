import type { Track, Alert, Prediction } from '../../types';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  duration: number; // estimated minutes
  steps: ScenarioStep[];
  initialState: ScenarioState;
}

export interface ScenarioState {
  tracks: Track[];
  alerts: Alert[];
  predictions: Prediction[];
}

export interface ScenarioStep {
  id: string;
  narrative: string;
  atcCommand?: string; // ATC command to speak after narrative (different voice)
  spotlight?: SpotlightTarget;
  interaction?: InteractionRequirement;
  events?: ScenarioEvent[];
  autoAdvance?: number; // ms to wait before auto-advancing (now voice-driven by default)
}

export interface InteractionRequirement {
  type: 'click' | 'acknowledge' | 'select';
  target: string; // Element ID or data ID
  hint: string; // User-facing instruction
}

export interface ScenarioEvent {
  delay: number; // ms from step start
  type: 'updateTrack' | 'addAlert' | 'addPrediction' | 'removeAlert' | 'removePrediction' | 'updatePrediction' | 'triggerHeroMode' | 'custom';
  payload: Partial<Track> | Partial<Alert> | Partial<Prediction> | { id: string } | { active: boolean } | (() => void);
}

export type SpotlightTarget =
  | { type: 'component'; id: 'radar' | 'alerts' | 'predictions' | 'strips' | 'header' }
  | { type: 'track'; trackId: string }
  | { type: 'alert'; alertId: string }
  | { type: 'prediction'; predictionId: string }
  | { type: 'flight'; callsign: string };

export interface DemoState {
  isActive: boolean;
  mode: 'menu' | 'playing' | 'paused' | 'completed';
  presenterMode: boolean; // true = step-through, false = auto-play
  currentScenario: Scenario | null;
  currentStepIndex: number;
  isTourMode: boolean;
  tourScenarioIndex: number;
  // Scenario data overrides
  tracks: Track[];
  alerts: Alert[];
  predictions: Prediction[];
  // Interaction tracking
  pendingInteraction: InteractionRequirement | null;
  interactionCompleted: boolean;
}

export type DemoAction =
  | { type: 'OPEN_MENU' }
  | { type: 'CLOSE_DEMO' }
  | { type: 'START_SCENARIO'; scenario: Scenario }
  | { type: 'START_TOUR' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TOGGLE_PRESENTER_MODE' }
  | { type: 'SET_STATE'; state: Partial<ScenarioState> }
  | { type: 'UPDATE_TRACKS'; tracks: Track[] }
  | { type: 'UPDATE_ALERTS'; alerts: Alert[] }
  | { type: 'UPDATE_PREDICTIONS'; predictions: Prediction[] }
  | { type: 'COMPLETE_INTERACTION' }
  | { type: 'SCENARIO_COMPLETE' }
  | { type: 'TOUR_NEXT_SCENARIO' };
