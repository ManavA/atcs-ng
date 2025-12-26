# Design Document

<div align="center">

![hanaML](hanaML-Template-7C3AED.png)

**ATCS-NG: Next Generation Air Traffic Control System**

| Document ID | Version | Status | Classification |
|-------------|---------|--------|----------------|
| DD-ATCS-2024-001 | 2.5.0 | Approved | Internal |

| Author | Reviewers | Approvers |
|--------|-----------|-----------|
| Engineering Team | Architecture, Security, Product | VP Engineering, CTO |

| Created | Last Updated | Review Cycle |
|---------|--------------|--------------|
| 2024-10-01 | 2024-12-22 | Bi-weekly during development |

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Background & Context](#2-background--context)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [System Architecture](#4-system-architecture)
5. [Detailed Design](#5-detailed-design)
6. [Data Models](#6-data-models)
7. [API Design](#7-api-design)
8. [UI/UX Design](#8-uiux-design)
9. [Security Considerations](#9-security-considerations)
10. [Performance Considerations](#10-performance-considerations)
11. [Reliability & Monitoring](#11-reliability--monitoring)
12. [Testing Strategy](#12-testing-strategy)
13. [Rollout Plan](#13-rollout-plan)
14. [Alternatives Considered](#14-alternatives-considered)
15. [Open Questions](#15-open-questions)
16. [Appendix](#16-appendix)

---

## 1. Overview

### 1.1 Executive Summary

ATCS-NG is an AI-augmented air traffic control interface designed to enhance controller decision-making through predictive analytics, automated conflict detection, and immersive crisis simulation capabilities. This design document describes the technical architecture, component interactions, and implementation details for version 2.5.0.

### 1.2 System Context

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM CONTEXT DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                                 ┌─────────────────┐                                  │
│                                 │   CONTROLLERS   │                                  │
│                                 │  (Human Users)  │                                  │
│                                 └────────┬────────┘                                  │
│                                          │                                           │
│                                          │ HTTPS                                     │
│                                          ▼                                           │
│    ┌──────────────┐            ┌─────────────────────┐            ┌──────────────┐  │
│    │   WEATHER    │            │                     │            │   EXTERNAL   │  │
│    │   SERVICES   │───────────►│     ATCS-NG UI      │◄───────────│   SENSORS    │  │
│    │    (APIs)    │            │                     │            │   (Simulated)│  │
│    └──────────────┘            │  ┌───────────────┐  │            └──────────────┘  │
│                                │  │ React SPA     │  │                              │
│    ┌──────────────┐            │  │ + Three.js    │  │            ┌──────────────┐  │
│    │   GOOGLE     │            │  │ + Cloud TTS   │  │            │   NORAD      │  │
│    │ CLOUD TTS    │◄───────────│  └───────────────┘  │───────────►│   (Notified) │  │
│    │    (API)     │            │                     │            │   (Simulated)│  │
│    └──────────────┘            └──────────┬──────────┘            └──────────────┘  │
│                                           │                                          │
│                                           │ REST/WebSocket                           │
│                                           ▼                                          │
│                                ┌─────────────────────┐                              │
│                                │    API GATEWAY      │                              │
│                                │   (Cloud Run)       │                              │
│                                └──────────┬──────────┘                              │
│                                           │                                          │
│                    ┌──────────────────────┼──────────────────────┐                  │
│                    │                      │                      │                   │
│                    ▼                      ▼                      ▼                   │
│           ┌──────────────┐       ┌──────────────┐       ┌──────────────┐            │
│           │ FLIGHT DATA  │       │  AI SERVICE  │       │   WEATHER    │            │
│           │   SERVICE    │       │ (Predictions)│       │   SERVICE    │            │
│           └──────┬───────┘       └──────────────┘       └──────────────┘            │
│                  │                                                                   │
│                  ▼                                                                   │
│           ┌──────────────┐                                                          │
│           │  CLOUD SQL   │                                                          │
│           │ (PostgreSQL) │                                                          │
│           └──────────────┘                                                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Features (v2.5.0)

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Crisis Showcase Demo | 6+ scenarios with guided narration | React + DemoProvider |
| Cloud TTS Integration | Multi-accent voice synthesis | Google Cloud TTS API |
| Hero Mode | Emergency guidance for incapacitated crew | Guided UI overlay |
| ATC Command Display | "YOU:" typing effect with voice | ATCCommandDisplay component |
| 3D Visualization | Three.js-based 3D scene | React Three Fiber |
| Autopilot Tracking | Shows AP status per aircraft | Track data model |

---

## 2. Background & Context

### 2.1 Problem Statement

Modern ATC systems face critical challenges that ATCS-NG addresses:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            PROBLEM ANALYSIS                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   CURRENT STATE                        DESIRED STATE                                 │
│   ─────────────                        ─────────────                                 │
│                                                                                      │
│   ┌─────────────────────────┐          ┌─────────────────────────┐                  │
│   │ REACTIVE                │          │ PREDICTIVE              │                  │
│   │ ───────────────────────│          │ ───────────────────────│                  │
│   │ • Detect conflicts     │   ──►    │ • Predict conflicts     │                  │
│   │   after they occur     │          │   45+ seconds ahead     │                  │
│   │ • Manual vigilance     │          │ • AI-powered alerts     │                  │
│   │ • Limited automation   │          │ • Automated suggestions │                  │
│   └─────────────────────────┘          └─────────────────────────┘                  │
│                                                                                      │
│   ┌─────────────────────────┐          ┌─────────────────────────┐                  │
│   │ TEXT-BASED              │          │ VISUAL/IMMERSIVE        │                  │
│   │ ───────────────────────│          │ ───────────────────────│                  │
│   │ • 2D radar only        │   ──►    │ • 2D + 3D views         │                  │
│   │ • Paper flight strips  │          │ • Digital flight strips │                  │
│   │ • Limited context      │          │ • Rich data overlays    │                  │
│   └─────────────────────────┘          └─────────────────────────┘                  │
│                                                                                      │
│   ┌─────────────────────────┐          ┌─────────────────────────┐                  │
│   │ VOICE-ONLY COMMS        │          │ MULTI-MODAL COMMS       │                  │
│   │ ───────────────────────│          │ ───────────────────────│                  │
│   │ • Accent confusion     │   ──►    │ • Cloud TTS accents     │                  │
│   │ • No transcription     │          │ • Command logging       │                  │
│   │ • Memory-based         │          │ • Visual confirmation   │                  │
│   └─────────────────────────┘          └─────────────────────────┘                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Prior Art & Lessons Learned

| System | Strengths | Weaknesses | ATCS-NG Approach |
|--------|-----------|------------|------------------|
| STARS (FAA) | Proven, certified | Dated UI, no AI | Modern UI + AI predictions |
| CPDLC | Digital messaging | Text-only | Voice synthesis + visual |
| FlightRadar24 | Great visualization | Consumer-focused | Professional ATC focus |

---

## 3. Goals & Non-Goals

### 3.1 Goals

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               GOAL FRAMEWORK                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  G1: IMMERSIVE DEMONSTRATION                                         PRIORITY: P0   │
│  ──────────────────────────────                                                      │
│  │                                                                                   │
│  ├── Objective: Create compelling crisis simulations that showcase AI capabilities  │
│  ├── Key Result: Demo completion rate > 90%                                         │
│  ├── Key Result: Users progress to Live Mode > 60%                                  │
│  └── Measure: Session analytics, user surveys                                       │
│                                                                                      │
│  G2: AI-AUGMENTED SAFETY                                              PRIORITY: P0   │
│  ─────────────────────────                                                           │
│  │                                                                                   │
│  ├── Objective: Predict conflicts before they become critical                       │
│  ├── Key Result: Conflict prediction accuracy > 95%                                 │
│  ├── Key Result: False positive rate < 5%                                           │
│  └── Measure: Prediction validation against simulated outcomes                      │
│                                                                                      │
│  G3: ACCESSIBLE VOICE SYNTHESIS                                       PRIORITY: P0   │
│  ────────────────────────────                                                        │
│  │                                                                                   │
│  ├── Objective: Clear multi-accent voice for international communications           │
│  ├── Key Result: Voice comprehension rating > 4/5                                   │
│  ├── Key Result: TTS success rate > 95%                                             │
│  └── Measure: A/B testing, user feedback                                            │
│                                                                                      │
│  G4: EMERGENCY GUIDANCE                                               PRIORITY: P1   │
│  ─────────────────────                                                               │
│  │                                                                                   │
│  ├── Objective: Guide untrained users through emergency procedures                  │
│  ├── Key Result: Hero Mode completion rate > 80%                                    │
│  ├── Key Result: Instruction compliance > 95%                                       │
│  └── Measure: Scenario completion tracking                                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Replace human controllers | Augmentation philosophy |
| FAA certification | Demonstration/training focus |
| Real flight data integration | Privacy, security, liability |
| Offline functionality | Cloud-first architecture |
| Mobile app | Desktop-optimized experience |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           HIGH-LEVEL ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           PRESENTATION LAYER                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         ATCS-NG UI Client                                │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │  │
│  │  │  │  Radar   │ │  3D      │ │  Flight  │ │  Alert   │ │  Demo    │       │  │  │
│  │  │  │  Map     │ │  Scene   │ │  Strips  │ │  Panel   │ │  System  │       │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │  │  │
│  │  │                                                                          │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │  │
│  │  │  │ Hero     │ │  ATC     │ │  Weather │ │  Sector  │ │ Command  │       │  │  │
│  │  │  │ Mode     │ │  Display │ │  Widget  │ │  Stats   │ │  Log     │       │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                           │
│                                          │ REST API / WebSocket                      │
│                                          ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           APPLICATION LAYER                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          API Gateway                                     │  │  │
│  │  │                       (Cloud Run - Node.js)                              │  │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │  │
│  │  │  │  Routing   │  │   Auth     │  │  Rate      │  │  Logging   │        │  │  │
│  │  │  │            │  │   (JWT)    │  │  Limiting  │  │            │        │  │  │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                           │
│                    ┌─────────────────────┼─────────────────────┐                    │
│                    │                     │                     │                     │
│                    ▼                     ▼                     ▼                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                            SERVICE LAYER                                       │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐               │  │
│  │  │  Flight Data     │ │    AI Service    │ │  Weather Service │               │  │
│  │  │    Service       │ │                  │ │                  │               │  │
│  │  │  ┌────────────┐  │ │  ┌────────────┐  │ │  ┌────────────┐  │               │  │
│  │  │  │ Track Mgmt │  │ │  │ Conflict   │  │ │  │ Data Fetch │  │               │  │
│  │  │  │ History    │  │ │  │ Prediction │  │ │  │ Caching    │  │               │  │
│  │  │  │ Simulation │  │ │  │ ML Models  │  │ │  │ Alerts     │  │               │  │
│  │  │  └────────────┘  │ │  └────────────┘  │ │  └────────────┘  │               │  │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                           │
│                                          ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                             DATA LAYER                                         │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐               │  │
│  │  │    Cloud SQL     │ │  Cloud Storage   │ │   Redis Cache    │               │  │
│  │  │   (PostgreSQL)   │ │  (Static Assets) │ │  (Coming Soon)   │               │  │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                          EXTERNAL SERVICES                                     │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐               │  │
│  │  │  Google Cloud    │ │  Weather APIs    │ │  Monitoring      │               │  │
│  │  │  Text-to-Speech  │ │  (OpenWeather)   │ │  (Cloud Logging) │               │  │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT INTERACTION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              DEMO SCENARIO FLOW                                      │
│                              ──────────────────                                      │
│                                                                                      │
│  ┌─────────┐                                                        ┌─────────┐    │
│  │  User   │                                                        │ Cloud   │    │
│  │         │                                                        │  TTS    │    │
│  └────┬────┘                                                        └────┬────┘    │
│       │                                                                  │          │
│       │ 1. Click "Crisis Showcase"                                       │          │
│       │────────────────────────────►┌──────────────┐                    │          │
│       │                             │ DemoProvider │                    │          │
│       │                             └──────┬───────┘                    │          │
│       │                                    │                             │          │
│       │                        2. Dispatch START_SCENARIO                │          │
│       │                                    │                             │          │
│       │                                    ▼                             │          │
│       │                             ┌──────────────┐                    │          │
│       │                             │DemoController│                    │          │
│       │                             │  (Reducer)   │                    │          │
│       │                             └──────┬───────┘                    │          │
│       │                                    │                             │          │
│       │              3. Set mode='playing', load scenario                │          │
│       │                                    │                             │          │
│       │                                    ▼                             │          │
│       │  ┌────────────────────────────────────────────────────────┐    │          │
│       │  │                   PARALLEL UPDATES                      │    │          │
│       │  ├────────────────────────────────────────────────────────┤    │          │
│       │  │                                                         │    │          │
│       │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │    │          │
│       │  │  │  Radar    │  │  Alert    │  │ Narrator  │           │    │          │
│       │  │  │  Map      │  │  Panel    │  │  Panel    │           │    │          │
│       │  │  │           │  │           │  │           │           │    │          │
│       │  │  │ 4a. Show  │  │ 4b. Show  │  │ 4c. Show  │           │    │          │
│       │  │  │   tracks  │  │   alerts  │  │ narrative │           │    │          │
│       │  │  └───────────┘  └───────────┘  └─────┬─────┘           │    │          │
│       │  │                                      │                  │    │          │
│       │  └──────────────────────────────────────┼──────────────────┘    │          │
│       │                                         │                       │          │
│       │                           5. Request TTS for narrative          │          │
│       │                                         │───────────────────────►│          │
│       │                                         │                       │          │
│       │                           6. Return audio stream                │          │
│       │                                         │◄───────────────────────│          │
│       │                                         │                       │          │
│       │                                         ▼                       │          │
│       │                             ┌───────────────────┐               │          │
│       │                             │ ATCCommandDisplay │               │          │
│       │                             │                   │               │          │
│       │                             │ 7. Show "YOU:"    │               │          │
│       │                             │    typing effect  │               │          │
│       │                             └─────────┬─────────┘               │          │
│       │                                       │                         │          │
│       │                         8. Speak ATC command                    │          │
│       │                                       │─────────────────────────►│          │
│       │                                       │                         │          │
│       │ 9. Audio plays, visuals update        │                         │          │
│       │◄──────────────────────────────────────┘                         │          │
│       │                                                                  │          │
│       │                         10. Auto-advance to next step            │          │
│       │                              (after TTS completes)               │          │
│       │                                                                  │          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 UI Client Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           UI CLIENT ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              APP SHELL                                         │  │
│  │                                                                                │  │
│  │   ┌─────────────────────────────────────────────────────────────────────┐     │  │
│  │   │                         PROVIDERS                                    │     │  │
│  │   │                                                                      │     │  │
│  │   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │     │  │
│  │   │  │  DemoProvider    │  │   UIStore        │  │  QueryClient     │  │     │  │
│  │   │  │  ───────────────│  │  ─────────────── │  │  ───────────────│  │     │  │
│  │   │  │  • Demo state    │  │  • View mode     │  │  • API caching   │  │     │  │
│  │   │  │  • Scenario data │  │  • Hero mode     │  │  • Refetching    │  │     │  │
│  │   │  │  • Step control  │  │  • Preferences   │  │  • Optimistic    │  │     │  │
│  │   │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │     │  │
│  │   │                                                                      │     │  │
│  │   └──────────────────────────────────────────────────────────────────────┘     │  │
│  │                                                                                │  │
│  │   ┌─────────────────────────────────────────────────────────────────────┐     │  │
│  │   │                         LAYOUT                                       │     │  │
│  │   │  ┌─────────────────────────────────────────────────────────────┐    │     │  │
│  │   │  │ Header                                                       │    │     │  │
│  │   │  │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │    │     │  │
│  │   │  │ │  Logo     │ │  Title    │ │  Sector   │ │  Controls │     │    │     │  │
│  │   │  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │    │     │  │
│  │   │  └─────────────────────────────────────────────────────────────┘    │     │  │
│  │   │                                                                      │     │  │
│  │   │  ┌─────────────────────────────────────────────────────────────┐    │     │  │
│  │   │  │ Controls Bar                                                 │    │     │  │
│  │   │  │ ┌────────────┐ ┌────────────┐ ┌────────────┐                │    │     │  │
│  │   │  │ │ViewMode    │ │TimeSlider  │ │Presentation│                │    │     │  │
│  │   │  │ │Toggle      │ │            │ │ModeToggle  │                │    │     │  │
│  │   │  │ └────────────┘ └────────────┘ └────────────┘                │    │     │  │
│  │   │  └─────────────────────────────────────────────────────────────┘    │     │  │
│  │   │                                                                      │     │  │
│  │   │  ┌─────────────────────────────────────────────────────────────┐    │     │  │
│  │   │  │ Main Content (Grid: 320px | 1fr | 360px)                    │    │     │  │
│  │   │  │                                                              │    │     │  │
│  │   │  │ ┌───────────┐ ┌─────────────────────────┐ ┌───────────────┐ │    │     │  │
│  │   │  │ │           │ │                         │ │               │ │    │     │  │
│  │   │  │ │  Flight   │ │     Radar Map           │ │  Alert Panel  │ │    │     │  │
│  │   │  │ │  Strip    │ │        OR               │ │               │ │    │     │  │
│  │   │  │ │  Bay      │ │     3D Scene            │ │───────────────│ │    │     │  │
│  │   │  │ │           │ │                         │ │               │ │    │     │  │
│  │   │  │ │───────────│ │  ┌─────────────────┐    │ │  Prediction   │ │    │     │  │
│  │   │  │ │           │ │  │  Flight Detail  │    │ │  Panel        │ │    │     │  │
│  │   │  │ │  Sector   │ │  │  (Overlay)      │    │ │               │ │    │     │  │
│  │   │  │ │  Stats    │ │  └─────────────────┘    │ │───────────────│ │    │     │  │
│  │   │  │ │           │ │                         │ │               │ │    │     │  │
│  │   │  │ │           │ │                         │ │  Weather      │ │    │     │  │
│  │   │  │ │           │ │                         │ │  Widget       │ │    │     │  │
│  │   │  │ └───────────┘ └─────────────────────────┘ └───────────────┘ │    │     │  │
│  │   │  └─────────────────────────────────────────────────────────────┘    │     │  │
│  │   │                                                                      │     │  │
│  │   │  ┌─────────────────────────────────────────────────────────────┐    │     │  │
│  │   │  │ Status Bar                                                   │    │     │  │
│  │   │  └─────────────────────────────────────────────────────────────┘    │     │  │
│  │   └──────────────────────────────────────────────────────────────────────┘     │  │
│  │                                                                                │  │
│  │   ┌─────────────────────────────────────────────────────────────────────┐     │  │
│  │   │                         OVERLAYS                                     │     │  │
│  │   │                                                                      │     │  │
│  │   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │     │  │
│  │   │  │ Demo Menu    │ │ Narrator     │ │ ATC Command  │ │ Hero Mode  │  │     │  │
│  │   │  │ Modal        │ │ Panel        │ │ Display      │ │ Panel      │  │     │  │
│  │   │  │              │ │              │ │              │ │            │  │     │  │
│  │   │  │ • Scenario   │ │ • Narrative  │ │ • "YOU:" text│ │ • Guidance │  │     │  │
│  │   │  │   selection  │ │ • Controls   │ │ • Typing fx  │ │   steps    │  │     │  │
│  │   │  │ • Live mode  │ │ • Progress   │ │ • TTS speak  │ │ • Actions  │  │     │  │
│  │   │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │     │  │
│  │   │                                                                      │     │  │
│  │   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │     │  │
│  │   │  │ Spotlight    │ │ Screen       │ │ Command      │                 │     │  │
│  │   │  │ Overlay      │ │ Effects      │ │ Log          │                 │     │  │
│  │   │  │              │ │              │ │              │                 │     │  │
│  │   │  │ • Highlights │ │ • Scanlines  │ │ • History    │                 │     │  │
│  │   │  │ • Focus area │ │ • Vignette   │ │ • Commands   │                 │     │  │
│  │   │  └──────────────┘ └──────────────┘ └──────────────┘                 │     │  │
│  │   │                                                                      │     │  │
│  │   └──────────────────────────────────────────────────────────────────────┘     │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 State Management

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           STATE MANAGEMENT ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              STATE STORES                                      │  │
│  │                                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  DEMO STATE (useReducer + Context)                                        │ │  │
│  │  │  ─────────────────────────────────                                        │ │  │
│  │  │                                                                           │ │  │
│  │  │  {                                                                        │ │  │
│  │  │    isActive: boolean,           // Demo system active                     │ │  │
│  │  │    mode: 'menu' | 'playing' | 'paused' | 'completed',                     │ │  │
│  │  │    presenterMode: boolean,      // Manual advance mode                    │ │  │
│  │  │    currentScenario: Scenario | null,                                      │ │  │
│  │  │    currentStepIndex: number,                                              │ │  │
│  │  │    isTourMode: boolean,         // Playing all scenarios                  │ │  │
│  │  │    tourScenarioIndex: number,                                             │ │  │
│  │  │    tracks: Track[],             // Demo track data                        │ │  │
│  │  │    alerts: Alert[],             // Demo alert data                        │ │  │
│  │  │    predictions: Prediction[],   // Demo prediction data                   │ │  │
│  │  │    pendingInteraction: InteractionSpec | null,                            │ │  │
│  │  │    interactionCompleted: boolean                                          │ │  │
│  │  │  }                                                                        │ │  │
│  │  │                                                                           │ │  │
│  │  │  Actions: OPEN_MENU, CLOSE_DEMO, START_SCENARIO, START_TOUR,             │ │  │
│  │  │           NEXT_STEP, PREV_STEP, PAUSE, RESUME, UPDATE_TRACKS,            │ │  │
│  │  │           UPDATE_ALERTS, UPDATE_PREDICTIONS, COMPLETE_INTERACTION        │ │  │
│  │  │                                                                           │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  UI STORE (Zustand)                                                       │ │  │
│  │  │  ─────────────────                                                        │ │  │
│  │  │                                                                           │ │  │
│  │  │  {                                                                        │ │  │
│  │  │    viewMode: '2d' | '3d',       // Current visualization mode            │ │  │
│  │  │    heroModeActive: boolean,     // Hero Mode overlay shown               │ │  │
│  │  │    liveOnly: boolean,           // No demo, live data only               │ │  │
│  │  │    narrationEnabled: boolean,   // TTS enabled                           │ │  │
│  │  │    commandLog: CommandLogEntry[], // History of ATC commands             │ │  │
│  │  │    appMode: 'demo' | 'live'     // Current application mode              │ │  │
│  │  │  }                                                                        │ │  │
│  │  │                                                                           │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              DATA FLOW                                         │  │
│  │                                                                                │  │
│  │    ┌───────────┐        ┌───────────┐        ┌───────────┐                   │  │
│  │    │  Action   │───────►│  Reducer  │───────►│   State   │                   │  │
│  │    │           │        │           │        │           │                   │  │
│  │    └───────────┘        └───────────┘        └─────┬─────┘                   │  │
│  │                                                     │                         │  │
│  │                              ┌──────────────────────┘                         │  │
│  │                              │                                                │  │
│  │                              ▼                                                │  │
│  │    ┌───────────┐        ┌───────────┐        ┌───────────┐                   │  │
│  │    │ Component │◄───────│  Context  │◄───────│ Selector  │                   │  │
│  │    │  (View)   │        │ (useDemoMode)       │           │                   │  │
│  │    └───────────┘        └───────────┘        └───────────┘                   │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Detailed Design

### 5.1 Demo System Design

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEMO SYSTEM DESIGN                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  SCENARIO STRUCTURE                                                                  │
│  ──────────────────                                                                  │
│                                                                                      │
│  Scenario                                                                            │
│  ├── id: string                    // Unique identifier                              │
│  ├── title: string                 // Display name                                   │
│  ├── description: string           // Brief description                              │
│  ├── icon: string                  // Lucide icon name                               │
│  ├── duration: number              // Estimated minutes                              │
│  ├── initialState                                                                    │
│  │   ├── tracks: Track[]           // Starting aircraft positions                    │
│  │   ├── alerts: Alert[]           // Starting alerts                                │
│  │   └── predictions: Prediction[] // Starting predictions                           │
│  └── steps: ScenarioStep[]                                                           │
│                                                                                      │
│  ScenarioStep                                                                        │
│  ├── id: string                    // Step identifier                                │
│  ├── narrative: string             // Text to display and speak                      │
│  ├── atcCommand?: string           // ATC command to type and speak                  │
│  ├── spotlight?: SpotlightTarget   // What to highlight                              │
│  ├── autoAdvance?: number          // ms before auto-advancing                       │
│  ├── interaction?: InteractionSpec // Required user action                           │
│  └── events?: ScenarioEvent[]      // Data changes during step                       │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                          DEMO FLOW STATE MACHINE                                │ │
│  │                                                                                 │ │
│  │                            ┌──────────┐                                         │ │
│  │                            │   IDLE   │                                         │ │
│  │                            │isActive: │                                         │ │
│  │                            │  false   │                                         │ │
│  │                            └────┬─────┘                                         │ │
│  │                                 │ OPEN_MENU                                     │ │
│  │                                 ▼                                               │ │
│  │                            ┌──────────┐                                         │ │
│  │            ┌───────────────│   MENU   │◄──────────────┐                         │ │
│  │            │  CLOSE_DEMO   │ mode:    │  SCENARIO     │                         │ │
│  │            │               │  'menu'  │  COMPLETE     │                         │ │
│  │            │               └────┬─────┘               │                         │ │
│  │            │                    │                     │                         │ │
│  │            │                    │ START_SCENARIO      │                         │ │
│  │            │                    │ START_TOUR          │                         │ │
│  │            ▼                    ▼                     │                         │ │
│  │       ┌──────────┐        ┌──────────┐         ┌──────────┐                     │ │
│  │       │  CLOSED  │        │ PLAYING  │◄────────│COMPLETED │                     │ │
│  │       │          │        │ mode:    │  RESUME │ mode:    │                     │ │
│  │       │          │        │'playing' │         │'completed│                     │ │
│  │       └──────────┘        └────┬─────┘         └──────────┘                     │ │
│  │                                 │                    ▲                          │ │
│  │                                 │ PAUSE              │                          │ │
│  │                                 ▼                    │                          │ │
│  │                            ┌──────────┐              │                          │ │
│  │                            │  PAUSED  │──────────────┘                          │ │
│  │                            │ mode:    │    NEXT_STEP (on last step)             │ │
│  │                            │ 'paused' │                                         │ │
│  │                            └──────────┘                                         │ │
│  │                                                                                 │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Cloud TTS Integration

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLOUD TTS INTEGRATION                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  CHARACTER VOICE MAPPING                                                             │
│  ───────────────────────                                                             │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Character          │ Voice ID            │ Language │ Pitch │ Rate       │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  narrator           │ en-US-Chirp3-HD     │ en-US    │ 0     │ 1.0        │    │
│  │  atc                │ en-US-Chirp3-HD     │ en-US    │ -2    │ 1.1 + fx   │    │
│  │  captain_sharma     │ en-IN-Chirp3-HD     │ en-IN    │ -1    │ 0.95       │    │
│  │  fa_priya           │ en-IN-Chirp3-HD     │ en-IN    │ 2     │ 1.0        │    │
│  │  captain_williams   │ en-AU-Chirp3-HD     │ en-AU    │ -1    │ 0.95       │    │
│  │  sarah              │ en-AU-Chirp3-HD     │ en-AU    │ 2     │ 1.1        │    │
│  │  hijacker_norway    │ nb-NO-Chirp3-HD     │ nb-NO    │ -3    │ 0.9        │    │
│  │  hijacker_sweden    │ sv-SE-Chirp3-HD     │ sv-SE    │ -2    │ 0.9        │    │
│  │  british_crew       │ en-GB-Chirp3-HD     │ en-GB    │ 0     │ 1.0        │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  TTS FLOW                                                                            │
│  ────────                                                                            │
│                                                                                      │
│  ┌─────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌─────────┐ │
│  │Narrator │────►│CloudTTS.  │────►│ API Call  │────►│ Audio     │────►│ Play    │ │
│  │ Panel   │     │speak()    │     │ to GCP    │     │ Stream    │     │ Audio   │ │
│  └─────────┘     └───────────┘     └───────────┘     └───────────┘     └─────────┘ │
│                                                                                      │
│  ERROR HANDLING                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                │  │
│  │  CloudTTS.speak() ──► API Error? ──► Yes ──► useBrowserFallback? ──► Yes     │  │
│  │                           │                         │                          │  │
│  │                           No                        No                         │  │
│  │                           │                         │                          │  │
│  │                           ▼                         ▼                          │  │
│  │                      Play audio              Show "Audio not working?"         │  │
│  │                                              button, use fallback timer        │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  RADIO EFFECT (ATC Voice)                                                            │
│  ────────────────────────                                                            │
│                                                                                      │
│  • Static noise overlay (0.02 volume)                                                │
│  • Bandpass filter (300Hz - 3000Hz)                                                  │
│  • Slight compression                                                                │
│  • 100ms squelch sounds (click in/out)                                               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Hero Mode Design

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              HERO MODE DESIGN                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  PURPOSE                                                                             │
│  ───────                                                                             │
│  Hero Mode provides step-by-step guidance for scenarios where an untrained          │
│  passenger must control an aircraft due to crew incapacitation.                      │
│                                                                                      │
│  UI MOCKUP                                                                           │
│  ─────────                                                                           │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                           HERO MODE PANEL                                    │    │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │    │
│  │  │  ╔═════════════════════════════════════════════════════════════════╗  │  │    │
│  │  │  ║  🆘 HERO MODE ACTIVE                           STEP 3 of 8      ║  │  │    │
│  │  │  ╠═════════════════════════════════════════════════════════════════╣  │  │    │
│  │  │  ║                                                                  ║  │  │    │
│  │  │  ║  CURRENT INSTRUCTION:                                           ║  │  │    │
│  │  │  ║  ─────────────────────                                          ║  │  │    │
│  │  │  ║                                                                  ║  │  │    │
│  │  │  ║    📍 Verify the autopilot is ENGAGED                           ║  │  │    │
│  │  │  ║                                                                  ║  │  │    │
│  │  │  ║    Look for a button labeled "AP" or "AUTOPILOT"                ║  │  │    │
│  │  │  ║    with a GREEN light illuminated.                              ║  │  │    │
│  │  │  ║                                                                  ║  │  │    │
│  │  │  ║    ┌─────────────────────────────────────────────────────────┐  ║  │  │    │
│  │  │  ║    │                                                          │  ║  │  │    │
│  │  │  ║    │    [AUTOPILOT]     ← Look for this                      │  ║  │  │    │
│  │  │  ║    │       🟢                                                 │  ║  │  │    │
│  │  │  ║    │                                                          │  ║  │  │    │
│  │  │  ║    └─────────────────────────────────────────────────────────┘  ║  │  │    │
│  │  │  ║                                                                  ║  │  │    │
│  │  │  ╠═════════════════════════════════════════════════════════════════╣  │  │    │
│  │  │  ║  ┌──────────────────┐  ┌──────────────────┐                     ║  │  │    │
│  │  │  ║  │  ✓ CONFIRM AP    │  │  ✗ AP NOT FOUND  │                     ║  │  │    │
│  │  │  ║  │    IS ON         │  │                  │                     ║  │  │    │
│  │  │  ║  └──────────────────┘  └──────────────────┘                     ║  │  │    │
│  │  │  ╠═════════════════════════════════════════════════════════════════╣  │  │    │
│  │  │  ║  AIRCRAFT STATUS:                                                ║  │  │    │
│  │  │  ║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               ║  │  │    │
│  │  │  ║  │ ALT     │ │ HDG     │ │ SPD     │ │ AP      │               ║  │  │    │
│  │  │  ║  │ 35,000  │ │ 180°    │ │ 280 kt  │ │ ENGAGED │               ║  │  │    │
│  │  │  ║  └─────────┘ └─────────┘ └─────────┘ └─────────┘               ║  │  │    │
│  │  │  ╚═════════════════════════════════════════════════════════════════╝  │  │    │
│  │  └───────────────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  STATE MACHINE                                                                       │
│  ─────────────                                                                       │
│                                                                                      │
│  ┌─────────┐    triggerHeroMode    ┌─────────┐    complete    ┌─────────────┐       │
│  │ Inactive│───────────────────────►│ Active  │───────────────►│  Complete   │       │
│  │         │◄───────────────────────│         │               │  (success/  │       │
│  └─────────┘         close          └─────────┘               │   failure)  │       │
│                                          │                     └─────────────┘       │
│                                          │ stepNext                                  │
│                                          ▼                                           │
│                                     ┌─────────┐                                      │
│                                     │ Step N  │                                      │
│                                     └─────────┘                                      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Models

### 6.1 Core Data Types

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA MODELS                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  TRACK (Aircraft Position)                                                           │
│  ─────────────────────────                                                           │
│                                                                                      │
│  interface Track {                                                                   │
│    // Core identification                                                            │
│    trackId: string;              // Unique track identifier (e.g., "TRK-SD-001")    │
│    callsign: string;             // Flight callsign (e.g., "AIC302")                │
│                                                                                      │
│    // Position & movement                                                            │
│    latitudeDeg: number;          // Latitude in degrees                              │
│    longitudeDeg: number;         // Longitude in degrees                             │
│    altitudeFt: number;           // Altitude in feet                                 │
│    headingDeg: number;           // Heading in degrees (0-360)                       │
│    speedKt: number;              // Ground speed in knots                            │
│    verticalRateFpm: number;      // Vertical rate in feet per minute                 │
│                                                                                      │
│    // Quality & metadata                                                             │
│    confidence: number;           // Track confidence (0-1)                           │
│    sequence: number;             // Update sequence number                           │
│    updatedAt: string;            // ISO timestamp                                    │
│                                                                                      │
│    // Aircraft info                                                                  │
│    airline?: string;             // ICAO airline code                                │
│    aircraftType?: string;        // ICAO aircraft type                               │
│    countryCode?: string;         // ISO country code                                 │
│    souls?: number;               // Passengers + crew                                │
│                                                                                      │
│    // Transponder                                                                    │
│    squawkCode?: string;          // Transponder code (7500=hijack, 7700=emergency)  │
│    transponderActive?: boolean;  // Transponder responding                           │
│                                                                                      │
│    // Visual state                                                                   │
│    visualState?: 'normal' | 'hijacked' | 'hero' | 'crashed';                        │
│    dataCorruption?: number;      // Corruption level (0-1)                           │
│                                                                                      │
│    // Autopilot status (v2.5+)                                                       │
│    autopilotStatus?: 'engaged' | 'disengaged' | 'manual' | 'remote_guided';         │
│    autopilotMode?: string;       // 'LNAV', 'VNAV', 'APP', 'HDG', 'AUTOLAND'        │
│                                                                                      │
│    // Emergency status (v2.5+)                                                       │
│    emergencyType?: 'hijack' | 'medical' | 'mechanical' | 'fuel' | 'fire' |          │
│                    'incapacitated_crew';                                             │
│  }                                                                                   │
│                                                                                      │
│  ──────────────────────────────────────────────────────────────────────────────────  │
│                                                                                      │
│  ALERT                                                                               │
│  ─────                                                                               │
│                                                                                      │
│  interface Alert {                                                                   │
│    alertId: string;              // Unique identifier                                │
│    severity: 'CRITICAL' | 'WARNING' | 'INFO';                                       │
│    alertType: 'CONFLICT_PREDICTED' | 'DEVIATION_DETECTED' |                         │
│                'EMERGENCY_DECLARED' | 'WEATHER_HAZARD' | 'LOSS_OF_SEPARATION';      │
│    message: string;              // Human-readable message                           │
│    involvedFlightIds: string[];  // Related flight callsigns                         │
│    sectorId: string;             // Sector identifier                                │
│    timestamp: string;            // ISO timestamp                                    │
│    acknowledged: boolean;        // Acknowledged by controller                       │
│  }                                                                                   │
│                                                                                      │
│  ──────────────────────────────────────────────────────────────────────────────────  │
│                                                                                      │
│  PREDICTION                                                                          │
│  ──────────                                                                          │
│                                                                                      │
│  interface Prediction {                                                              │
│    id: string;                   // Unique identifier                                │
│    predictionType: 'CONFLICT' | 'DEVIATION' | 'WEATHER' | 'FUEL';                   │
│    involvedFlights: string[];    // Flight callsigns                                 │
│    probability: number;          // Confidence (0-1)                                 │
│    predictedTime: string;        // When event will occur                            │
│    description: string;          // Human-readable description                       │
│  }                                                                                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIP DIAGRAM                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────┐                                ┌───────────────────┐         │
│  │      SCENARIO     │                                │      TRACK        │         │
│  ├───────────────────┤                                ├───────────────────┤         │
│  │ id: string [PK]   │                                │ trackId: string   │         │
│  │ title: string     │                                │   [PK]            │         │
│  │ description: str  │                                │ callsign: string  │         │
│  │ icon: string      │                                │ position: coords  │         │
│  │ duration: number  │                                │ velocity: vector  │         │
│  └─────────┬─────────┘                                │ metadata: object  │         │
│            │                                           └─────────┬─────────┘         │
│            │ 1:N                                                 │                   │
│            ▼                                                     │                   │
│  ┌───────────────────┐                                          │                   │
│  │   SCENARIO_STEP   │                                          │                   │
│  ├───────────────────┤                                          │                   │
│  │ id: string [PK]   │                                          │                   │
│  │ scenarioId: FK    │                                          │                   │
│  │ narrative: string │                                          │                   │
│  │ atcCommand: str?  │                                          │                   │
│  │ spotlight: obj?   │                                          │                   │
│  │ autoAdvance: num? │                                          │                   │
│  └─────────┬─────────┘                                          │                   │
│            │                                                     │                   │
│            │ 1:N                                                │ 1:N               │
│            ▼                                                     │                   │
│  ┌───────────────────┐        ┌───────────────────┐             │                   │
│  │  SCENARIO_EVENT   │        │       ALERT       │◄────────────┘                   │
│  ├───────────────────┤        ├───────────────────┤                                 │
│  │ stepId: FK        │        │ alertId: string   │                                 │
│  │ delay: number     │        │   [PK]            │                                 │
│  │ type: EventType   │        │ severity: enum    │                                 │
│  │ payload: object   │        │ alertType: enum   │                                 │
│  └───────────────────┘        │ message: string   │                                 │
│                               │ involvedFlights:  │                                 │
│                               │   string[]        │                                 │
│                               └───────────────────┘                                 │
│                                                                                      │
│  ┌───────────────────┐        ┌───────────────────┐                                 │
│  │    PREDICTION     │        │   COMMAND_LOG     │                                 │
│  ├───────────────────┤        ├───────────────────┤                                 │
│  │ id: string [PK]   │        │ id: string [PK]   │                                 │
│  │ predictionType:   │        │ callsign: string  │                                 │
│  │   enum            │        │ command: string   │                                 │
│  │ involvedFlights:  │        │ type: CommandType │                                 │
│  │   string[]        │        │ timestamp: Date   │                                 │
│  │ probability: num  │        └───────────────────┘                                 │
│  │ predictedTime: ts │                                                              │
│  │ description: str  │                                                              │
│  └───────────────────┘                                                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. API Design

### 7.1 REST API Endpoints

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              REST API ENDPOINTS                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  BASE URL: https://api-gateway-{project}.run.app/api/v1                             │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  TRACKS                                                                      │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  GET  /tracks                    List all tracks in sector                   │    │
│  │       Response: { tracks: Track[], count: number, timestamp: string }        │    │
│  │                                                                              │    │
│  │  GET  /tracks/:trackId           Get single track details                    │    │
│  │       Response: Track                                                        │    │
│  │                                                                              │    │
│  │  GET  /tracks/:trackId/history   Get track position history                  │    │
│  │       Query: ?limit=100&since=timestamp                                      │    │
│  │       Response: { positions: Position[], count: number }                     │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  ALERTS                                                                      │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  GET  /alerts                    List active alerts                          │    │
│  │       Query: ?severity=CRITICAL&acknowledged=false                           │    │
│  │       Response: { alerts: Alert[], count: number }                           │    │
│  │                                                                              │    │
│  │  POST /alerts/:alertId/acknowledge   Acknowledge an alert                    │    │
│  │       Response: { success: boolean }                                         │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  PREDICTIONS                                                                 │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  GET  /predictions               List AI predictions                         │    │
│  │       Query: ?type=CONFLICT&minProbability=0.8                               │    │
│  │       Response: { predictions: Prediction[], count: number }                 │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  TTS (Proxied to Google Cloud TTS)                                           │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  POST /tts/synthesize            Synthesize text to speech                   │    │
│  │       Body: { text: string, voice: string, languageCode: string,            │    │
│  │               speakingRate?: number, pitch?: number }                        │    │
│  │       Response: { audioContent: string } // base64 encoded                   │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 WebSocket Events

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              WEBSOCKET EVENTS                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  CONNECTION: wss://api-gateway-{project}.run.app/ws                                 │
│                                                                                      │
│  CLIENT → SERVER                                                                     │
│  ───────────────                                                                     │
│                                                                                      │
│  subscribe_sector                                                                    │
│  { type: "subscribe_sector", sectorId: "BOS_33" }                                   │
│                                                                                      │
│  acknowledge_alert                                                                   │
│  { type: "acknowledge_alert", alertId: "ALT-001" }                                  │
│                                                                                      │
│  SERVER → CLIENT                                                                     │
│  ───────────────                                                                     │
│                                                                                      │
│  track_update                                                                        │
│  { type: "track_update", track: Track }                                             │
│                                                                                      │
│  alert_created                                                                       │
│  { type: "alert_created", alert: Alert }                                            │
│                                                                                      │
│  alert_resolved                                                                      │
│  { type: "alert_resolved", alertId: string }                                        │
│                                                                                      │
│  prediction_created                                                                  │
│  { type: "prediction_created", prediction: Prediction }                             │
│                                                                                      │
│  prediction_resolved                                                                 │
│  { type: "prediction_resolved", predictionId: string }                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. UI/UX Design

### 8.1 Screen Layouts

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MAIN APPLICATION LAYOUT                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ HEADER ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │    │
│  │ ┌──────┐                                                      ┌────────────┐│    │
│  │ │ LOGO │  ATCS-NG  │  BOS_33  │  12 TRACKS                    │  ⚙️  👤   ││    │
│  │ └──────┘                                                      └────────────┘│    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │ ┌────────┐ ┌─────────────────────┐                    ┌─────────────────┐  │    │
│  │ │ 2D/3D  │ │████ Time Slider ████│                    │ 🎬 DEMO │ LIVE  │  │    │
│  │ └────────┘ └─────────────────────┘                    └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                MAIN CONTENT                                  │    │
│  │                                                                              │    │
│  │  ┌──────────────┐  ┌────────────────────────────────────┐  ┌─────────────┐  │    │
│  │  │              │  │                                    │  │             │  │    │
│  │  │   FLIGHT     │  │                                    │  │   ALERTS    │  │    │
│  │  │   STRIPS     │  │         RADAR MAP                  │  │             │  │    │
│  │  │              │  │           OR                       │  │  ⚠️ HIJACK  │  │    │
│  │  │  ┌────────┐  │  │        3D SCENE                    │  │  ⚠️ CONFLICT│  │    │
│  │  │  │ AIC302 │  │  │                                    │  │  ℹ️ WEATHER │  │    │
│  │  │  │ FL390  │  │  │      ✈️         ✈️                  │  │             │  │    │
│  │  │  │ 510kt  │  │  │           ✈️                       │  ├─────────────┤  │    │
│  │  │  └────────┘  │  │                 ✈️                 │  │             │  │    │
│  │  │  ┌────────┐  │  │       ✈️            ✈️              │  │ PREDICTIONS │  │    │
│  │  │  │ QFA8   │  │  │                                    │  │             │  │    │
│  │  │  │ FL400  │  │  │  ┌─────────────────────────────┐   │  │  97% TCAS   │  │    │
│  │  │  │ 520kt  │  │  │  │     FLIGHT DETAIL          │   │  │  conflict   │  │    │
│  │  │  └────────┘  │  │  │     (Overlay when          │   │  │             │  │    │
│  │  │  ┌────────┐  │  │  │      track selected)       │   │  ├─────────────┤  │    │
│  │  │  │ BAW117 │  │  │  └─────────────────────────────┘   │  │             │  │    │
│  │  │  │ FL370  │  │  │                                    │  │  WEATHER    │  │    │
│  │  │  │ 490kt  │  │  │                                    │  │  ☀️ 72°F    │  │    │
│  │  │  └────────┘  │  │                                    │  │  Wind: 12kt │  │    │
│  │  │              │  │                                    │  │             │  │    │
│  │  ├──────────────┤  └────────────────────────────────────┘  └─────────────┘  │    │
│  │  │              │                                                            │    │
│  │  │ SECTOR STATS │                                                            │    │
│  │  │ 12 tracks    │                                                            │    │
│  │  │ 3 climbing   │                                                            │    │
│  │  │ 2 descending │                                                            │    │
│  │  └──────────────┘                                                            │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ STATUS BAR ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │    │
│  │ 🟢 Connected  │  12 Tracks  │  3 Alerts  │  BOS_33  │  2024-12-22 16:35:22 │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Demo Menu Mockup

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEMO MENU MODAL                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   ╔═══════════════════════════════════════════════════════════════════════╗ │    │
│  │   ║  🎯 ATCS-NG DEMO CENTER                                           ✕  ║ │    │
│  │   ║     Experience ATCS-NG capabilities through guided demos             ║ │    │
│  │   ╠═══════════════════════════════════════════════════════════════════════╣ │    │
│  │   ║                                                                       ║ │    │
│  │   ║  ┌─────────────────────────────────────────────────────────────────┐ ║ │    │
│  │   ║  │  📡 LIVE MODE                                              ▶️  │ ║ │    │
│  │   ║  │      Real-time data from live sensors                          │ ║ │    │
│  │   ║  └─────────────────────────────────────────────────────────────────┘ ║ │    │
│  │   ║                                                                       ║ │    │
│  │   ║  ───────────────────── Demo Mode ─────────────────────               ║ │    │
│  │   ║                                                                       ║ │    │
│  │   ║  ┌─────────────────────────────────────────────────────────────────┐ ║ │    │
│  │   ║  │  🔥 CRISIS SHOWCASE                          [RECOMMENDED]  ▶️  │ ║ │    │
│  │   ║  │                                                                  │ ║ │    │
│  │   ║  │  Experience dramatic aviation crises: Air India hijacking,      │ ║ │    │
│  │   ║  │  Qantas hero rescue, stealth incursion, TCAS resolution.        │ ║ │    │
│  │   ║  │                                                                  │ ║ │    │
│  │   ║  │  ⏱️ ~5 min  │  🦸 Hero Mode Interactive                         │ ║ │    │
│  │   ║  └─────────────────────────────────────────────────────────────────┘ ║ │    │
│  │   ║                                                                       ║ │    │
│  │   ║  ─────────────────── Scenario Library ───────────────────            ║ │    │
│  │   ║                                                                       ║ │    │
│  │   ║  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        ║ │    │
│  │   ║  │ ⚠️ Conflict     │ │ 🌪️ Weather     │ │ 🛡️ Stealth     │        ║ │    │
│  │   ║  │ Resolution      │ │ Avoidance       │ │ Incursion       │        ║ │    │
│  │   ║  │ ~2 min          │ │ ~2 min          │ │ ~2 min          │        ║ │    │
│  │   ║  └─────────────────┘ └─────────────────┘ └─────────────────┘        ║ │    │
│  │   ║                                                                       ║ │    │
│  │   ║  ┌─────────────────────────────────────────────────────────────────┐ ║ │    │
│  │   ║  │  ▶️ FULL TOUR                                       ⏱️ ~10 min │ ║ │    │
│  │   ║  │      All 6 scenarios in sequence                                │ ║ │    │
│  │   ║  └─────────────────────────────────────────────────────────────────┘ ║ │    │
│  │   ║                                                                       ║ │    │
│  │   ╚═══════════════════════════════════════════════════════════════════════╝ │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Design System Colors

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DESIGN SYSTEM - hanaML THEME                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  PRIMARY PALETTE (hanaML Purple)                                                     │
│  ───────────────────────────────                                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │    Primary-50    ┃  #F5F3FF  ████████████████  Very light purple            │    │
│  │    Primary-100   ┃  #EDE9FE  ████████████████  Light purple                 │    │
│  │    Primary-200   ┃  #DDD6FE  ████████████████  Lighter purple               │    │
│  │    Primary-300   ┃  #C4B5FD  ████████████████  Light-mid purple             │    │
│  │    Primary-400   ┃  #A78BFA  ████████████████  Mid purple                   │    │
│  │    Primary-500   ┃  #8B5CF6  ████████████████  Base purple                  │    │
│  │    Primary-600   ┃  #7C3AED  ████████████████  ★ BRAND PRIMARY ★            │    │
│  │    Primary-700   ┃  #6D28D9  ████████████████  Dark purple                  │    │
│  │    Primary-800   ┃  #5B21B6  ████████████████  Darker purple                │    │
│  │    Primary-900   ┃  #4C1D95  ████████████████  Very dark purple             │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ATC-SPECIFIC COLORS                                                                 │
│  ───────────────────                                                                 │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │    ATC Green     ┃  #00FF88  ████████████████  Radar, OK status             │    │
│  │    ATC Cyan      ┃  #00D4FF  ████████████████  Interactive, links           │    │
│  │    ATC Red       ┃  #FF3366  ████████████████  Critical, emergency          │    │
│  │    ATC Orange    ┃  #FFAA00  ████████████████  Warning, caution             │    │
│  │    ATC Blue      ┃  #0088FF  ████████████████  Information                  │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  BACKGROUND COLORS                                                                   │
│  ─────────────────                                                                   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │    bg-primary    ┃  #0D1117  ████████████████  Main background              │    │
│  │    bg-secondary  ┃  #151B23  ████████████████  Cards, panels                │    │
│  │    bg-tertiary   ┃  #1C2128  ████████████████  Elevated elements            │    │
│  │    bg-overlay    ┃  #000000B3  ██████████████  Modal overlays (70%)        │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  TYPOGRAPHY                                                                          │
│  ──────────                                                                          │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │    Headings      ┃  Orbitron          Sci-fi, futuristic headings           │    │
│  │    Body          ┃  Rajdhani          Clean, readable body text             │    │
│  │    Code/Data     ┃  JetBrains Mono    Monospace for data, logs              │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Security Considerations

### 9.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  THREAT MODEL                                                                        │
│  ────────────                                                                        │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   THREAT                    │  LIKELIHOOD  │  IMPACT  │  MITIGATION         │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   API Key Exposure          │  Medium      │  High    │  Server-side proxy  │    │
│  │   XSS Attacks               │  Low         │  Medium  │  React auto-escape  │    │
│  │   CSRF                      │  Low         │  Low     │  SameSite cookies   │    │
│  │   DDoS                      │  Medium      │  Medium  │  Cloud Run scaling  │    │
│  │   Data Interception         │  Low         │  Low     │  HTTPS only         │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  SECURITY LAYERS                                                                     │
│  ───────────────                                                                     │
│                                                                                      │
│       ┌───────────────────────────────────────────────────────────────────────┐     │
│       │                       NETWORK LAYER                                    │     │
│       │   • HTTPS/TLS 1.3 only                                                │     │
│       │   • Cloud Run ingress: all                                            │     │
│       │   • Google Cloud Load Balancer with DDoS protection                   │     │
│       └───────────────────────────────────────────────────────────────────────┘     │
│                                        │                                             │
│                                        ▼                                             │
│       ┌───────────────────────────────────────────────────────────────────────┐     │
│       │                     APPLICATION LAYER                                  │     │
│       │   • API key stored in Cloud Run secrets                               │     │
│       │   • Rate limiting (100 req/min per IP)                                │     │
│       │   • Input validation on all endpoints                                 │     │
│       │   • Content-Security-Policy headers                                   │     │
│       └───────────────────────────────────────────────────────────────────────┘     │
│                                        │                                             │
│                                        ▼                                             │
│       ┌───────────────────────────────────────────────────────────────────────┐     │
│       │                         DATA LAYER                                     │     │
│       │   • Cloud SQL with private IP (coming soon)                           │     │
│       │   • Encryption at rest (default GCP)                                  │     │
│       │   • No PII stored (simulation only)                                   │     │
│       │   • Audit logging enabled                                             │     │
│       └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Performance Considerations

### 10.1 Performance Budget

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PERFORMANCE BUDGET                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  PAGE LOAD METRICS                                                                   │
│  ─────────────────                                                                   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Metric                     │  Budget    │  Current   │  Status            │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   First Contentful Paint     │  < 1.5s    │  1.2s      │  ✅ Pass           │    │
│  │   Largest Contentful Paint   │  < 2.5s    │  2.1s      │  ✅ Pass           │    │
│  │   Cumulative Layout Shift    │  < 0.1     │  0.05      │  ✅ Pass           │    │
│  │   Time to Interactive        │  < 3.0s    │  2.8s      │  ✅ Pass           │    │
│  │   Total Bundle Size          │  < 2MB     │  1.7MB     │  ✅ Pass           │    │
│  │   Initial JS Parse           │  < 500ms   │  350ms     │  ✅ Pass           │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  RUNTIME METRICS                                                                     │
│  ───────────────                                                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Metric                     │  Budget    │  Current   │  Status            │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   Radar Update Latency       │  < 100ms   │  50ms      │  ✅ Pass           │    │
│  │   3D Scene FPS               │  > 30 FPS  │  45 FPS    │  ✅ Pass           │    │
│  │   TTS Latency (first byte)   │  < 500ms   │  300ms     │  ✅ Pass           │    │
│  │   Memory Usage               │  < 200MB   │  150MB     │  ✅ Pass           │    │
│  │   API Response (p95)         │  < 200ms   │  120ms     │  ✅ Pass           │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  OPTIMIZATION TECHNIQUES                                                             │
│  ───────────────────────                                                             │
│                                                                                      │
│  1. Code Splitting        - Lazy load 3D scene, demo scenarios                      │
│  2. Image Optimization    - WebP format, responsive images                          │
│  3. Tree Shaking          - Vite + Rollup for dead code elimination                 │
│  4. CDN Caching           - Static assets on Cloud Storage with CDN                 │
│  5. Memoization           - React.memo, useMemo for expensive renders               │
│  6. Virtual Scrolling     - For large flight lists (future)                         │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Reliability & Monitoring

### 11.1 Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MONITORING STRATEGY                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  KEY METRICS                                                                         │
│  ───────────                                                                         │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   AVAILABILITY                 ERROR RATE                LATENCY             │    │
│  │   ────────────                 ──────────                ───────             │    │
│  │                                                                              │    │
│  │   Target: 99.9%               Target: < 0.1%            Target: p95 < 200ms │    │
│  │                                                                              │    │
│  │   ████████████ 99.95%         ████░░░░░░░░ 0.02%        ████████░░░░ 150ms  │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ALERTING RULES                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Alert Name              │  Condition                  │  Action           │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   High Error Rate         │  errors > 1% for 5 min      │  Page on-call     │    │
│  │   High Latency            │  p95 > 500ms for 5 min      │  Slack alert      │    │
│  │   TTS Failures            │  TTS errors > 10% for 10m   │  Slack alert      │    │
│  │   Memory Leak             │  Memory > 500MB             │  Restart instance │    │
│  │   Container Crash         │  Container restarts > 3/hr  │  Page on-call     │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  LOGGING LEVELS                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  • ERROR: All errors, stack traces, failed API calls                                 │
│  • WARN: Fallbacks triggered, degraded performance                                   │
│  • INFO: User actions, scenario starts, TTS requests                                 │
│  • DEBUG: Detailed trace (dev only)                                                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TESTING STRATEGY                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                                     ▲                                                │
│                                    ╱ ╲                                               │
│                                   ╱   ╲                                              │
│                                  ╱ E2E ╲      5-10 tests                            │
│                                 ╱───────╲     • Full demo flow                       │
│                                ╱         ╲    • Critical paths                       │
│                               ╱───────────╲                                          │
│                              ╱ Integration ╲  20-30 tests                            │
│                             ╱───────────────╲ • API contracts                        │
│                            ╱                 ╲• Component interactions               │
│                           ╱───────────────────╲                                      │
│                          ╱      Unit Tests     ╲  100+ tests                         │
│                         ╱───────────────────────╲ • Reducer logic                    │
│                        ╱                         ╲• Utility functions               │
│                       ╱                           ╲• Component renders              │
│                      ╱─────────────────────────────╲                                │
│                                                                                      │
│  TEST CATEGORIES                                                                     │
│  ───────────────                                                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │   Category        │  Tool              │  Coverage Target  │  Run When      │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │   Unit            │  Vitest            │  80%+             │  Every commit  │    │
│  │   Integration     │  Vitest + MSW      │  70%+             │  Every PR      │    │
│  │   E2E             │  Playwright        │  Critical paths   │  Pre-deploy    │    │
│  │   Visual          │  Chromatic         │  Key components   │  Weekly        │    │
│  │   Performance     │  Lighthouse CI     │  Core Web Vitals  │  Weekly        │    │
│  │   Accessibility   │  axe-core          │  WCAG 2.1 AA      │  Every PR      │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  KEY TEST SCENARIOS                                                                  │
│  ──────────────────                                                                  │
│                                                                                      │
│  1. Demo Flow: Menu → Scenario → Steps → Completion                                  │
│  2. TTS Integration: Request → Audio → Fallback                                      │
│  3. Hero Mode: Trigger → Steps → Resolution                                          │
│  4. State Transitions: All reducer actions                                           │
│  5. Error Handling: API failures, TTS failures, network issues                       │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Rollout Plan

### 13.1 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOYMENT PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│  │  CODE   │──►│  BUILD  │──►│  TEST   │──►│  STAGE  │──►│  PROD   │              │
│  │  PUSH   │   │         │   │         │   │         │   │         │              │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘              │
│       │             │             │             │             │                     │
│       ▼             ▼             ▼             ▼             ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                              │   │
│  │   • Trigger     • TypeScript  • Unit tests  • Deploy to   • Deploy to       │   │
│  │     on push       compile     • Integration   staging       production      │   │
│  │   • Lint        • Vite build    tests       • Smoke tests • Blue-green      │   │
│  │     checks      • Docker      • E2E         • Manual QA     deploy          │   │
│  │   • Type          build       • a11y                      • Monitor         │   │
│  │     check                                                                    │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ROLLOUT STRATEGY                                                                    │
│  ────────────────                                                                    │
│                                                                                      │
│  1. Build & Test (Automated, ~3 min)                                                 │
│     • npm run build                                                                  │
│     • npm run test                                                                   │
│     • Docker build & push to Artifact Registry                                       │
│                                                                                      │
│  2. Staging Deploy (Automated, ~2 min)                                               │
│     • Deploy to staging Cloud Run                                                    │
│     • Run smoke tests                                                                │
│     • Verify TTS integration                                                         │
│                                                                                      │
│  3. Production Deploy (Manual approval)                                              │
│     • Blue-green deployment                                                          │
│     • Gradual traffic shift: 10% → 50% → 100%                                       │
│     • Rollback if error rate > 1%                                                    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Rollback Procedure

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ROLLBACK PROCEDURE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  TRIGGER CONDITIONS                                                                  │
│  ──────────────────                                                                  │
│                                                                                      │
│  Automatic rollback if:                                                              │
│  • Error rate > 5% for 2 minutes                                                     │
│  • p95 latency > 2s for 5 minutes                                                    │
│  • Health check failures > 3 consecutive                                             │
│                                                                                      │
│  ROLLBACK STEPS                                                                      │
│  ──────────────                                                                      │
│                                                                                      │
│  1. Immediate: Route 100% traffic to previous revision                               │
│     gcloud run services update-traffic ui-client \                                   │
│       --to-revisions=ui-client-PREV=100                                              │
│                                                                                      │
│  2. Investigate: Check logs, identify root cause                                     │
│     gcloud logging read "resource.type=cloud_run_revision"                           │
│                                                                                      │
│  3. Fix: Apply fix to codebase                                                       │
│                                                                                      │
│  4. Re-deploy: Follow normal deployment process                                      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Alternatives Considered

### 14.1 Technology Decisions

| Decision | Chosen | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| State Management | useReducer + Context | Redux, Zustand, Jotai | Simpler, no extra deps for demo state |
| 3D Library | React Three Fiber | Babylon.js, raw Three.js | Best React integration |
| TTS | Google Cloud TTS | AWS Polly, Azure TTS, Browser | Best voice quality, Chirp voices |
| Hosting | Cloud Run | App Engine, GKE, Vercel | Scales to zero, easy deployment |
| Styling | CSS-in-JS (inline) | Tailwind, styled-components | Simple, no build step for styles |

### 14.2 Architecture Decisions

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| SPA vs SSR | SPA (Vite) | Next.js SSR | No SEO needs, faster iteration |
| Demo data source | In-memory | Server-sent | Simpler, no backend dependency |
| Audio handling | Direct API | Web Audio API | Easier implementation |

---

## 15. Open Questions

| ID | Question | Owner | Due | Status |
|----|----------|-------|-----|--------|
| OQ-1 | Should we add WebSocket for real-time in v3.0? | Eng | Jan 2025 | Open |
| OQ-2 | Do we need to support Safari 14? | Eng | Jan 2025 | Open |
| OQ-3 | Should Hero Mode have audio for passenger? | Design | Jan 2025 | Open |
| OQ-4 | Do we need a11y audit before GA? | QA | Feb 2025 | Open |

---

## 16. Appendix

### 16.1 File Structure

```
src/
├── components/           # UI components
│   ├── Map/             # Radar map (2D)
│   ├── Scene3D/         # 3D visualization
│   ├── FlightStrips/    # Flight strip bay
│   ├── Alerts/          # Alert panel
│   ├── Predictions/     # AI predictions panel
│   ├── Controls/        # View controls
│   ├── Widgets/         # Sector stats, weather
│   └── ...
├── demo/                # Demo system
│   ├── DemoProvider.tsx # Demo context
│   ├── DemoController.ts # State machine
│   ├── components/      # Demo overlays
│   │   ├── DemoMenuModal.tsx
│   │   ├── NarratorPanel.tsx
│   │   ├── SpotlightOverlay.tsx
│   │   └── ATCCommandDisplay.tsx
│   └── scenarios/       # Demo scenarios
│       ├── showcase-demo.ts
│       └── types.ts
├── audio/               # Audio system
│   ├── CloudTTS.ts      # Google Cloud TTS
│   └── VoiceNotification.ts # Browser fallback
├── hooks/               # Custom hooks
├── store/               # Zustand store
├── types/               # TypeScript types
└── styles/              # Global styles
```

### 16.2 Related Documents

- [Product Requirements Document](./product-requirements-document.md)
- [Technical Specification](./technical-specification.md)
- [Release Plan](./release-plan.md)

### 16.3 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.5.0 | 2024-12-22 | Engineering | Added Cloud TTS, Hero Mode, ATC commands |
| 2.0.0 | 2024-10-01 | Engineering | Initial design document |

---

<div align="center">

![hanaML](hanaML-Template-7C3AED.png)

*This document is maintained by the Engineering Team and reviewed bi-weekly.*

</div>
