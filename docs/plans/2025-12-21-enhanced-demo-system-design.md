# ATCS-NG Enhanced Demo System Design

**Date:** 2025-12-21
**Version:** 2.2.0

## Overview

Complete overhaul of the demo and simulation system with dual modes, interactive Hero Mode, enhanced visuals, and continuous live simulation.

## Mode System

### Startup Behavior
- App launches directly into **Demo Mode** (no menu click)
- Demo auto-plays immediately with voice narration
- Header toggle visible: `[DEMO] / [LIVE]`

### Demo Mode
- **Duration:** ~3 minutes total
- **Pacing:** Voice-driven, auto-advance 500ms after speech ends
- **Content:** Scripted showcase with 5 crisis scenarios + Hero Mode
- **Speed:** 8-16x visual, scripted timing per scenario

### Live Mode
- **Speed:** ~150x real-time (adjustable 75x-300x)
- **Alerts:** ~15 per minute (1 every 4 seconds)
- **Traffic:** 20-30 aircraft continuously
- **Duration:** Infinite, continuous operation

## Dual Voice System

| Voice | Purpose | Style |
|-------|---------|-------|
| **Narrator** | Explains situation | Calm, documentary |
| **ATC Controller** | Issues commands | Crisp, urgent, radio cadence |

Both voices play during demo - narrator explains, ATC issues commands, aircraft respond.

## Command Log Panel

Collapsible panel (bottom-left) showing real-time ATC commands:

```
┌─ ATC COMMAND LOG ──────────────────┐
│ 14:32:05  UAL2547  CLIMB FL390     │
│ 14:32:06  DAL1892  DESCEND FL310   │
│ 14:32:08  BAW117   TURN LEFT 180   │
│ ...auto-scrolling...               │
└────────────────────────────────────┘
```

## Hero Mode

### Trigger
Auto-activates after Emirates A380 crash (unwinnable scenario).

### Scenario
- **Aircraft:** United 1549, B787, 274 souls
- **Situation:** Pilots incapacitated, flight attendant "Sarah" at controls
- **Goal:** Guide to JFK Runway 31L

### Command Panel
Replaces NarratorPanel with interactive controls:

```
┌─ HERO MODE: GUIDE UAL1549 ─────────────┐
│ LIVE   274 souls   Alt: 28,000 ft      │
├────────────────────────────────────────┤
│ Sarah: "Tell me what to do."           │
├────────────────────────────────────────┤
│ HEADING           │ ALTITUDE           │
│ [LEFT 10°]        │ [CLIMB 1000]       │
│ [LEFT 30°]        │ [CLIMB 5000]       │
│ [RIGHT 10°]       │ [DESCEND 1000]     │
│ [RIGHT 30°]       │ [DESCEND 5000]     │
├───────────────────┴────────────────────┤
│ SPEED                                  │
│ [SLOW 180kt]  [APPROACH 160kt]  [LAND] │
├────────────────────────────────────────┤
│ Target: JFK 31L  │  Distance: 47nm     │
└────────────────────────────────────────┘
```

### Success Condition
- Heading: 310° ±10°
- Altitude: Below 3,000 ft
- Speed: Under 180kt
- Distance: Within 5nm of runway

### Victory
Sarah: "I see the runway!" → Triumphant sound → Demo ends

## Enhanced Flight Strips

### Format
```
┌──────────────────────────────────────────┐
│ 🇺🇸 ✈━━━━  UAL2547           B787       │
│    [UAL]   FL350 → FL390    274 souls   │
│            HDG 090°  450kt  ▲ +1500     │
└──────────────────────────────────────────┘
```

### Elements
- **Country flag:** Emoji (🇺🇸 🇬🇧 🇫🇷 🇦🇪 etc.)
- **Aircraft silhouette:** SVG sized by class
- **Airline badge:** 3-letter ICAO in colored box
- **Souls count:** Passenger + crew total

### Aircraft Silhouettes (5 sizes)
| Class | Examples | Visual |
|-------|----------|--------|
| Regional | CRJ, E175 | ✈ (small) |
| Narrowbody | A320, B737 | ✈━ (medium) |
| Widebody | A330, B787 | ✈━━ (large) |
| Heavy | B777, A350 | ✈━━━ (xlarge) |
| Super | A380, B747 | ✈━━━━ (huge) |

### Airline Badge Colors
- US carriers: Blue
- European: Purple
- Middle East: Gold
- Asian: Red
- Cargo: Gray

## Track Selection & Commands

### Click Aircraft
1. Aircraft highlights on map
2. FlightDetail panel opens
3. Map centers/follows aircraft
4. Trail brightens

### FlightDetail Panel
```
┌─ 🇺🇸 UAL2547 ─────────────── ✕ ─┐
│ ✈━━━━ Boeing 787-9   274 souls │
│ United Airlines                 │
├─────────────────────────────────┤
│ ALT: FL350    SPD: 450kt       │
│ HDG: 090°     V/S: +1500       │
├─────────────────────────────────┤
│ [MESSAGE]  [TRACK]              │
├─────────────────────────────────┤
│ QUICK COMMANDS:                 │
│ [CLIMB]  [DESCEND]  [TURN]     │
│ [SQUAWK 7700]  [HOLD]          │
└─────────────────────────────────┘
```

### MESSAGE Modal
```
┌─ MESSAGE UAL2547 ───────────────┐
│ [Turn left heading ___]         │
│ [Turn right heading ___]        │
│ [Climb to FL___]                │
│ [Descend to FL___]              │
│ [Reduce speed to ___]           │
│ [Contact departure 124.5]       │
├─────────────────────────────────┤
│ [CANCEL]            [TRANSMIT]  │
└─────────────────────────────────┘
```

### TRACK Button
- Enables follow mode (map pans with aircraft)
- Toggles to UNTRACK when active

## Live Mode Traffic Generator

### Traffic Management
- Maintain 20-30 aircraft at all times
- Spawn from sector edges (N, E, SW)
- Exit opposite edges (S, W, NE)
- Mix of airlines, aircraft types

### Alert Distribution (15/minute)
| Type | Frequency |
|------|-----------|
| Conflict | 25% |
| Deviation | 20% |
| Weather | 15% |
| Emergency | 10% |
| Handoff | 20% |
| Altitude | 10% |

### Alert Lifecycle
1. Alert appears + ATC voice
2. AI auto-resolves (3-8 sec)
3. Command logged
4. Aircraft responds
5. Alert clears

### Speed Control
- Base: 150x
- Range: 75x to 300x
- Alert rate scales proportionally

## Demo Scenario Timing

| Scenario | Duration |
|----------|----------|
| Intro | ~15 sec |
| Russian Stealth | ~30 sec |
| TCAS Near-Miss | ~25 sec |
| Tornado | ~20 sec |
| Unwinnable Hijacking | ~45 sec |
| Hero Mode | ~60 sec (user-paced) |
| Finale | ~15 sec |
| **Total** | **~3 minutes** |

## Files to Modify/Create

### New Files
- `src/components/Controls/ModeToggle.tsx` - Demo/Live toggle
- `src/components/Controls/CommandLog.tsx` - ATC command log panel
- `src/components/Controls/HeroModePanel.tsx` - Hero Mode interface
- `src/components/Controls/CommandModal.tsx` - Message/command modal
- `src/simulation/TrafficGenerator.ts` - Live mode traffic
- `src/simulation/AlertGenerator.ts` - Live mode alerts
- `src/audio/ATCVoice.ts` - ATC voice synthesis
- `src/assets/aircraft-silhouettes.tsx` - SVG silhouettes

### Modified Files
- `src/App.tsx` - Auto-start demo, mode switching
- `src/demo/DemoController.ts` - Auto-advance logic
- `src/demo/components/NarratorPanel.tsx` - Voice completion callback
- `src/demo/scenarios/showcase-demo.ts` - Faster timing, ATC commands
- `src/components/FlightStrips/FlightStrip.tsx` - Enhanced display
- `src/components/FlightDetail/FlightDetail.tsx` - Working buttons
- `src/components/Map/AircraftMarker.tsx` - Silhouettes
- `src/audio/AudioManager.ts` - ATC voice support
- `src/store/uiStore.ts` - Mode state, tracking state

## Implementation Priority

1. **Mode toggle + auto-start** - Foundation
2. **Auto-advance demo** - Voice-driven progression
3. **Dual voice system** - Narrator + ATC
4. **Command log panel** - Visual feedback
5. **Enhanced flight strips** - Flags, silhouettes, souls
6. **Track selection fixes** - MESSAGE/TRACK buttons
7. **Hero Mode** - Interactive finale
8. **Live Mode generator** - Continuous simulation
