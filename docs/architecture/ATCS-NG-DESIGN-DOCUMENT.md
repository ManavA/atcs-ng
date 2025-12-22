# Design Document: ATCS-NG UI Client

**Version:** 2.5.0
**Date:** 2025-12-22
**Author:** Manav Agarwal
**Status:** APPROVED

---

## 1. Executive Summary

ATCS-NG UI Client is a modern, React-based air traffic control workstation interface that provides real-time radar display, alert management, and an immersive demo mode with high-quality voice synthesis. The system is designed as a cloud-native single-page application deployed on Google Cloud Run.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ATCS-NG UI Client                               │
│                          (React SPA on Cloud Run)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         PRESENTATION LAYER                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Header  │ │ RadarMap │ │  Alerts  │ │ FlightDtl│ │ StatusBar│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│  │  │ Narrator │ │ HeroMode │ │ CmdModal │ │ DemoMenu │               │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                          STATE LAYER                                 │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │   Zustand Store  │  │  DemoContext     │  │  React Query     │  │   │
│  │  │   (UI State)     │  │  (Demo State)    │  │  (API Cache)     │  │   │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                         SERVICE LAYER                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ CloudTTS │ │AudioMgr  │ │VoiceNotif│ │ DemoData │ │Simulation│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            ▼                        ▼                        ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│  Google Cloud     │    │   OpenStreetMap   │    │   Google Fonts    │
│  Text-to-Speech   │    │   Tile Server     │    │                   │
│  API              │    │                   │    │                   │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

### 2.2 Component Architecture

```
src/
├── App.tsx                      # Root component
├── main.tsx                     # Entry point
│
├── components/                  # UI Components
│   ├── Header/                  # Top navigation bar
│   │   └── Header.tsx
│   ├── RadarMap/               # Main radar display
│   │   ├── RadarMap.tsx        # 2D Leaflet map
│   │   ├── AircraftMarker.tsx  # Aircraft blips
│   │   ├── DataBlock.tsx       # Flight data overlay
│   │   └── TrailPath.tsx       # Historical path
│   ├── RadarMap3D/             # 3D radar view
│   │   └── RadarMap3D.tsx      # Three.js scene
│   ├── Alerts/                 # Alert system
│   │   └── AlertPanel.tsx      # Alert list & actions
│   ├── FlightStrips/           # Flight strip panel
│   │   └── FlightStrip.tsx     # Individual strip
│   ├── FlightDetail/           # Selected flight info
│   │   └── FlightDetail.tsx    # Detail panel
│   ├── CommandModal/           # ATC command interface
│   │   └── CommandModal.tsx    # Command buttons
│   ├── StatusBar/              # Bottom status bar
│   │   └── StatusBar.tsx       # Connection, time, version
│   └── HeroMode/               # Interactive mode
│       └── HeroModePanel.tsx   # User controls
│
├── demo/                        # Demo Mode System
│   ├── DemoProvider.tsx        # Context provider
│   ├── DemoContext.tsx         # State types
│   ├── useDemoMode.ts          # Hook for demo state
│   ├── useDemoData.ts          # Demo data hook
│   ├── components/
│   │   ├── NarratorPanel.tsx   # Voice narration UI
│   │   ├── DemoMenuModal.tsx   # Mode selection
│   │   └── DemoControls.tsx    # Play/pause/skip
│   └── scenarios/
│       └── showcase-demo.ts    # Scripted scenarios
│
├── audio/                       # Audio System
│   ├── AudioManager.ts         # Sound effects
│   ├── CloudTTS.ts             # Google Cloud TTS
│   └── VoiceNotification.ts    # Browser TTS fallback
│
├── store/                       # State Management
│   └── uiStore.ts              # Zustand store
│
├── types/                       # TypeScript Types
│   └── index.ts                # Shared types
│
├── assets/                      # Static Assets
│   └── airlines.ts             # Airline data
│
└── styles/                      # Global Styles
    └── index.css               # CSS reset & base
```

### 2.3 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   React     │────▶│   Zustand   │
│   Action    │     │   Event     │     │   Store     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────┐
│                   State Update                       │
├─────────────────────────────────────────────────────┤
│  • selectedFlightId                                 │
│  • alerts[]                                         │
│  • commandLog[]                                     │
│  • liveOnly                                         │
│  • connected                                        │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Component Re-render                     │
│  (Zustand selectors minimize unnecessary renders)   │
└─────────────────────────────────────────────────────┘
```

### 2.4 Demo Mode State Machine

```
                              ┌─────────────┐
                              │    IDLE     │
                              │  (Initial)  │
                              └──────┬──────┘
                                     │ User clicks Demo
                                     ▼
                              ┌─────────────┐
                              │  MENU_OPEN  │◄────────────────┐
                              │             │                 │
                              └──────┬──────┘                 │
                                     │ Select mode            │
                       ┌─────────────┴─────────────┐         │
                       ▼                           ▼         │
               ┌─────────────┐             ┌─────────────┐   │
               │   PLAYING   │             │  LIVE_ONLY  │   │
               │             │             │             │   │
               └──────┬──────┘             └─────────────┘   │
                      │                                       │
        ┌─────────────┼─────────────┐                        │
        ▼             ▼             ▼                        │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│   PAUSED    │ │ INTERACTION │ │   HERO      │             │
│             │ │  PENDING    │ │   MODE      │             │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘             │
       │               │               │                     │
       └───────────────┴───────────────┘                     │
                       │                                     │
                       ▼                                     │
               ┌─────────────┐                              │
               │  COMPLETE   │──────────────────────────────┘
               │             │
               └─────────────┘
```

---

## 3. Component Details

### 3.1 RadarMap Component

**Responsibility:** Display aircraft positions on a 2D map with real-time updates.

**Technology:** Leaflet + React-Leaflet

**Features:**
- OpenStreetMap tile layer with dark theme
- Aircraft markers with rotation based on heading
- Data blocks showing callsign, altitude, speed
- Trail paths showing recent aircraft movement
- Click-to-select functionality
- Zoom and pan controls

**Performance Optimizations:**
- Canvas renderer for markers (vs SVG)
- Debounced position updates
- Virtualized rendering for off-screen aircraft

### 3.2 AlertPanel Component

**Responsibility:** Display and manage system alerts.

**Features:**
- Severity-based styling (CRITICAL, WARNING, INFO)
- Acknowledge functionality
- Auto-dismiss for acknowledged alerts
- Audio notification triggers
- Click-to-focus on involved aircraft

**Alert Lifecycle:**
```typescript
interface Alert {
  alertId: string;
  type: 'TCAS' | 'CONFLICT' | 'WEATHER' | 'EMERGENCY' | 'INFO';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  involvedFlightIds: string[];
}
```

### 3.3 CloudTTS Service

**Responsibility:** High-quality voice synthesis using Google Cloud Text-to-Speech.

**API Configuration:**
```typescript
class CloudTTSService {
  private apiKey: string = 'AIza...';  // Restricted to TTS API
  private endpoint: string = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  async speak(text: string, voice: VoiceConfig): Promise<void>;
  speakNarrator(text: string): Promise<void>;
  speakATC(text: string): Promise<void>;
}
```

**Voice Mapping:**
| Role | Voice ID | Language |
|------|----------|----------|
| Narrator | en-US-Chirp3-HD-Achernar | en-US |
| ATC | en-US-Chirp3-HD-Fenrir | en-US |
| Indian Pilot | en-IN-Chirp3-HD-Charon | en-IN |
| Australian Pilot | en-AU-Chirp3-HD-Puck | en-AU |
| Norwegian Speaker | no-NO-Chirp3-HD-Kore | no-NO |

**Fallback Strategy:**
1. Attempt Google Cloud TTS
2. On failure, use browser SpeechSynthesis
3. On complete failure, skip voice and use fallback timer

### 3.4 DemoProvider Context

**Responsibility:** Manage demo mode state and progression.

**State:**
```typescript
interface DemoState {
  isActive: boolean;
  mode: 'idle' | 'menu' | 'playing' | 'paused' | 'complete';
  currentScenario: string | null;
  currentStepIndex: number;
  presenterMode: boolean;
  pendingInteraction: boolean;
}
```

**Actions:**
- `startDemo()` - Begin demo playback
- `pauseDemo()` - Pause at current step
- `resumeDemo()` - Resume from paused state
- `nextStep()` - Advance to next step
- `skipScenario()` - Skip current scenario
- `closeDemo()` - End demo mode

---

## 4. Data Model

### 4.1 Flight Entity

```typescript
interface Flight {
  // Identification
  id: string;
  callsign: string;
  squawk: string;

  // Aircraft
  aircraftType: string;
  aircraftCategory: 'regional' | 'narrowbody' | 'widebody' | 'heavy' | 'super';

  // Airline
  airline: {
    code: string;
    name: string;
    country: string;
    flag: string;
  };

  // Position
  position: {
    lat: number;
    lon: number;
  };
  altitude: number;
  heading: number;
  speed: number;
  verticalSpeed: number;

  // Flight Plan
  origin: string;
  destination: string;
  route: string;

  // Status
  status: 'active' | 'emergency' | 'ground';
  soulCount: number;

  // Timestamps
  lastUpdate: string;
}
```

### 4.2 Demo Step Entity

```typescript
interface DemoStep {
  id: string;
  type: 'narration' | 'action' | 'alert' | 'interaction' | 'hero';

  // Content
  narrative?: string;
  atcCommand?: string;
  pilotResponse?: string;

  // Timing
  autoAdvance?: number;  // ms to wait before auto-advancing
  waitForTTS?: boolean;  // Wait for voice to complete

  // Actions
  actions?: DemoAction[];

  // Conditions
  requiresInteraction?: boolean;
}

interface DemoAction {
  type: 'spawn' | 'move' | 'alert' | 'crash' | 'hero_start' | 'hero_end';
  target?: string;
  params?: Record<string, any>;
}
```

---

## 5. Security Architecture

### 5.1 API Key Protection

**Current Implementation:**
- API key embedded in client code
- Restricted to `texttospeech.googleapis.com` API only
- Limited to specific referrer domains

**Future Enhancement:**
- Server-side proxy for TTS requests
- OAuth2 for user authentication
- Rate limiting per session

### 5.2 Content Security

- No user-generated content stored
- Demo data is static/hardcoded
- No PII collected or transmitted

---

## 6. Performance Considerations

### 6.1 Bundle Optimization

| Chunk | Size (gzip) | Contents |
|-------|-------------|----------|
| Main | ~490KB | React, Three.js, Leaflet |
| Vendor | ~200KB | framer-motion, zustand |
| Runtime | ~10KB | Vite runtime |

**Optimization Strategies:**
- Code splitting for 3D view (lazy loaded)
- Tree shaking for unused exports
- Preloading critical assets

### 6.2 Runtime Performance

| Operation | Target | Actual |
|-----------|--------|--------|
| Initial render | <1s | ~800ms |
| Map pan/zoom | 60fps | 60fps |
| 50 aircraft update | <16ms | ~12ms |
| Alert animation | 60fps | 60fps |

### 6.3 Memory Management

- Aircraft trails limited to 100 points
- Old alerts auto-removed after acknowledgment
- Audio buffers released after playback

---

## 7. Deployment Architecture

### 7.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Cloud Run                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              ui-client                              │  │  │
│  │  │  (Nginx serving static React build)                 │  │  │
│  │  │  Region: us-central1                                │  │  │
│  │  │  Min instances: 0                                   │  │  │
│  │  │  Max instances: 2                                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Artifact Registry                         │  │
│  │  Repository: atcs-ng-repo                                │  │
│  │  Image: ui-client:v2.5.0                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Push    │───▶│  Build   │───▶│  Push    │───▶│  Deploy  │
│  to main │    │  (npm)   │    │  (Docker)│    │ (CloudRun│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ GitHub   │    │ TypeScript│   │ Artifact │    │ Traffic  │
│ Actions  │    │ Check    │    │ Registry │    │ Routing  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 8. Diagrams

### 8.1 Use Case Diagram

```
                    ┌─────────────────────────────────────┐
                    │         ATCS-NG UI Client           │
                    └─────────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│  Demo Viewer  │          │   Evaluator   │          │  Sales Rep    │
└───────┬───────┘          └───────┬───────┘          └───────┬───────┘
        │                          │                          │
        │ ┌──────────────────────┐ │                          │
        ├▶│   Watch Demo         │◀┤                          │
        │ └──────────────────────┘ │                          │
        │ ┌──────────────────────┐ │                          │
        ├▶│   View Radar         │◀┤                          │
        │ └──────────────────────┘ │                          │
        │ ┌──────────────────────┐ │                          │
        └▶│   See Alerts         │◀┘                          │
          └──────────────────────┘                            │
          ┌──────────────────────┐                            │
          │   Interact w/ Hero   │◀───────────────────────────┤
          └──────────────────────┘                            │
          ┌──────────────────────┐                            │
          │   Start Demo         │◀───────────────────────────┘
          └──────────────────────┘
```

### 8.2 Sequence Diagram: Demo Playback

```
┌──────┐     ┌──────────┐     ┌────────┐     ┌────────┐     ┌──────────┐
│ User │     │DemoProvider│   │Narrator│     │CloudTTS│     │AudioMgr  │
└──┬───┘     └─────┬─────┘   └────┬────┘     └────┬───┘     └─────┬────┘
   │               │              │               │               │
   │  Click Demo   │              │               │               │
   │──────────────▶│              │               │               │
   │               │              │               │               │
   │               │ Show Menu    │               │               │
   │               │─────────────▶│               │               │
   │               │              │               │               │
   │  Select Play  │              │               │               │
   │──────────────▶│              │               │               │
   │               │              │               │               │
   │               │  Start Step  │               │               │
   │               │─────────────▶│               │               │
   │               │              │               │               │
   │               │              │  Speak Text   │               │
   │               │              │──────────────▶│               │
   │               │              │               │               │
   │               │              │               │ Audio Ready   │
   │               │              │               │──────────────▶│
   │               │              │               │               │
   │               │              │               │  Play Sound   │
   │◀──────────────│──────────────│───────────────│───────────────│
   │               │              │               │               │
   │               │              │  TTS Complete │               │
   │               │              │◀──────────────│               │
   │               │              │               │               │
   │               │  Next Step   │               │               │
   │               │◀─────────────│               │               │
   │               │              │               │               │
```

### 8.3 State Diagram: Alert Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                         Alert Lifecycle                          │
└─────────────────────────────────────────────────────────────────┘

                         ┌────────────┐
                         │  CREATED   │
                         │            │
                         └──────┬─────┘
                                │
                    Conflict detected
                                │
                                ▼
                         ┌────────────┐
        ┌───────────────▶│  ACTIVE    │◀───────────────┐
        │                │            │                │
        │                └──────┬─────┘                │
        │                       │                      │
        │           ┌───────────┴───────────┐         │
        │           │                       │         │
        │    User clicks ACK         Auto-resolve     │
        │           │                       │         │
        │           ▼                       ▼         │
        │    ┌────────────┐         ┌────────────┐   │
        │    │ACKNOWLEDGED│         │  RESOLVED  │   │
        │    │            │         │            │   │
        │    └──────┬─────┘         └──────┬─────┘   │
        │           │                      │          │
        │           │    After timeout     │          │
        │           └──────────┬───────────┘          │
        │                      │                      │
        │                      ▼                      │
        │               ┌────────────┐                │
        │               │  ARCHIVED  │                │
        │               │            │                │
        │               └────────────┘                │
        │                                             │
        │              New related event              │
        └─────────────────────────────────────────────┘
```

---

## 9. Cross-Cutting Concerns

### 9.1 Logging

```typescript
// Console logging with levels
console.log('[Demo]', 'Step started:', stepId);
console.warn('[TTS]', 'Falling back to browser speech');
console.error('[Audio]', 'Failed to play sound:', error);
```

### 9.2 Error Handling

**Strategy:**
1. Catch and log errors
2. Attempt fallback if available
3. Show user-friendly message if needed
4. Never crash the demo

**Example:**
```typescript
try {
  await CloudTTS.speak(text);
} catch (error) {
  console.warn('[TTS] Cloud TTS failed, using fallback');
  await VoiceNotification.speak(text);
}
```

### 9.3 Monitoring

**Current:** Console logging only

**Future Enhancement:**
- Google Cloud Monitoring integration
- Error tracking (Sentry)
- Analytics (Google Analytics)

---

## 10. Future Considerations

### 10.1 Extensibility Points

- **Scenario System:** Add new demo scenarios via JSON config
- **Voice System:** Swap TTS providers via interface
- **Map Renderer:** Support alternative map providers
- **Theme System:** Support light/dark themes

### 10.2 Technical Debt

| Item | Priority | Effort |
|------|----------|--------|
| Move API key to server proxy | High | Medium |
| Add unit test coverage | Medium | High |
| Extract CSS to stylesheet | Low | Medium |
| Add error boundaries | Medium | Low |

### 10.3 Scalability

Current architecture supports:
- Single-user workstation (current scope)
- Cloud-native deployment (horizontal scaling)
- Static asset caching (CDN-ready)

Future scaling considerations:
- WebSocket for real-time updates
- Backend service integration
- Multi-region deployment
