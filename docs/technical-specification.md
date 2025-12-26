# Technical Specification

<div align="center">

![hanaML](hanaML-Template-7C3AED.png)

**ATCS-NG: Next Generation Air Traffic Control System**

| Document ID | Version | Status | Classification |
|-------------|---------|--------|----------------|
| TS-ATCS-2024-001 | 2.5.0 | Approved | Internal |

| Author | Reviewers | Approvers |
|--------|-----------|-----------|
| Engineering Team | Tech Lead, Security | VP Engineering |

| Created | Last Updated | Review Cycle |
|---------|--------------|--------------|
| 2024-10-15 | 2024-12-22 | Per Release |

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Component Specifications](#3-component-specifications)
4. [Interface Definitions](#4-interface-definitions)
5. [Data Schemas](#5-data-schemas)
6. [Error Handling](#6-error-handling)
7. [Logging & Observability](#7-logging--observability)
8. [Configuration](#8-configuration)
9. [Build & Deployment](#9-build--deployment)
10. [Appendix](#10-appendix)

---

## 1. Overview

### 1.1 Purpose

This Technical Specification provides detailed implementation guidance for ATCS-NG v2.5.0. It serves as the authoritative reference for developers implementing, maintaining, or extending the system.

### 1.2 Scope

This document covers:
- UI Client (React SPA)
- Demo System (scenarios, TTS, controls)
- Audio System (Cloud TTS integration)
- State Management (Demo and UI state)

---

## 2. Technology Stack

### 2.1 Core Technologies

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TECHNOLOGY STACK                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  FRONTEND                                                                            │
│  ────────                                                                            │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Technology           │  Version     │  Purpose                            │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   React                │  18.2.0      │  UI framework                       │    │
│  │   TypeScript           │  5.3.3       │  Type safety                        │    │
│  │   Vite                 │  7.3.0       │  Build tool                         │    │
│  │   Three.js             │  0.169.0     │  3D rendering                       │    │
│  │   React Three Fiber    │  8.17.0      │  React Three.js wrapper             │    │
│  │   Framer Motion        │  11.15.0     │  Animations                         │    │
│  │   Zustand              │  5.0.0       │  State management                   │    │
│  │   Lucide React         │  0.468.0     │  Icons                              │    │
│  │   React Map GL         │  7.1.0       │  Map rendering                      │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  INFRASTRUCTURE                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Technology           │  Service              │  Purpose                   │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   Docker               │  Nginx Alpine         │  Container runtime         │    │
│  │   Google Cloud Run     │  us-central1          │  Serverless hosting        │    │
│  │   Cloud Storage        │  Artifact Registry    │  Container images          │    │
│  │   Cloud TTS            │  Chirp3-HD voices     │  Voice synthesis           │    │
│  │   Cloud Logging        │  Structured logs      │  Observability             │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Development Environment

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPMENT ENVIRONMENT                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  REQUIREMENTS                                                                        │
│  ────────────                                                                        │
│                                                                                      │
│  • Node.js >= 20.x                                                                   │
│  • npm >= 10.x                                                                       │
│  • Git >= 2.x                                                                        │
│  • Docker >= 24.x (for container builds)                                             │
│  • Google Cloud SDK (for deployment)                                                 │
│                                                                                      │
│  QUICK START                                                                         │
│  ───────────                                                                         │
│                                                                                      │
│  # Clone and install                                                                 │
│  git clone https://github.com/org/atcs-ng.git                                        │
│  cd atcs-ng                                                                          │
│  npm install                                                                         │
│                                                                                      │
│  # Development server                                                                │
│  npm run dev                                                                         │
│                                                                                      │
│  # Production build                                                                  │
│  npm run build                                                                       │
│                                                                                      │
│  # Type checking                                                                     │
│  npx tsc --noEmit                                                                    │
│                                                                                      │
│  NPM SCRIPTS                                                                         │
│  ───────────                                                                         │
│                                                                                      │
│  ┌──────────────────┬─────────────────────────────────────────────────────────┐     │
│  │  Script          │  Description                                            │     │
│  ├──────────────────┼─────────────────────────────────────────────────────────┤     │
│  │  dev             │  Start development server with HMR                      │     │
│  │  build           │  TypeScript compile + Vite production build             │     │
│  │  preview         │  Preview production build locally                       │     │
│  │  lint            │  Run ESLint                                             │     │
│  │  test            │  Run test suite                                         │     │
│  └──────────────────┴─────────────────────────────────────────────────────────┘     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Demo System Components

#### 3.1.1 DemoProvider

```typescript
/**
 * DemoProvider - Main demo context provider
 *
 * Location: src/demo/DemoProvider.tsx
 *
 * Responsibilities:
 * - Manages demo state via useReducer
 * - Provides demo actions (start, pause, next, etc.)
 * - Handles scenario event processing
 * - Controls auto-advance timing
 */

interface DemoContextValue {
  // State
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
```

**State Machine:**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          DEMO STATE TRANSITIONS                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   Action              │  Current State   │  Next State     │  Side Effects          │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│   OPEN_MENU           │  any             │  menu           │  isActive = true       │
│   CLOSE_DEMO          │  any             │  idle           │  Reset to initial      │
│   START_SCENARIO      │  menu            │  playing        │  Load scenario data    │
│   START_TOUR          │  menu            │  playing        │  Load first scenario   │
│   NEXT_STEP           │  playing         │  playing        │  Advance step index    │
│   NEXT_STEP (last)    │  playing         │  completed      │  Mark scenario done    │
│   PREV_STEP           │  playing         │  playing        │  Decrement step index  │
│   PAUSE               │  playing         │  paused         │  Clear timers          │
│   RESUME              │  paused          │  playing        │  Restart timers        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 DemoController (Reducer)

```typescript
/**
 * DemoController - Pure reducer for demo state
 *
 * Location: src/demo/DemoController.ts
 *
 * Pure function: (state, action) => newState
 * No side effects - all async handled in provider
 */

// Initial state
const initialDemoState: DemoState = {
  isActive: false,
  mode: 'menu',
  presenterMode: false,
  currentScenario: null,
  currentStepIndex: 0,
  isTourMode: false,
  tourScenarioIndex: 0,
  tracks: [],
  alerts: [],
  predictions: [],
  pendingInteraction: null,
  interactionCompleted: false,
};

// Reducer function signature
function demoReducer(state: DemoState, action: DemoAction): DemoState;

// Helper functions
function getCurrentStep(state: DemoState): ScenarioStep | null;
function getTotalSteps(state: DemoState): number;
function getProgress(state: DemoState): number; // 0-100
```

#### 3.1.3 NarratorPanel

```typescript
/**
 * NarratorPanel - Demo narration overlay
 *
 * Location: src/demo/components/NarratorPanel.tsx
 *
 * Responsibilities:
 * - Displays current narrative text
 * - Controls TTS playback
 * - Manages auto-advance after TTS completes
 * - Provides playback controls (play/pause/skip)
 */

// Key behaviors:
// 1. On step change: Speak narrative via CloudTTS
// 2. After TTS: Speak ATC command if present
// 3. After all audio: Auto-advance to next step
// 4. Fallback timer: Advance even if TTS fails

// TTS character detection
function detectCharacterFromNarrative(text: string): CharacterVoice {
  // Returns: 'narrator' | 'atc' | 'captain_sharma' | 'fa_priya' | etc.
  // Based on text patterns like "Captain Sharma:" or "ATC:"
}
```

#### 3.1.4 ATCCommandDisplay

```typescript
/**
 * ATCCommandDisplay - "YOU:" typing effect for ATC commands
 *
 * Location: src/demo/components/ATCCommandDisplay.tsx
 *
 * Responsibilities:
 * - Displays ATC commands with typing effect
 * - Triggers TTS for ATC voice after typing
 * - Shows status (TYPING... / TRANSMITTING)
 */

interface ATCCommandDisplayProps {
  command: string | null;
  onComplete?: () => void;
}

// Typing speed: 40ms per character
// After typing: CloudTTS.speakATC(command, onComplete)
```

### 3.2 Audio System Components

#### 3.2.1 CloudTTS

```typescript
/**
 * CloudTTS - Google Cloud Text-to-Speech integration
 *
 * Location: src/audio/CloudTTS.ts
 *
 * Responsibilities:
 * - Synthesize text to speech via Google Cloud TTS API
 * - Map characters to appropriate voices
 * - Apply radio effects for ATC voice
 * - Handle browser fallback
 */

class CloudTTS {
  // Singleton pattern for global audio management
  private static instance: CloudTTS;
  private audioContext: AudioContext | null = null;
  private useBrowserFallback: boolean = false;

  // Main speak method
  static speak(
    text: string,
    character: CharacterVoice,
    onComplete?: () => void
  ): void;

  // ATC-specific with radio effects
  static speakATC(
    text: string,
    onComplete?: () => void
  ): void;

  // Control methods
  static cancel(): void;
  static setBrowserFallback(enabled: boolean): void;
  static forceInit(): void;
}

// Voice configuration
const VOICE_CONFIG: Record<CharacterVoice, VoiceSettings> = {
  narrator: {
    languageCode: 'en-US',
    name: 'en-US-Chirp3-HD',
    pitch: 0,
    speakingRate: 1.0,
  },
  atc: {
    languageCode: 'en-US',
    name: 'en-US-Chirp3-HD',
    pitch: -2,
    speakingRate: 1.1,
    // Radio effect applied
  },
  captain_sharma: {
    languageCode: 'en-IN',
    name: 'en-IN-Chirp3-HD',
    pitch: -1,
    speakingRate: 0.95,
  },
  // ... more voices
};
```

### 3.3 Visualization Components

#### 3.3.1 RadarMap

```typescript
/**
 * RadarMap - 2D radar display
 *
 * Location: src/components/Map/RadarMap.tsx
 *
 * Dependencies:
 * - react-map-gl (Mapbox GL JS wrapper)
 * - maplibre-gl (rendering engine)
 */

interface RadarMapProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  showDataBlocks: boolean;
  showTrails: boolean;
}

// Map configuration
const MAP_CONFIG = {
  center: [42.3601, -71.0589], // Boston
  zoom: 8,
  style: 'dark', // Custom dark theme
  projection: 'mercator',
};
```

#### 3.3.2 Scene3D

```typescript
/**
 * Scene3D - 3D visualization
 *
 * Location: src/components/Scene3D/Scene3D.tsx
 *
 * Dependencies:
 * - @react-three/fiber
 * - @react-three/drei
 * - three.js
 */

interface Scene3DProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  mapCenter: [number, number];
}

// 3D coordinate conversion
function latLonToScene(lat: number, lon: number, center: [number, number]): [number, number, number] {
  // Convert lat/lon to Three.js coordinates
  // Scale: 1 unit = 1 nautical mile
}
```

---

## 4. Interface Definitions

### 4.1 TypeScript Interfaces

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// TRACK INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface Track {
  // Core identification
  trackId: string;
  callsign: string;

  // Position & movement
  latitudeDeg: number;
  longitudeDeg: number;
  altitudeFt: number;
  headingDeg: number;
  speedKt: number;
  verticalRateFpm: number;

  // Quality & metadata
  confidence: number;
  sequence: number;
  updatedAt: string;

  // Aircraft info
  airline?: string;
  aircraftType?: string;
  countryCode?: string;
  souls?: number;

  // Transponder
  squawkCode?: string;
  transponderActive?: boolean;

  // Visual state
  visualState?: 'normal' | 'hijacked' | 'hero' | 'crashed';
  dataCorruption?: number;

  // Autopilot status (v2.5+)
  autopilotStatus?: 'engaged' | 'disengaged' | 'manual' | 'remote_guided';
  autopilotMode?: string;

  // Emergency status (v2.5+)
  emergencyType?: 'hijack' | 'medical' | 'mechanical' | 'fuel' | 'fire' | 'incapacitated_crew';
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface Alert {
  alertId: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  alertType: AlertType;
  message: string;
  involvedFlightIds: string[];
  sectorId: string;
  timestamp: string;
  acknowledged: boolean;
}

type AlertType =
  | 'CONFLICT_PREDICTED'
  | 'DEVIATION_DETECTED'
  | 'EMERGENCY_DECLARED'
  | 'WEATHER_HAZARD'
  | 'LOSS_OF_SEPARATION';

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface Prediction {
  id: string;
  predictionType: 'CONFLICT' | 'DEVIATION' | 'WEATHER' | 'FUEL';
  involvedFlights: string[];
  probability: number;
  predictedTime: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: number;
  initialState: ScenarioInitialState;
  steps: ScenarioStep[];
}

interface ScenarioStep {
  id: string;
  narrative: string;
  atcCommand?: string;
  spotlight?: SpotlightTarget;
  autoAdvance?: number;
  interaction?: InteractionSpec;
  events?: ScenarioEvent[];
}

interface ScenarioEvent {
  delay: number;
  type: 'updateTrack' | 'addAlert' | 'removeAlert' | 'addPrediction' |
        'updatePrediction' | 'removePrediction' | 'triggerHeroMode';
  payload: Record<string, any>;
}

type SpotlightTarget =
  | { type: 'component'; id: string }
  | { type: 'track'; trackId: string }
  | { type: 'alert'; alertId: string }
  | { type: 'prediction'; predictionId: string }
  | { type: 'flight'; callsign: string };

// ─────────────────────────────────────────────────────────────────────────────
// DEMO STATE INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface DemoState {
  isActive: boolean;
  mode: 'menu' | 'playing' | 'paused' | 'completed';
  presenterMode: boolean;
  currentScenario: Scenario | null;
  currentStepIndex: number;
  isTourMode: boolean;
  tourScenarioIndex: number;
  tracks: Track[];
  alerts: Alert[];
  predictions: Prediction[];
  pendingInteraction: InteractionSpec | null;
  interactionCompleted: boolean;
}

type DemoAction =
  | { type: 'OPEN_MENU' }
  | { type: 'CLOSE_DEMO' }
  | { type: 'START_SCENARIO'; scenario: Scenario }
  | { type: 'START_TOUR' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TOGGLE_PRESENTER_MODE' }
  | { type: 'UPDATE_TRACKS'; tracks: Track[] }
  | { type: 'UPDATE_ALERTS'; alerts: Alert[] }
  | { type: 'UPDATE_PREDICTIONS'; predictions: Prediction[] }
  | { type: 'COMPLETE_INTERACTION' }
  | { type: 'SET_STATE'; state: Partial<DemoState> }
  | { type: 'SCENARIO_COMPLETE' }
  | { type: 'TOUR_NEXT_SCENARIO' };
```

### 4.2 UI Store Interface

```typescript
/**
 * UI Store - Zustand store for UI state
 *
 * Location: src/store/index.ts
 */

interface UIStore {
  // View settings
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;

  // Hero mode
  heroModeActive: boolean;
  setHeroModeActive: (active: boolean) => void;

  // Application mode
  appMode: 'demo' | 'live';
  setAppMode: (mode: 'demo' | 'live') => void;
  liveOnly: boolean;
  setLiveOnly: (liveOnly: boolean) => void;

  // Audio settings
  narrationEnabled: boolean;
  setNarrationEnabled: (enabled: boolean) => void;

  // Command logging
  commandLog: CommandLogEntry[];
  addCommandLog: (entry: Omit<CommandLogEntry, 'id' | 'timestamp'>) => void;
  clearCommandLog: () => void;
}

interface CommandLogEntry {
  id: string;
  callsign: string;
  command: string;
  type: 'heading' | 'altitude' | 'speed' | 'squawk' | 'frequency' | 'hold' | 'other';
  timestamp: Date;
}
```

---

## 5. Data Schemas

### 5.1 Scenario Schema

```yaml
# Scenario file structure (TypeScript object)
# Location: src/demo/scenarios/*.ts

Scenario:
  id: string                    # Unique identifier (kebab-case)
  title: string                 # Display title
  description: string           # Brief description
  icon: string                  # Lucide icon name
  duration: number              # Estimated duration in minutes

  initialState:
    tracks: Track[]             # Starting aircraft positions
    alerts: Alert[]             # Starting alerts (usually empty)
    predictions: Prediction[]   # Starting predictions (usually empty)

  steps: ScenarioStep[]         # Ordered list of demo steps

ScenarioStep:
  id: string                    # Step identifier (scenario-id-step-name)
  narrative: string             # Text to display and speak
  atcCommand?: string           # Optional ATC command to show/speak
  spotlight?: SpotlightTarget   # What to highlight
  autoAdvance?: number          # Milliseconds before auto-advancing
  interaction?: InteractionSpec # Required user interaction
  events?: ScenarioEvent[]      # Data changes during step
```

### 5.2 Voice Configuration Schema

```typescript
// Voice configuration for Cloud TTS
// Location: src/audio/CloudTTS.ts

interface VoiceSettings {
  languageCode: string;         // BCP-47 language code
  name: string;                 // Google Cloud TTS voice name
  pitch: number;                // Pitch adjustment (-20 to 20)
  speakingRate: number;         // Speed (0.25 to 4.0)
  ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

// Supported voice configurations
const SUPPORTED_VOICES = {
  'en-US': ['en-US-Chirp3-HD', 'en-US-Chirp3-HD-F'],
  'en-GB': ['en-GB-Chirp3-HD'],
  'en-AU': ['en-AU-Chirp3-HD'],
  'en-IN': ['en-IN-Chirp3-HD'],
  'nb-NO': ['nb-NO-Chirp3-HD'],
  'sv-SE': ['sv-SE-Chirp3-HD'],
};
```

---

## 6. Error Handling

### 6.1 Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ERROR HANDLING STRATEGY                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ERROR CATEGORIES                                                                    │
│  ────────────────                                                                    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Category          │  Example                    │  Handling              │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   Network Error     │  API unreachable            │  Retry + fallback      │    │
│  │   TTS Error         │  Cloud TTS fails            │  Browser TTS fallback  │    │
│  │   Audio Error       │  AudioContext blocked       │  Show manual button    │    │
│  │   Render Error      │  3D scene fails             │  Fall back to 2D       │    │
│  │   State Error       │  Invalid reducer action     │  Log + ignore          │    │
│  │   Data Error        │  Malformed track data       │  Skip invalid entries  │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  RECOVERY PATTERNS                                                                   │
│  ─────────────────                                                                   │
│                                                                                      │
│  1. TTS Failure Recovery:                                                            │
│     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│     │ Cloud TTS│────►│ Error?   │────►│ Browser  │────►│ Fallback │               │
│     │ Request  │ No  │          │ Yes │ TTS      │ No  │ Timer    │               │
│     └──────────┘     └──────────┘     └──────────┘     └──────────┘               │
│           │                                                   │                     │
│           ▼                                                   ▼                     │
│     ┌──────────┐                                        ┌──────────┐               │
│     │ Play     │                                        │ Auto     │               │
│     │ Audio    │                                        │ Advance  │               │
│     └──────────┘                                        └──────────┘               │
│                                                                                      │
│  2. Demo Interruption Recovery:                                                      │
│     • Fixed in v2.5: Removed setTimeout that called openMenu()                      │
│     • Demo menu only opens on mount or explicit button click                        │
│     • Clicking on map/radar no longer interrupts demo                               │
│                                                                                      │
│  3. Audio Context Recovery:                                                          │
│     • AudioContext requires user gesture to start                                    │
│     • VoiceNotification.forceInit() called on first interaction                     │
│     • "Audio not working?" button for manual fallback toggle                        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Error Codes

```typescript
// Error code enumeration
enum ErrorCode {
  // Network errors (1xxx)
  NETWORK_ERROR = 1000,
  API_TIMEOUT = 1001,
  API_RATE_LIMITED = 1002,

  // TTS errors (2xxx)
  TTS_INIT_FAILED = 2000,
  TTS_SYNTHESIS_FAILED = 2001,
  TTS_AUDIO_BLOCKED = 2002,

  // State errors (3xxx)
  INVALID_ACTION = 3000,
  INVALID_STATE = 3001,
  SCENARIO_NOT_FOUND = 3002,

  // Render errors (4xxx)
  WEBGL_NOT_SUPPORTED = 4000,
  THREE_INIT_FAILED = 4001,
  MAP_LOAD_FAILED = 4002,
}
```

---

## 7. Logging & Observability

### 7.1 Logging Standards

```typescript
// Logging format
// All logs prefixed with component identifier

// Demo system logs
console.log('[Demo] Starting scenario:', scenarioId);
console.log('[Demo] Step advanced to:', stepIndex);
console.log('[Demo] TTS fallback timer fired for step:', stepId);

// Audio system logs
console.log('[CloudTTS] Speaking:', text.substring(0, 50));
console.log('[CloudTTS] Audio playback started');
console.log('[CloudTTS] Using browser fallback');

// Voice notification logs
console.log('[Voice] Initialized on user interaction');
console.log('[Voice] Fallback disabled during demo');

// Error logs
console.error('[CloudTTS] Synthesis failed:', error);
console.warn('[Demo] Invalid action received:', action);
```

### 7.2 Metrics Collection

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              METRICS COLLECTION                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  KEY METRICS                                                                         │
│  ───────────                                                                         │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Metric                    │  Type     │  Collection Point                │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   demo_started              │  Counter  │  START_SCENARIO dispatch         │    │
│  │   demo_completed            │  Counter  │  Mode changes to 'completed'     │    │
│  │   demo_abandoned            │  Counter  │  CLOSE_DEMO before completion    │    │
│  │   step_duration_ms          │  Histogram│  Time between steps              │    │
│  │   tts_success_rate          │  Gauge    │  TTS success / total requests    │    │
│  │   tts_latency_ms            │  Histogram│  Time to first audio byte        │    │
│  │   hero_mode_completion      │  Counter  │  Hero mode success/failure       │    │
│  │   3d_scene_fps              │  Gauge    │  requestAnimationFrame timing    │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Configuration

### 8.1 Environment Variables

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ENVIRONMENT VARIABLES                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  BUILD-TIME VARIABLES (Vite)                                                         │
│  ───────────────────────────                                                         │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Variable                  │  Default              │  Description          │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   VITE_API_URL              │  /api                 │  API base URL         │    │
│  │   VITE_MAPBOX_TOKEN         │  -                    │  Mapbox API token     │    │
│  │   VITE_GCP_PROJECT_ID       │  -                    │  GCP project ID       │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  RUNTIME VARIABLES (Cloud Run)                                                       │
│  ─────────────────────────────                                                       │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Variable                  │  Default              │  Description          │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   PORT                      │  8080                 │  Server port          │    │
│  │   API_GATEWAY_URL           │  http://localhost:8080│  Backend API URL      │    │
│  │   GOOGLE_APPLICATION_CREDS  │  -                    │  GCP service account  │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  URL PARAMETERS                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Parameter   │  Values                    │  Effect                        │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   demo        │  tour, showcase-demo, etc  │  Auto-start specific demo      │    │
│  │   nodemo      │  true                      │  Skip demo menu on load        │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Feature Flags

```typescript
// Feature flags (hardcoded for v2.5, configurable in v3.0)
const FEATURE_FLAGS = {
  CLOUD_TTS_ENABLED: true,
  BROWSER_TTS_FALLBACK: true,
  HERO_MODE_ENABLED: true,
  ATC_COMMAND_DISPLAY: true,
  AUTOPILOT_STATUS: true,
  THREE_D_SCENE: true,
};
```

---

## 9. Build & Deployment

### 9.1 Build Process

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BUILD PROCESS                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  PRODUCTION BUILD PIPELINE                                                           │
│  ─────────────────────────                                                           │
│                                                                                      │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│  │   tsc   │──►│  vite   │──►│ rollup  │──►│ minify  │──►│ output  │              │
│  │ compile │   │  build  │   │ bundle  │   │ terser  │   │  dist/  │              │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘              │
│                                                                                      │
│  BUILD COMMANDS                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  # Type check                                                                        │
│  npx tsc --noEmit                                                                    │
│                                                                                      │
│  # Production build                                                                  │
│  npm run build                                                                       │
│                                                                                      │
│  # Output structure                                                                  │
│  dist/                                                                               │
│  ├── index.html              # Entry point                                           │
│  ├── assets/                                                                         │
│  │   ├── index-[hash].js     # Main bundle (~1.7MB)                                 │
│  │   └── index-[hash].css    # Styles (~21KB)                                       │
│  └── fonts/                  # Web fonts                                             │
│                                                                                      │
│  DOCKER BUILD                                                                        │
│  ────────────                                                                        │
│                                                                                      │
│  # Local build                                                                       │
│  docker build -t atcs-ng-ui .                                                        │
│                                                                                      │
│  # Cloud Build                                                                       │
│  gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT/atcs-ng-repo/ui      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Deployment Process

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOYMENT PROCESS                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  CLOUD RUN DEPLOYMENT                                                                │
│  ────────────────────                                                                │
│                                                                                      │
│  # Deploy to Cloud Run                                                               │
│  gcloud run deploy ui-client \                                                       │
│    --image us-central1-docker.pkg.dev/PROJECT/atcs-ng-repo/ui-client:latest \       │
│    --region us-central1 \                                                            │
│    --project PROJECT \                                                               │
│    --allow-unauthenticated \                                                         │
│    --port 8080                                                                       │
│                                                                                      │
│  CONFIGURATION                                                                       │
│  ─────────────                                                                       │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Setting                   │  Value                │  Rationale            │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   CPU                       │  1                    │  Sufficient for SPA   │    │
│  │   Memory                    │  512Mi                │  Nginx + static       │    │
│  │   Min instances             │  0                    │  Scale to zero        │    │
│  │   Max instances             │  10                   │  Handle traffic       │    │
│  │   Concurrency               │  80                   │  Default              │    │
│  │   Request timeout           │  60s                  │  Default              │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  NGINX CONFIGURATION                                                                 │
│  ───────────────────                                                                 │
│                                                                                      │
│  # Key nginx.conf settings                                                           │
│  server {                                                                            │
│    listen 8080;                                                                      │
│    root /usr/share/nginx/html;                                                       │
│                                                                                      │
│    # SPA routing                                                                     │
│    location / {                                                                      │
│      try_files $uri $uri/ /index.html;                                              │
│    }                                                                                 │
│                                                                                      │
│    # Cache static assets                                                             │
│    location /assets/ {                                                               │
│      expires 1y;                                                                     │
│      add_header Cache-Control "public, immutable";                                   │
│    }                                                                                 │
│                                                                                      │
│    # API proxy (if needed)                                                           │
│    location /api/ {                                                                  │
│      proxy_pass $API_GATEWAY_URL;                                                    │
│    }                                                                                 │
│  }                                                                                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Appendix

### 10.1 Directory Structure

```
src/
├── App.tsx                      # Main app component
├── main.tsx                     # Entry point
├── vite-env.d.ts               # Vite type declarations
│
├── components/                  # UI components
│   ├── Map/                    # 2D radar map
│   ├── Scene3D/                # 3D visualization
│   ├── FlightStrips/           # Flight strip bay
│   ├── Alerts/                 # Alert panel
│   ├── Predictions/            # AI predictions
│   ├── Controls/               # View controls
│   │   ├── ModeToggle.tsx      # DEMO/LIVE toggle
│   │   ├── ViewModeToggle.tsx  # 2D/3D toggle
│   │   └── TimeSlider.tsx      # Time control
│   ├── Widgets/                # Status widgets
│   ├── Header.tsx              # App header
│   ├── StatusBar.tsx           # Status bar
│   └── ...
│
├── demo/                        # Demo system
│   ├── index.ts                # Exports
│   ├── DemoProvider.tsx        # Context provider
│   ├── DemoController.ts       # State reducer
│   ├── components/             # Demo overlays
│   │   ├── DemoMenuModal.tsx   # Scenario menu
│   │   ├── NarratorPanel.tsx   # Narration display
│   │   ├── SpotlightOverlay.tsx# Element highlighting
│   │   └── ATCCommandDisplay.tsx# "YOU:" typing
│   ├── hooks/                  # Demo hooks
│   │   └── useDemoData.ts      # Merge demo + live data
│   └── scenarios/              # Demo scenarios
│       ├── index.ts            # Scenario registry
│       ├── types.ts            # Type definitions
│       └── showcase-demo.ts    # Main crisis demo
│
├── audio/                       # Audio system
│   ├── index.ts                # Exports
│   ├── CloudTTS.ts             # Google Cloud TTS
│   └── VoiceNotification.ts    # Browser TTS fallback
│
├── hooks/                       # Custom React hooks
│   ├── useTrackStream.ts       # Track data stream
│   ├── useAlerts.ts            # Alert management
│   └── usePredictions.ts       # Prediction data
│
├── store/                       # State management
│   └── index.ts                # Zustand store
│
├── types/                       # TypeScript types
│   └── index.ts                # Core type definitions
│
└── styles/                      # Global styles
    └── globals.css             # CSS variables, fonts
```

### 10.2 Key File Locations

| Component | File Path |
|-----------|-----------|
| Main App | `src/App.tsx` |
| Demo Provider | `src/demo/DemoProvider.tsx` |
| Demo Reducer | `src/demo/DemoController.ts` |
| Showcase Scenario | `src/demo/scenarios/showcase-demo.ts` |
| Cloud TTS | `src/audio/CloudTTS.ts` |
| UI Store | `src/store/index.ts` |
| Type Definitions | `src/types/index.ts` |

### 10.3 Related Documents

- [Product Requirements Document](./product-requirements-document.md)
- [Design Document](./design-document.md)
- [Release Plan](./release-plan.md)

---

<div align="center">

![hanaML](hanaML-Template-7C3AED.png)

*This document is maintained by the Engineering Team and updated per release.*

</div>
