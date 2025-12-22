# PRD: ATCS-NG UI Client

**Status:** APPROVED
**Author:** Manav Agarwal
**Date:** 2025-12-22
**Version:** 2.5.0
**Reviewers:** Engineering Team
**Approvers:** Product Owner

---

## 1. Problem Statement

### 1.1 Background

Air Traffic Control (ATC) is one of the most safety-critical systems in the world, managing millions of flights annually. Modern ATC systems require sophisticated user interfaces that can:
- Display real-time aircraft positions and flight data
- Provide immediate alerts for potential conflicts
- Support rapid decision-making under pressure
- Integrate voice and data communications

The ATCS-NG (Air Traffic Control System - Next Generation) project aims to demonstrate a modern, cloud-native approach to ATC system design with a focus on the controller workstation interface.

### 1.2 Problem

Current ATC system demonstrations lack:
1. **Immersive Demo Experience**: Stakeholders cannot visualize real ATC operations
2. **International Authenticity**: Multi-carrier scenarios lack appropriate accents/voices
3. **Interactive Engagement**: Passive demonstrations don't showcase system responsiveness
4. **Modern UX**: Legacy system UIs don't reflect modern design capabilities

### 1.3 Impact

| Stakeholder | Impact |
|-------------|--------|
| Customers | Unable to assess system capabilities before purchase |
| Sales Team | Difficulty demonstrating competitive advantages |
| Training | No realistic training environment for new controllers |
| Development | No showcase for technical innovations |

---

## 2. Goals & Non-Goals

### 2.1 Goals

- [x] **G1**: Provide real-time radar display with aircraft tracks, data blocks, and trails
- [x] **G2**: Implement comprehensive alert system with audio/visual notifications
- [x] **G3**: Create immersive demo mode with voice narration and scripted scenarios
- [x] **G4**: Support multiple international airline accents using Cloud TTS
- [x] **G5**: Enable interactive "Hero Mode" where users can guide aircraft
- [x] **G6**: Display version information for deployment verification

### 2.2 Non-Goals

- **NG1**: Real FAA/ICAO certification - This is a demonstration system
- **NG2**: Integration with real ADS-B data sources - Uses simulated data
- **NG3**: Multi-user collaboration - Single-controller workstation only
- **NG4**: Offline operation - Requires network connectivity for TTS

---

## 3. User Stories

### 3.1 Primary Persona: Air Traffic Controller (Demo User)

**As a** demo viewer
**I want** to see a realistic ATC interface in action
**So that** I can understand the system's capabilities

**Acceptance Criteria:**
- [x] Aircraft appear as blips on radar display with data blocks
- [x] Conflicts trigger visible and audible alerts
- [x] Voice narration explains each scenario
- [x] Demo completes in approximately 5 minutes

### 3.2 Secondary Persona: Technical Evaluator

**As a** technical evaluator
**I want** to interact with the system during the demo
**So that** I can assess responsiveness and usability

**Acceptance Criteria:**
- [x] Can click on aircraft to see detailed information
- [x] Can send commands to aircraft during Hero Mode
- [x] Can pause/skip demo sections
- [x] System responds within 100ms to interactions

### 3.3 Tertiary Persona: Sales Representative

**As a** sales representative
**I want** to quickly start a polished demo
**So that** I can impress potential customers

**Acceptance Criteria:**
- [x] Demo starts with one click
- [x] No technical setup required
- [x] Professional voice quality throughout
- [x] Version visible for troubleshooting

---

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | Display aircraft positions on 2D radar map | P0 | Complete |
| FR-002 | Show flight data blocks (callsign, altitude, speed, heading) | P0 | Complete |
| FR-003 | Display aircraft trails showing recent path | P1 | Complete |
| FR-004 | Generate and display conflict alerts | P0 | Complete |
| FR-005 | Play audio notifications for alerts | P0 | Complete |
| FR-006 | Voice narration for demo mode | P0 | Complete |
| FR-007 | Multi-accent voice synthesis (Indian, Australian, British, Norwegian) | P1 | Complete |
| FR-008 | Interactive Hero Mode with command buttons | P1 | Complete |
| FR-009 | Demo mode with scripted scenarios | P0 | Complete |
| FR-010 | Live mode with continuous simulation | P1 | Complete |
| FR-011 | Flight detail panel with command modal | P1 | Complete |
| FR-012 | Command log panel showing ATC commands | P2 | Complete |
| FR-013 | Status bar with connection status and version | P2 | Complete |
| FR-014 | 3D radar view toggle | P2 | Complete |

### 4.2 Non-Functional Requirements

| ID | Category | Requirement | Target | Status |
|----|----------|-------------|--------|--------|
| NFR-001 | Performance | Initial load time | < 3 seconds | Complete |
| NFR-002 | Performance | Render 50+ aircraft at 60fps | Smooth animation | Complete |
| NFR-003 | Performance | Command response latency | < 100ms | Complete |
| NFR-004 | Reliability | Demo completion rate | > 99% | Complete |
| NFR-005 | Reliability | TTS fallback on API failure | Browser fallback | Complete |
| NFR-006 | Compatibility | Chrome, Firefox, Safari support | Latest 2 versions | Complete |
| NFR-007 | Accessibility | Keyboard navigation | Basic support | Partial |
| NFR-008 | Security | API key protection | Server-side proxy | Partial |

---

## 5. Success Metrics

| Metric | Baseline | Target | Current | Measurement |
|--------|----------|--------|---------|-------------|
| Demo completion rate | N/A | > 95% | TBD | Analytics |
| User engagement (interactions) | N/A | > 10 per demo | TBD | Analytics |
| TTS success rate | 0% | > 95% | ~98% | Error logs |
| Page load time | N/A | < 3s | ~2.5s | Lighthouse |
| Lighthouse Performance | N/A | > 80 | TBD | Lighthouse |

---

## 6. Feature Specifications

### 6.1 Demo Mode

**Overview:**
Automated showcase demonstrating system capabilities through scripted scenarios.

**Scenarios:**

| # | Scenario | Duration | Key Features Demonstrated |
|---|----------|----------|--------------------------|
| 1 | System Introduction | ~30s | UI overview, radar display |
| 2 | Normal Operations | ~45s | Traffic flow, data blocks |
| 3 | Air India Hijack | ~90s | Emergency alerts, international voices, translation |
| 4 | Emirates Crash | ~45s | Collision detection, crash animation |
| 5 | Hero Mode (Qantas) | ~120s | Interactive commands, user engagement |
| 6 | Resolution | ~30s | System recovery, wrap-up |

**Voice Configuration:**

| Character | Voice | Accent | Purpose |
|-----------|-------|--------|---------|
| Narrator | en-US-Chirp3-HD-Achernar | American | System explanation |
| ATC Boston | en-US-Chirp3-HD-Fenrir | American | Controller commands |
| Captain Sharma | en-IN-Chirp3-HD-Charon | Indian | Air India pilot |
| Captain Williams | en-AU-Chirp3-HD-Puck | Australian | Qantas pilot |
| Norwegian Hijacker | no-NO-Chirp3-HD-Kore | Norwegian | Dramatic tension |

### 6.2 Hero Mode

**Overview:**
Interactive segment where user takes control as ATC to guide distressed aircraft.

**Controls:**
- Heading: LEFT 10°, LEFT 30°, RIGHT 10°, RIGHT 30°
- Altitude: CLIMB 1000, CLIMB 5000, DESCEND 1000, DESCEND 5000
- Speed: SLOW 180kt, APPROACH 160kt, LAND

**Success Criteria:**
- Heading within ±10° of runway heading
- Altitude below 3,000 ft
- Speed under 180 kt
- Distance within 5nm of runway

### 6.3 Alert System

**Alert Types:**

| Type | Severity | Color | Sound | Voice |
|------|----------|-------|-------|-------|
| TCAS (Near Miss) | CRITICAL | Red | Alarm | Yes |
| Conflict Prediction | WARNING | Amber | Chime | Yes |
| Weather Hazard | WARNING | Yellow | Tone | Yes |
| Squawk 7700 | CRITICAL | Red | Alarm | Yes |
| Handoff Request | INFO | Blue | Ding | No |

**Alert Lifecycle:**
1. Detection → Alert generated
2. Display → Visual + Audio notification
3. Acknowledge → User clicks ACK button
4. Resolve → Alert cleared or escalated

---

## 7. Technical Architecture

### 7.1 Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Client                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   RadarMap   │  │  AlertPanel  │  │ FlightStrips │          │
│  │  (Leaflet)   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ DemoProvider │  │   CloudTTS   │  │  AudioMgr    │          │
│  │  (Context)   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │              Zustand State Store                  │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
├──────────────────────┬──────────────────────────────────────────┤
│  Google Cloud TTS    │  API Gateway (Future)                    │
│  texttospeech.v1     │  Backend Services                        │
└──────────────────────┴──────────────────────────────────────────┘
```

### 7.2 Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 19 | UI components |
| Build | Vite 7 | Fast development/build |
| State | Zustand | Global state management |
| Mapping | Leaflet + React-Leaflet | 2D radar display |
| 3D | Three.js + React Three Fiber | 3D radar view |
| Animation | Framer Motion | Smooth transitions |
| Audio | Howler.js | Sound effects |
| TTS | Google Cloud TTS API | Voice synthesis |
| Styling | CSS-in-JS (inline) | Component styling |

---

## 8. Timeline & Milestones

| Milestone | Date | Status |
|-----------|------|--------|
| Initial UI Implementation | 2025-12-15 | Complete |
| Demo Mode v1 | 2025-12-19 | Complete |
| Cloud TTS Integration | 2025-12-21 | Complete |
| Hero Mode | 2025-12-21 | Complete |
| Bug Fixes & Polish | 2025-12-22 | Complete |
| Version 2.5.0 Release | 2025-12-22 | Complete |
| CI/CD Setup | 2025-12-22 | Complete |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| TTS API key exposure | Medium | High | Embedded key with API restrictions | Mitigated |
| TTS service unavailable | Low | Medium | Browser fallback implemented | Mitigated |
| Demo timing issues | Medium | Medium | Fallback timers added | Mitigated |
| Dual voice overlap | Medium | Medium | Demo mode check added | Resolved |
| Browser compatibility | Low | Medium | Tested on major browsers | Tested |

---

## 10. Dependencies

### 10.1 External Services

| Service | Purpose | Fallback |
|---------|---------|----------|
| Google Cloud TTS | Voice synthesis | Browser SpeechSynthesis |
| Google Fonts | Typography | System fonts |
| OpenStreetMap | Map tiles | Cached tiles |

### 10.2 Internal Dependencies

| Component | Dependency |
|-----------|------------|
| Demo Mode | CloudTTS, AudioManager |
| Alert Panel | VoiceNotification, AudioManager |
| Hero Mode | CloudTTS, DemoProvider |

---

## 11. Future Enhancements

### 11.1 Phase 2 (Planned)

- [ ] Backend API integration for real-time data
- [ ] Multi-language UI localization
- [ ] Keyboard shortcuts for power users
- [ ] Offline mode with cached demo
- [ ] Analytics dashboard for demo metrics

### 11.2 Phase 3 (Considered)

- [ ] VR/AR support for immersive training
- [ ] Multi-controller collaboration
- [ ] Real ADS-B data integration (non-production)
- [ ] AI-powered conflict prediction visualization

---

## 12. Appendix

### 12.1 Glossary

| Term | Definition |
|------|------------|
| ADS-B | Automatic Dependent Surveillance-Broadcast |
| ATC | Air Traffic Control |
| CPDLC | Controller-Pilot Data Link Communications |
| FL | Flight Level (altitude in hundreds of feet) |
| TCAS | Traffic Collision Avoidance System |
| TTS | Text-to-Speech |
| Squawk | Transponder code |

### 12.2 References

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [FAA ATC Procedures](https://www.faa.gov/air_traffic/publications)
- [ICAO Standards](https://www.icao.int/safety/airnavigation)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

### 12.3 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-12-19 | Initial demo mode |
| 2.4.0 | 2025-12-21 | Cloud TTS integration |
| 2.5.0 | 2025-12-22 | Bug fixes, version display, CI/CD |
