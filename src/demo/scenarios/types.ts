import type { Track, Alert, Prediction } from '../../types';
import type { CameraShot } from '../../camera/CameraDirector';

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

export type StepPacing = 'fast' | 'normal' | 'dramatic';

export interface ScenarioStep {
  id: string;
  narrative: string;
  atcCommand?: string; // ATC command to speak after narrative (different voice)
  spotlight?: SpotlightTarget;
  interaction?: InteractionRequirement;
  events?: ScenarioEvent[];

  // Audio-synchronized timing configuration
  minDuration?: number;           // Minimum time to show step (ms), default: 3000
  pauseAfterNarration?: number;   // Silence after narration ends (ms), default: calculated by pacing
  maxDuration?: number;           // Safety timeout if audio fails (ms), default: 30000
  waitForAudio?: boolean;         // If false, don't wait for audio completion, default: true
  pacing?: StepPacing;            // Affects pause calculation, default: 'normal'
  emphasize?: boolean;            // Adds extra dramatic pause after step, default: false

  // Camera choreography (NEW)
  cameraShot?: CameraShot | 'auto'; // Explicit camera directive or 'auto' for contextual shot
  cameraTarget?: string;            // Track ID to focus camera on (if cameraShot is 'auto')

  // DEPRECATED: Use new timing fields instead
  autoAdvance?: number;           // ms to wait before auto-advancing (legacy, use minDuration)
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
