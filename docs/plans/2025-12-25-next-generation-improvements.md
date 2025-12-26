# ATCS-NG: Next Generation Improvements Design

**Date:** 2025-12-25
**Status:** DRAFT
**Author:** Architecture Team
**Reviewers:** Engineering, Product

---

## Executive Summary

This design addresses critical issues identified in ATCS-NG v2.5.0 and establishes the architecture for the next major iteration. The improvements focus on five key areas:

1. **Timing Consistency** - Demo runs at same speed on all machines
2. **Voice Pacing** - Reduced crosstalk with natural conversation rhythm
3. **Graphics Overhaul** - Level-of-detail system with zoom-dependent rendering
4. **Interactive Visuals** - Reactive effects and cinematic camera choreography
5. **System Observability** - Real-time view of microservice architecture in action

### Key Architectural Change

Transform ATCS-NG from a frontend-only demo to a **real distributed microservices system** that processes simulated aircraft data through production-grade services. The UI gains an observability layer showing message flows, service health, and system internals.

---

## Problem Statement

### Current Issues (from Gemini Feedback & User Testing)

| Issue | Impact | Root Cause |
|-------|--------|------------|
| Demo timing varies by machine | Inconsistent user experience, narration cutoffs | Fixed millisecond `autoAdvance` values |
| Voice crosstalk overwhelming | Users can't process rapid dialogue | No pause management between characters |
| Graphics lack detail | Unimpressive at all zoom levels | Simple cone/SVG models, no LOD |
| Static, flat visuals | Doesn't convey drama of scenarios | No reactive effects or camera work |
| No backend visibility | Can't showcase architecture | Frontend-only simulation |

---

## Solution Architecture

### 1. Audio-Synchronized Timing System

**Problem:** `autoAdvance: 10000` runs at wall-clock time, but TTS audio duration varies by text length, voice speed, and network latency. This causes narration cutoffs or awkward gaps.

**Solution: Event-Driven Timing**

Replace fixed timings with audio completion events:

```typescript
interface DemoStep {
  id: string;
  narrative: string;

  // NEW: Timing configuration
  minDuration?: number;           // Minimum display time (default: 3000ms)
  pauseAfterNarration?: number;   // Silence after audio ends (default: 2000ms)
  maxDuration?: number;           // Safety timeout (default: 30000ms)
  waitForAudio?: boolean;         // If false, skip audio sync (default: true)

  // Existing fields
  atcCommand?: string;
  spotlight?: SpotlightConfig;
  events?: DemoEvent[];
}
```

**Demo Playback Controller:**

```typescript
class DemoPlaybackController {
  private currentStep: DemoStep;
  private audioPlayer: CloudTTS;
  private stepStartTime: number;

  async playStep(step: DemoStep): Promise<void> {
    this.stepStartTime = Date.now();

    // Start narration
    if (step.narrative && step.waitForAudio !== false) {
      const audio = await this.audioPlayer.speak(step.narrative);

      // Wait for audio to complete
      await new Promise(resolve => {
        audio.onended = () => {
          // Add configured pause
          const pause = step.pauseAfterNarration ?? 2000;
          setTimeout(resolve, pause);
        };

        // Safety timeout
        const maxDuration = step.maxDuration ?? 30000;
        setTimeout(resolve, maxDuration);
      });
    }

    // Ensure minimum duration
    const elapsed = Date.now() - this.stepStartTime;
    const minDuration = step.minDuration ?? 3000;
    if (elapsed < minDuration) {
      await sleep(minDuration - elapsed);
    }
  }
}
```

**Benefits:**
- Timing adapts to actual audio playback duration
- Network latency doesn't cause cutoffs
- Consistent pacing across all machines
- Easy to adjust pause durations globally or per-step

---

### 2. Voice Crosstalk Reduction

**Problem:** Rapid character switches (narrator → captain → atc → hijacker) create a wall of sound.

**Solution: Character-Aware Pacing**

**Automatic Pause Insertion:**

```typescript
interface PacingRules {
  sameSpeakerPause: number;      // 800ms - continuing speaker
  characterSwitchPause: number;  // 1500ms - different speaker
  dramaticPause: number;         // 3000ms - after critical moments
  commandTypingPause: number;    // 1000ms - after ATC command display
}

class VoicePacingManager {
  private lastSpeaker: VoiceCharacter | null = null;

  calculatePause(step: DemoStep): number {
    const currentSpeaker = detectCharacter(step.narrative);

    // Character switch pause
    if (this.lastSpeaker && currentSpeaker !== this.lastSpeaker) {
      this.lastSpeaker = currentSpeaker;
      return 1500;
    }

    // Dramatic moment pause (contains MAYDAY, CRITICAL, etc.)
    if (step.emphasize || /MAYDAY|CRITICAL|EMERGENCY/.test(step.narrative)) {
      return 3000;
    }

    // Same speaker continuing
    return 800;
  }
}
```

**Step Classification:**

Add metadata to demo steps:

```typescript
{
  id: 'hijack-captain',
  narrative: 'Captain Sharma: Boston, this is Air India 302...',
  pacing: 'dramatic',  // affects pause calculation
  emphasize: true,     // adds extra pause after
}
```

**Silence = Tension:**

During pauses, show:
- Radar sweep animation
- Aircraft movement
- Alert panel blinking
- Ambient radio static

This creates natural dramatic beats like a well-paced film.

---

### 3. Level of Detail (LOD) System

**Problem:** Aircraft appear the same whether viewed from 100km or 1km away. No visual progression.

**Solution: Zoom-Based Detail Levels**

**LOD Level Definitions:**

| LOD | Distance | 2D Rendering | 3D Rendering | Performance |
|-----|----------|--------------|--------------|-------------|
| 0 | >50km | Colored dot | Point sprite | Instanced (1000+ aircraft) |
| 1 | 10-50km | SVG icon | Simple cone | Current quality |
| 2 | 2-10km | Enhanced SVG | Detailed mesh | Medium detail |
| 3 | <2km | Full detail | GLTF model | High detail |

**LOD Calculation:**

```typescript
function getAircraftLOD(cameraDistance: number): number {
  if (cameraDistance > 50000) return 0;  // >50km
  if (cameraDistance > 10000) return 1;  // 10-50km
  if (cameraDistance > 2000) return 2;   // 2-10km
  return 3;                              // <2km
}
```

**LOD 0 (Far View):**
- Simple colored circles with glow
- Minimal trail line
- No data blocks
- Use WebGL instancing for 1000+ aircraft

**LOD 1 (Sector View - Current Quality):**
- SVG aircraft icon rotated to heading
- Basic cone geometry in 3D
- Data blocks visible
- Trails with fade

**LOD 2 (Close View):**
- Proper aircraft silhouette (fuselage + wings + tail)
- Airline livery colors applied
- Engine glow effects
- Animated control surfaces (ailerons/elevators)
- Wingtip vortices if turning

**LOD 3 (Detail View):**
- High-poly GLTF aircraft model
- Airline livery textures
- Cockpit windows with interior lighting
- Landing gear (animated if alt < 5000ft)
- Beacon lights blinking (red anti-collision, white strobes)
- Contrails at high altitude
- Heat distortion from engines

**3D Model Library:**

```typescript
interface AircraftModel {
  type: AircraftType;  // B777, A380, B738, etc.
  lod2Mesh: THREE.Mesh;  // Medium detail
  lod3Model: string;     // Path to GLTF model
  liveries: {
    [airline: string]: THREE.Texture;  // Airline-specific textures
  };
}
```

Pre-load common aircraft types:
- Boeing: B737, B738, B777, B787
- Airbus: A320, A321, A330, A350, A380
- Others: E175, CRJ, etc.

Lazy load high-detail models only when LOD 3 is needed.

---

### 4. Interactive & Reactive Visuals

**Problem:** Graphics don't respond to scenario events. Hijacking looks the same as normal flight.

**Solution: State-Driven Visual Effects**

**Visual State Mapping:**

```typescript
type VisualState = 'normal' | 'warning' | 'hijacked' | 'hero' | 'hostile' | 'crashed';

interface VisualEffects {
  normal: {
    glow: 'subtle',
    trail: 'green',
    icon: 'white',
  },
  hijacked: {
    glow: 'red-pulse',
    trail: 'red',
    icon: 'red-flash',
    dataCorruption: 0.5,  // Glitch effect
    screenEffect: 'static-overlay',
  },
  hero: {
    glow: 'golden-halo',
    trail: 'gold',
    spotlight: 'camera-follow',
    screenEffect: 'vignette',
  },
  hostile: {
    glow: 'hostile-pulse',
    trail: 'red-dashed',
    icon: 'red-triangle',
    radarEffect: 'uncertainty-cone',
  }
}
```

**Reactive Effects by Event:**

| Event | Visual Effect | Duration |
|-------|---------------|----------|
| Squawk 7500 | Red pulsing border, glitch effect on data | Continuous |
| TCAS RA | Red conflict cone between aircraft | 15 seconds |
| Crash | Particle burst, screen shake, flash | 2 seconds |
| Hero mode active | Golden spotlight, camera auto-track | Until resolved |
| Weather hazard | Lightning flashes, volumetric clouds | Continuous |
| Rapid descent | Red altitude trail, warning rings | While descending |

**Camera Choreography System:**

```typescript
interface CameraShot {
  type: 'follow' | 'orbit' | 'overview' | 'conflict-view' | 'zoom-in';
  target?: string;        // callsign to focus on
  duration: number;       // milliseconds
  easing: EasingFunction; // smooth, dramatic, instant
  fov?: number;           // field of view for zoom
}

class CameraDirector {
  private currentShot: CameraShot | null = null;
  private userControl: boolean = false;  // User can override

  playShot(shot: CameraShot): void {
    if (this.userControl) return;  // Don't interrupt user

    switch (shot.type) {
      case 'follow':
        // Smooth follow behind aircraft
        this.followAircraft(shot.target, shot.duration);
        break;
      case 'orbit':
        // Circle around aircraft
        this.orbitAircraft(shot.target, shot.duration);
        break;
      case 'conflict-view':
        // Frame both aircraft in conflict
        this.frameMultipleTargets([target1, target2]);
        break;
    }
  }
}
```

**Demo Step Camera Directives:**

```typescript
{
  id: 'hijack-begin',
  narrative: 'MAYDAY received from Air India 302...',
  camera: {
    type: 'zoom-in',
    target: 'AIC302',
    duration: 3000,
    fov: 30,  // Tight zoom
  },
  effects: ['screen-flash', 'alert-border'],
}
```

**Environmental Enhancements:**

- **Weather cells**: 3D volumetric clouds with animated lightning
- **Tornado**: Particle vortex with debris field
- **Day/night cycle**: Dynamic lighting, city lights below at night
- **Radar sweep**: Enhanced phosphor trail with bloom post-processing
- **Alert screen flash**: Border pulses with severity color (red/yellow/blue)

---

### 5. Microservices Architecture

**Current State:** Frontend-only demo with simulated data.

**New Architecture:** Real distributed microservices processing demo scenario data.

**Service Catalog:**

| Service | Abbr | Port | Responsibility | Database |
|---------|------|------|----------------|----------|
| Surveillance Tracking | STS | 8001 | Track correlation, filtering | TimescaleDB |
| Flight Data | FDS | 8002 | Flight plans, aircraft metadata | PostgreSQL |
| Safety Service | SS | 8003 | Conflict detection, alerts | PostgreSQL |
| Airspace Service | AS | 8004 | Sector management | PostgreSQL |
| Weather Service | WS | 8005 | Hazard detection | PostgreSQL |
| AI Predictions | AI | 8006 | Trajectory prediction, risk | Redis cache |
| Communications | CS | 8007 | Commands, CPDLC, TTS | PostgreSQL |
| Demo Generator | DEMO | 8008 | Scenario playback engine | - |
| WebSocket Server | WS-API | 8009 | Real-time UI updates | - |

**Message Bus: Apache Kafka**

Topics:
- `tracks` - Aircraft position updates
- `alerts` - Safety alerts
- `predictions` - AI trajectory predictions
- `commands` - ATC commands
- `comms` - Communication messages
- `events` - System events (squawk change, emergency declared, etc.)

**Data Flow:**

```
┌──────────────────┐
│ Demo Generator   │ Reads showcase-demo.ts
│ (Scenario Player)│ Generates position updates
└────────┬─────────┘
         │ Publishes to Kafka: tracks topic
         ↓
┌──────────────────┐
│ STS Service      │ Processes raw positions
│                  │ - Track correlation
│                  │ - Quality checks
│                  │ - Squawk monitoring
└────────┬─────────┘
         │ Publishes TRACK_UPDATE events
         ├─────────────────┐
         ↓                 ↓
┌──────────────┐   ┌──────────────┐
│ SS Service   │   │ AI Service   │
│ - Conflict   │   │ - Trajectory │
│ - Separation │   │ - Risk score │
│ - TCAS       │   │ - ML predict │
└──────┬───────┘   └──────┬───────┘
       │                  │
       │ ALERT_CREATED    │ PREDICTION_UPDATED
       ├──────────────────┘
       ↓
┌──────────────────┐
│ WebSocket Server │ Aggregates all Kafka topics
│                  │ Publishes to UI via WebSocket
└────────┬─────────┘
         ↓
┌──────────────────┐
│ UI Client        │
│ - Radar display  │
│ - Message stream │
│ - Service health │
└──────────────────┘
```

**Key Principle:**

- **REAL services** processing **SIMULATED data**
- All APIs, databases, message flows are production-grade
- Only the aircraft positions are scripted (from demo scenarios)
- Everything downstream is authentic distributed system processing

---

### 6. Observability Panel

**New UI Tab Layout:**

```
┌────────────────────────────────────────────┐
│ [Radar View] [Message Stream] [Services]  │
│              [Event Log] [Metrics]         │
└────────────────────────────────────────────┘
```

**Tab 1: Radar View (Existing)**

Enhanced with:
- LOD rendering
- Reactive visual effects
- Camera choreography
- Zoom detail system

**Tab 2: Message Stream**

Real-time scrolling feed of all system messages:

```
[12:34:01.234] [STS→SS] TRACK_UPDATE
  Flight: AIC302
  Position: 42.3°N, 71.0°W
  Altitude: 39,000ft
  Squawk: 7500 ⚠️
  Tags: [AIC302, hijack, critical]

[12:34:01.456] [SS→UI] ALERT_CREATED
  Type: HIJACK
  Severity: CRITICAL
  Message: "Armed suspect in cockpit"
  Trace ID: hjk-7500-a1b2c3
  Tags: [AIC302, alert, emergency]

[12:34:02.123] [FDS→SS] FLIGHT_INFO
  Flight: AIC302
  Aircraft: Boeing 777-300ER
  Souls: 350
  Operator: Air India
  Tags: [AIC302, enrichment]
```

**Filters:**
- By service: [STS] [FDS] [SS] [AI] [CS]
- By severity: [CRITICAL] [WARNING] [INFO] [DEBUG]
- By tag: Search for "AIC302", "hijack", etc.
- By message type: [REQUEST] [RESPONSE] [EVENT] [ALERT]

**Message Schema:**

```typescript
interface SystemMessage {
  timestamp: number;
  source: ServiceId;
  destination: ServiceId;
  messageType: 'REQUEST' | 'RESPONSE' | 'EVENT' | 'ALERT' | 'COMMAND';
  category: string;  // TRACK_UPDATE, ALERT_CREATED, etc.
  payload: any;
  tags: string[];
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  traceId?: string;  // Distributed tracing
}
```

**Tab 3: Service Health**

Visual service mesh diagram:

```
         STS ─────┐
          │       │
          ↓       ↓
    ┌────FDS     SS─────┐
    │              │     │
    ↓              ↓     ↓
   AI ──────────→ UI ←─ CS
```

Each service shows:
- 🟢 Status (Healthy/Degraded/Down)
- Request rate: "45 req/s"
- Latency: "p95: 12ms"
- Error rate: "0.1%"
- Last activity: "2s ago"

During demo scenarios, metrics react realistically:
- Hijack event: SS load spikes, AI gets busy
- TCAS conflict: Multiple services processing alerts
- Hero mode: CS extremely active with voice commands

**Tab 4: Event Log**

Chronological event timeline with correlation:

```
12:34:01 [CRITICAL] Hijack Alert Created
         ├─ Flight: AIC302
         ├─ Squawk: 7500
         ├─ Souls: 350
         └─ Trace: hjk-7500-a1b2c3
              ├─ [12:34:01.001] STS detected squawk change
              ├─ [12:34:01.023] FDS retrieved flight details
              ├─ [12:34:01.089] SS created alert
              ├─ [12:34:01.102] AI updated risk score
              └─ [12:34:01.234] UI displayed alert panel

12:34:15 [INFO] ATC Command Issued
         ├─ Command: "Turn left heading 180"
         ├─ Target: AIC302
         ├─ Result: ❌ Rejected (hijacker control)
         └─ Trace: cmd-atc-x7y8z9
```

Click an event → highlights all related messages in message stream.

**Tab 5: Metrics Dashboard**

Real-time charts:
- **Message Throughput**: Line chart (msg/sec by service)
- **Alert Distribution**: Pie chart (CRITICAL/WARNING/INFO)
- **Service Latency Heatmap**: p50/p95/p99 by service
- **Active Tracks**: Gauge (aircraft count)
- **TTS Request Rate**: When narration is active

---

### 7. Zoom System Implementation

**Zoom Scale: 0-100**

Map zoom level to camera distance and LOD:

```typescript
interface ZoomLevel {
  zoom: number;        // 0-100
  distance: number;    // Camera distance in meters
  lod: number;         // LOD level to use
  label: string;
}

const ZOOM_LEVELS: ZoomLevel[] = [
  { zoom: 0,   distance: 100000, lod: 0, label: 'Continental' },
  { zoom: 25,  distance: 50000,  lod: 1, label: 'Sector' },
  { zoom: 50,  distance: 10000,  lod: 2, label: 'Close' },
  { zoom: 75,  distance: 2000,   lod: 2, label: 'Detail' },
  { zoom: 90,  distance: 500,    lod: 3, label: 'Cinematic' },
  { zoom: 100, distance: 100,    lod: 3, label: 'Cockpit' },
];
```

**Max Zoom (90-100%) Features:**

When zoom > 90%, activate:

1. **Aircraft Detail:**
   - Full GLTF model with textures
   - Airline livery applied
   - Animated control surfaces responding to flight dynamics
   - Landing gear extension if altitude < 5000ft
   - Beacon lights: red anti-collision (flashing), white strobes
   - Engine heat distortion shader
   - Cockpit windows with interior glow

2. **Environmental Detail:**
   - Cloud layers with volumetric fog
   - Ground terrain with buildings
   - Airport runways and taxiways
   - Other aircraft visible in 3D with correct separation
   - Wake turbulence trails

3. **Data Overlays:**
   - Flight instrument panel overlay:
     - Altimeter
     - Vertical speed indicator
     - Heading indicator
     - Autopilot status (engaged/disengaged/mode)
   - Radio frequency display
   - For hero mode: Optional cockpit interior view

**Smooth Zoom Transitions:**

```typescript
class ZoomController {
  private currentZoom: number = 25;  // Start at sector view

  setZoom(targetZoom: number, duration: number = 1000): void {
    const startZoom = this.currentZoom;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const eased = this.easeInOutCubic(progress);
      this.currentZoom = startZoom + (targetZoom - startZoom) * eased;

      // Update camera and LOD
      this.updateCamera();
      this.updateLOD();

      if (progress < 1) requestAnimationFrame(animate);
    };

    animate();
  }
}
```

---

## Technology Stack

### Backend Services

**Language:** TypeScript (Node.js 20+)
**Frameworks:**
- Express.js or Fastify (REST APIs)
- Socket.io (WebSocket)

**Message Bus:**
- **Apache Kafka** (preferred - high throughput, persistent logs)
- OR **RabbitMQ** (simpler operations, easier local dev)

**Databases:**
- **PostgreSQL 15** with **TimescaleDB** extension (time-series track data)
- **Redis 7** (caching, real-time state, pub/sub)

**Observability:**
- **OpenTelemetry** (distributed tracing, trace IDs)
- **Prometheus** (metrics collection)
- **Grafana** (dashboards)

**Containerization:**
- Docker & Docker Compose (local dev)
- Kubernetes (production)

### Frontend Enhancements

**3D Graphics:**
- Three.js r182
- @react-three/fiber
- @react-three/drei
- GLTF model loader

**WebSocket:**
- Socket.io client

**State Management:**
- Zustand (existing) + new `messageStore`, `metricsStore`

**Charts:**
- Recharts or Chart.js (metrics dashboard)

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Kubernetes Cluster             │
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │   STS   │  │   FDS   │  │   SS    ││
│  │ Service │  │ Service │  │ Service ││
│  └────┬────┘  └────┬────┘  └────┬────┘│
│       │            │            │     │
│       └────────────┴────────────┘     │
│                    │                  │
│            ┌───────▼────────┐         │
│            │  Kafka Cluster │         │
│            └───────┬────────┘         │
│                    │                  │
│       ┌────────────┴────────────┐     │
│       │                         │     │
│  ┌────▼────┐            ┌───────▼──┐ │
│  │   AI    │            │    CS    │ │
│  │ Service │            │  Service │ │
│  └─────────┘            └──────────┘ │
│                                      │
│  ┌──────────────────────────────┐   │
│  │    PostgreSQL + TimescaleDB   │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │          Redis Cache          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Nginx Ingress     │
│   (API Gateway)     │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │  UI Client  │
    │   (React)   │
    └─────────────┘
```

---

## Implementation Plan

### Phase 1: Backend Foundation (2 weeks)

**Week 1:**
- Set up Kafka cluster (or RabbitMQ)
- Create base service template with:
  - Health check endpoint (`/health`)
  - Metrics endpoint (`/metrics`)
  - Logging (structured JSON)
  - OpenTelemetry integration
- Implement STS (Surveillance Tracking Service)
  - Kafka consumer for `tracks` topic
  - Track correlation logic
  - PostgreSQL storage
  - REST API endpoints

**Week 2:**
- Implement Demo Scenario Generator
  - Reads `showcase-demo.ts`
  - Generates position updates at configurable speed
  - Publishes to Kafka `tracks` topic
  - Handles demo play/pause/skip
- Test end-to-end: Generator → Kafka → STS → Database
- Verify position updates flow correctly

### Phase 2: Core Services (2 weeks)

**Week 3:**
- Implement FDS (Flight Data Service)
  - Flight plan database
  - Aircraft metadata (types, airlines)
  - REST API for flight lookups
- Implement SS (Safety Service)
  - Conflict detection algorithm
  - Squawk code monitoring (7500/7600/7700)
  - Alert creation and management
  - Publishes to Kafka `alerts` topic

**Week 4:**
- Implement CS (Communications Service)
  - Command validation
  - Google Cloud TTS integration (move from frontend)
  - CPDLC message handling
- Wire all services to Kafka
- Test multi-service message flows
- Implement WebSocket server for UI updates

### Phase 3: Frontend Integration (2 weeks)

**Week 5:**
- Add WebSocket connection to UI
  - Subscribe to all Kafka topics
  - Update `messageStore` with incoming messages
- Build observability panel components:
  - `<MessageStreamPanel />` - Scrolling message feed
  - `<ServiceHealthPanel />` - Service mesh visualization
  - `<EventLogPanel />` - Event timeline
  - `<MetricsDashboard />` - Charts
- Implement tab layout for main view
- Test with showcase-demo scenario

**Week 6:**
- Integrate real backend APIs
  - Replace simulated track data with WebSocket stream
  - Connect alert system to SS service
  - Use CS service for TTS
- Implement audio-synchronized timing system
  - `DemoPlaybackController`
  - Audio completion event handling
  - Configurable pause durations
- Test timing consistency across machines

### Phase 4: Advanced Graphics (2 weeks)

**Week 7:**
- Implement LOD system
  - LOD level calculation based on distance
  - Instanced rendering for LOD 0
  - Create LOD 2 detailed meshes
- Build 3D aircraft models:
  - Generic models for common types (B737, A320, B777, A380)
  - Airline livery color system
- Implement reactive visual effects
  - State-based effects (hijacked, hero, hostile)
  - Particle systems (crash, explosions)
  - Screen effects (shake, flash, vignette)

**Week 8:**
- Create high-detail GLTF models (LOD 3)
  - Textured fuselage with airline logos
  - Cockpit details, windows
  - Animated landing gear
  - Beacon lights
- Implement camera choreography system
  - `CameraDirector` class
  - Shot types: follow, orbit, overview, conflict-view
  - Smooth transitions with easing
- Add environmental effects
  - Volumetric clouds
  - Weather visualization
  - Day/night lighting

### Phase 5: Polish & Deployment (1 week)

**Week 9:**
- Voice pacing improvements
  - Character detection and pause insertion
  - Dramatic pause configuration
  - Silence visualization
- Zoom system refinement
  - Smooth zoom transitions
  - Detail overlay at max zoom
  - Performance optimization for LOD 3
- Performance testing
  - 60fps with 50+ aircraft
  - Memory profiling
  - WebGL optimization

**Week 10:**
- Containerize all services (Dockerfiles)
- Create Kubernetes manifests
- Set up monitoring (Prometheus + Grafana)
- Write operations documentation
- Conduct end-to-end testing
- Deploy to production environment

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Demo timing consistency | Varies ±30% | ±5% across machines | Test on 3 different machines |
| Voice overlap incidents | 8-10 per demo | 0 | Manual testing |
| Frame rate (50 aircraft) | 60fps | 60fps | Performance profiler |
| Max zoom detail level | Simple cone | GLTF model | Visual inspection |
| Backend service count | 0 | 7+ | Service catalog |
| Message throughput | 0 | 500+ msg/sec | Kafka metrics |
| Service latency (p95) | N/A | <50ms | Prometheus |

---

## Open Questions

1. **Message Bus Choice:** Kafka vs RabbitMQ?
   - Kafka: Better for high throughput, replay capability, complex pipelines
   - RabbitMQ: Simpler ops, easier local dev, better for request/reply patterns
   - **Recommendation:** Start with RabbitMQ for faster iteration, migrate to Kafka if needed

2. **GLTF Model Source:** Build custom or use existing?
   - Custom: Perfect fit, longer development
   - Existing: Free models from Sketchfab, may need modification
   - **Recommendation:** Use existing models initially, enhance with custom liveries

3. **AI Service Implementation:** Real ML or rule-based?
   - Real ML: Impressive but complex, requires training data
   - Rule-based: Faster to implement, predictable behavior
   - **Recommendation:** Start with rule-based algorithms, add ML later

4. **Deployment Target:** Kubernetes or simpler?
   - Kubernetes: Production-grade, complex setup
   - Docker Compose + single VM: Simpler, limited scale
   - **Recommendation:** Docker Compose for MVP, K8s for production

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GLTF models too heavy | Poor performance | Medium | LOD system, lazy loading, model optimization |
| Backend complexity delays | Timeline slip | High | Start with 3 core services (STS, SS, CS), add others later |
| Audio timing still inconsistent | User experience | Low | Extensive cross-browser testing, fallback to fixed timing |
| WebSocket connection issues | Observability broken | Medium | Reconnection logic, fallback to polling |
| Message throughput too high | UI lag | Low | Message throttling, filtering at server |

---

## Future Enhancements (Post-MVP)

- **Real ADS-B Integration:** Connect to live aircraft feeds
- **Multi-user Collaboration:** Multiple controllers in same sector
- **VR/AR Support:** Immersive 3D environment
- **Voice Commands:** User speaks ATC commands
- **Historical Playback:** Replay past scenarios
- **Scenario Editor:** Visual tool to create custom demos
- **Mobile Support:** Tablet/phone optimization
- **Advanced AI:** Real trajectory prediction ML models
- **Performance Metrics:** Track controller performance (separation, alerts handled)

---

## Conclusion

This design transforms ATCS-NG from a frontend demo into a comprehensive system showcasing modern air traffic control architecture. The combination of:

1. Audio-synchronized timing → Consistent experience
2. Character-aware pacing → Natural conversation flow
3. LOD graphics system → Impressive visuals at all zoom levels
4. Reactive effects → Dramatic scenario visualization
5. Real microservices → Authentic architecture demonstration

Creates a powerful demonstration platform that's both technically impressive and visually engaging. The observability panel adds educational value by showing distributed systems concepts in action.

**Estimated Timeline:** 10 weeks (2.5 months)
**Team Size:** 2-3 engineers
**Priority:** High - Addresses critical user feedback

---

## Appendix A: Message Examples

**Track Update Message:**
```json
{
  "timestamp": 1703523241234,
  "source": "STS",
  "destination": "SS",
  "messageType": "EVENT",
  "category": "TRACK_UPDATE",
  "payload": {
    "trackId": "TRK-SD-001",
    "callsign": "AIC302",
    "position": { "lat": 42.3, "lon": -71.0 },
    "altitude": 39000,
    "heading": 270,
    "speed": 510,
    "squawk": "7500",
    "timestamp": "2025-12-25T12:34:01.234Z"
  },
  "tags": ["AIC302", "hijack", "emergency"],
  "severity": "CRITICAL",
  "traceId": "track-update-a1b2c3"
}
```

**Alert Created Message:**
```json
{
  "timestamp": 1703523241456,
  "source": "SS",
  "destination": "UI",
  "messageType": "ALERT",
  "category": "HIJACK_DETECTED",
  "payload": {
    "alertId": "ALT-HIJACK-01",
    "severity": "CRITICAL",
    "alertType": "EMERGENCY_DECLARED",
    "message": "HIJACKING: AIC302 Boeing 777. 350 souls. Armed suspect in cockpit.",
    "involvedFlights": ["AIC302"],
    "squawkCode": "7500"
  },
  "tags": ["AIC302", "hijack", "alert", "critical"],
  "severity": "CRITICAL",
  "traceId": "track-update-a1b2c3"
}
```

**Conflict Prediction Message:**
```json
{
  "timestamp": 1703523255123,
  "source": "AI",
  "destination": "SS",
  "messageType": "EVENT",
  "category": "CONFLICT_PREDICTED",
  "payload": {
    "predictionId": "PRED-TCAS-01",
    "involvedFlights": ["DAL1892", "AAL445"],
    "probability": 0.97,
    "timeToConflict": 45,
    "conflictType": "LOSS_OF_SEPARATION",
    "recommendation": "IMMEDIATE_SEPARATION_REQUIRED"
  },
  "tags": ["DAL1892", "AAL445", "conflict", "tcas"],
  "severity": "CRITICAL",
  "traceId": "conflict-pred-x7y8z9"
}
```

---

## Appendix B: Database Schemas

**tracks table (TimescaleDB):**
```sql
CREATE TABLE tracks (
  track_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  callsign VARCHAR(10),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  altitude INTEGER,
  heading INTEGER,
  speed INTEGER,
  vertical_rate INTEGER,
  squawk VARCHAR(4),
  confidence DECIMAL(3,2),
  PRIMARY KEY (track_id, timestamp)
);

SELECT create_hypertable('tracks', 'timestamp');
```

**alerts table:**
```sql
CREATE TABLE alerts (
  alert_id VARCHAR(50) PRIMARY KEY,
  severity VARCHAR(20) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  involved_flights TEXT[],
  sector_id VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

**flights table:**
```sql
CREATE TABLE flights (
  flight_id VARCHAR(50) PRIMARY KEY,
  callsign VARCHAR(10) UNIQUE NOT NULL,
  airline VARCHAR(10),
  aircraft_type VARCHAR(10),
  departure VARCHAR(4),
  destination VARCHAR(4),
  souls INTEGER,
  filed_altitude INTEGER,
  filed_route TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

**End of Design Document**
