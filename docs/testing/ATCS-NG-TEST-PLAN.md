# Test Plan: ATCS-NG UI Client v2.5.0

**Version:** 1.0
**Date:** 2025-12-22
**Author:** Engineering Team
**PRD:** [ATCS-NG-PRD-20251222-ui-client.md](../ATCS-NG-PRD-20251222-ui-client.md)
**Tech Spec:** [ATCS-NG-DESIGN-DOCUMENT.md](../architecture/ATCS-NG-DESIGN-DOCUMENT.md)

---

## 1. Overview

### 1.1 Objectives

This test plan ensures the ATCS-NG UI Client:
- Functions correctly across all supported browsers
- Provides a smooth demo experience without errors
- Gracefully handles edge cases and failures
- Meets performance requirements
- Is accessible to users with assistive technologies

### 1.2 Scope

**In Scope:**
- All UI components
- Demo mode functionality
- Voice synthesis (Cloud TTS + fallback)
- Alert system
- Hero Mode interactions
- Radar map display
- 3D view toggle
- Status bar and version display
- Build and deployment process

**Out of Scope:**
- Backend API services (not yet integrated)
- Multi-user scenarios
- Real ADS-B data integration
- Load testing beyond 100 concurrent users

### 1.3 Test Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local Dev | http://localhost:5173 | Development testing |
| Staging | (N/A - direct to prod) | N/A |
| Production | https://ui-client-595822882252.us-central1.run.app | Smoke tests, E2E |

### 1.4 Browser Support Matrix

| Browser | Version | Priority | Status |
|---------|---------|----------|--------|
| Chrome | 120+ | P0 | Primary |
| Firefox | 120+ | P1 | Supported |
| Safari | 17+ | P1 | Supported |
| Edge | 120+ | P2 | Supported |
| Mobile Safari | iOS 17+ | P2 | Basic |
| Mobile Chrome | Android 14+ | P2 | Basic |

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Coverage Target | Automation | Owner |
|-------|-----------------|------------|-------|
| Unit Tests | 80%+ | 100% automated | Dev Team |
| Integration Tests | Critical paths | 90% automated | Dev Team |
| E2E Tests | Happy paths | 80% automated | QA Team |
| Manual Tests | Edge cases, UX | Manual | QA Team |
| Performance Tests | Key metrics | Automated | Dev Team |
| Accessibility Tests | WCAG 2.1 AA | 50% automated | QA Team |

### 2.2 Test Types

```
┌─────────────────────────────────────────────────────────────────┐
│                       Test Pyramid                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ┌───────┐                               │
│                         │ E2E   │  10%                          │
│                         │ Tests │                               │
│                      ┌──┴───────┴──┐                            │
│                      │ Integration │  20%                       │
│                      │   Tests     │                            │
│                   ┌──┴─────────────┴──┐                         │
│                   │    Unit Tests     │  70%                    │
│                   │                   │                         │
│                   └───────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Test Data Requirements

| Data Type | Source | Volume | Refresh |
|-----------|--------|--------|---------|
| Flight data | Hardcoded demo | 30 flights | Static |
| Alert data | Generated in demo | 10-15 alerts | Per demo |
| Voice audio | Cloud TTS API | On-demand | Real-time |
| Map tiles | OpenStreetMap | Cached | Static |

---

## 3. Unit Tests

### 3.1 Component Unit Tests

| ID | Component | Test Description | Expected Result | Priority |
|----|-----------|------------------|-----------------|----------|
| UT-001 | StatusBar | Renders current time in local format | Time displays as HH:MM:SS | P0 |
| UT-002 | StatusBar | Renders UTC/Zulu time correctly | Time displays with Z suffix | P0 |
| UT-003 | StatusBar | Displays version number | "v2.5.0" visible | P0 |
| UT-004 | StatusBar | Shows connection status | CONNECTED (green) or DISCONNECTED (red) | P0 |
| UT-005 | AlertPanel | Renders alert with correct severity styling | CRITICAL=red, WARNING=amber, INFO=blue | P0 |
| UT-006 | AlertPanel | Acknowledge button removes alert glow | Alert appears muted after ACK | P1 |
| UT-007 | AlertPanel | Flight tags are clickable | onClick handler fires with flightId | P1 |
| UT-008 | AlertPanel | Empty state shows "No active alerts" | Message displayed when alerts=[] | P2 |
| UT-009 | FlightStrip | Displays callsign and aircraft type | Correct data rendered | P0 |
| UT-010 | FlightStrip | Shows altitude with proper formatting | FL350 format for high altitude | P0 |
| UT-011 | FlightStrip | Airline badge shows correct color | Color matches airline region | P1 |
| UT-012 | FlightStrip | Country flag emoji renders | Flag visible next to callsign | P1 |
| UT-013 | Header | Demo button visible | Button with "DEMO" text | P0 |
| UT-014 | Header | 3D toggle works | Switches between 2D/3D views | P1 |
| UT-015 | CommandModal | Opens with correct callsign | Modal header shows target aircraft | P0 |
| UT-016 | CommandModal | Quick commands fire correctly | Command sent on button click | P0 |
| UT-017 | CommandModal | Custom command input works | Text entered and submitted | P1 |
| UT-018 | CommandModal | Close button dismisses modal | Modal no longer visible | P0 |

### 3.2 Service Unit Tests

| ID | Service | Test Description | Expected Result | Priority |
|----|---------|------------------|-----------------|----------|
| UT-101 | CloudTTS | Constructs correct API request | Proper JSON body with voice config | P0 |
| UT-102 | CloudTTS | Handles API error gracefully | Throws error, doesn't crash | P0 |
| UT-103 | CloudTTS | Decodes base64 audio correctly | Valid audio data returned | P0 |
| UT-104 | CloudTTS | Falls back to browser TTS on failure | VoiceNotification.speak called | P0 |
| UT-105 | AudioManager | Plays correct sound for alert type | critical.mp3 for CRITICAL | P0 |
| UT-106 | AudioManager | Respects mute setting | No sound when muted | P0 |
| UT-107 | VoiceNotification | Uses SpeechSynthesis API | utterance created and spoken | P1 |
| UT-108 | VoiceNotification | Handles empty text | Returns without error | P1 |

### 3.3 Store Unit Tests

| ID | Store | Test Description | Expected Result | Priority |
|----|-------|------------------|-----------------|----------|
| UT-201 | uiStore | setSelectedFlight updates state | selectedFlightId changes | P0 |
| UT-202 | uiStore | addAlert appends to alerts array | alerts.length increases | P0 |
| UT-203 | uiStore | acknowledgeAlert sets acknowledged=true | Alert marked acknowledged | P0 |
| UT-204 | uiStore | addCommandLog prepends to log | New command at index 0 | P0 |
| UT-205 | uiStore | setLiveOnly updates mode | liveOnly becomes true | P1 |
| UT-206 | uiStore | setConnected updates status | connected state changes | P0 |

### 3.4 Hook Unit Tests

| ID | Hook | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| UT-301 | useDemoMode | Returns current demo state | isActive, mode, etc. present | P0 |
| UT-302 | useDemoMode | startDemo transitions to playing | mode becomes 'playing' | P0 |
| UT-303 | useDemoMode | nextStep increments index | currentStepIndex increases | P0 |
| UT-304 | useDemoData | Returns demo flights when active | Non-empty flights array | P0 |
| UT-305 | useDemoData | Returns empty when liveOnly | flights = [] | P1 |
| UT-306 | useCurrentTime | Updates every second | Time changes after 1000ms | P1 |

---

## 4. Integration Tests

### 4.1 Demo Mode Integration

| ID | Flow | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| IT-001 | Demo Start | Click Demo → Menu opens | DemoMenuModal visible | P0 |
| IT-002 | Demo Start | Select Play → Demo begins | NarratorPanel shows first step | P0 |
| IT-003 | Demo Start | Select Live → Live mode active | liveOnly=true, menu closes | P0 |
| IT-004 | Demo Playback | Narration triggers voice | Audio plays (TTS or fallback) | P0 |
| IT-005 | Demo Playback | Step completes → Auto-advance | Next step loads after delay | P0 |
| IT-006 | Demo Playback | Pause button pauses demo | mode='paused', no auto-advance | P0 |
| IT-007 | Demo Playback | Skip button advances scenario | currentStepIndex jumps forward | P1 |
| IT-008 | Demo Playback | Demo completes → Shows menu | mode='complete', menu opens | P0 |

### 4.2 Alert System Integration

| ID | Flow | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| IT-101 | Alert Creation | Demo creates alert | Alert appears in AlertPanel | P0 |
| IT-102 | Alert Audio | CRITICAL alert → Alarm sound | Audio plays if not muted | P0 |
| IT-103 | Alert Voice | Alert → VoiceNotification speaks | Voice announces alert (non-demo) | P0 |
| IT-104 | Alert Voice | Demo mode → CloudTTS speaks | Cloud TTS announces (demo) | P0 |
| IT-105 | Alert ACK | Click ACK → Alert muted | Visual styling changes | P0 |
| IT-106 | Alert Focus | Click flight tag → Map focuses | selectedFlightId set, map pans | P1 |

### 4.3 Map Integration

| ID | Flow | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| IT-201 | Aircraft Display | Flights load → Markers appear | Aircraft icons on map | P0 |
| IT-202 | Aircraft Select | Click marker → Flight selected | FlightDetail panel opens | P0 |
| IT-203 | Aircraft Trail | Aircraft moves → Trail draws | Polyline shows path | P1 |
| IT-204 | 3D Toggle | Click 3D → View changes | RadarMap3D component renders | P1 |
| IT-205 | Data Block | Hover/select → Data block shows | Callsign, altitude visible | P0 |

### 4.4 Command Integration

| ID | Flow | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| IT-301 | Command Modal | Click MESSAGE → Modal opens | CommandModal visible | P0 |
| IT-302 | Quick Command | Click CLIMB → Command sent | Command logged, voice speaks | P0 |
| IT-303 | Custom Command | Type + Enter → Command sent | Custom text sent | P1 |
| IT-304 | Command Log | Command sent → Log updates | Command appears in log panel | P0 |

### 4.5 Hero Mode Integration

| ID | Flow | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| IT-401 | Hero Start | Demo reaches hero step → Panel shows | HeroModePanel visible | P0 |
| IT-402 | Hero Heading | Click LEFT 10° → Heading changes | Aircraft heading -10° | P0 |
| IT-403 | Hero Altitude | Click DESCEND → Altitude changes | Aircraft altitude decreases | P0 |
| IT-404 | Hero Speed | Click SLOW → Speed changes | Aircraft speed decreases | P0 |
| IT-405 | Hero Victory | Conditions met → Victory | Success message, demo ends | P0 |
| IT-406 | Hero Voice | Command clicked → Voice feedback | CloudTTS speaks response | P0 |

---

## 5. End-to-End Tests

### 5.1 Critical User Journeys

| ID | Scenario | Steps | Expected Result | Priority |
|----|----------|-------|-----------------|----------|
| E2E-001 | Complete Demo | 1. Load app<br>2. Click Demo<br>3. Click Play Demo<br>4. Wait for completion<br>5. Verify all scenarios played | Demo completes without error, voice plays, ~5min duration | P0 |
| E2E-002 | Hero Mode Victory | 1. Start demo<br>2. Reach hero mode<br>3. Guide aircraft to runway<br>4. Achieve landing | Victory message displayed, demo ends gracefully | P0 |
| E2E-003 | Live Mode | 1. Load app<br>2. Click Demo<br>3. Click Live Mode<br>4. Verify radar active | Aircraft visible, no demo narration, continuous simulation | P0 |
| E2E-004 | Alert Acknowledge | 1. Start demo<br>2. Wait for alert<br>3. Click ACK<br>4. Verify visual change | Alert muted, counter decrements | P0 |
| E2E-005 | Flight Selection | 1. Load app<br>2. Click aircraft on map<br>3. View flight detail<br>4. Send command | Detail panel shows, command logged | P0 |

### 5.2 Browser Compatibility E2E

| ID | Browser | Test | Expected Result | Priority |
|----|---------|------|-----------------|----------|
| E2E-101 | Chrome | Full demo playback | Completes without error | P0 |
| E2E-102 | Firefox | Full demo playback | Completes without error | P1 |
| E2E-103 | Safari | Full demo playback | Completes without error | P1 |
| E2E-104 | Edge | Full demo playback | Completes without error | P2 |
| E2E-105 | Mobile Chrome | Basic interaction | Map displays, clicks work | P2 |
| E2E-106 | Mobile Safari | Basic interaction | Map displays, clicks work | P2 |

### 5.3 Error Handling E2E

| ID | Scenario | Steps | Expected Result | Priority |
|----|----------|-------|-----------------|----------|
| E2E-201 | TTS Failure | 1. Block TTS API (dev tools)<br>2. Start demo<br>3. Observe behavior | Falls back to browser TTS, demo continues | P0 |
| E2E-202 | Network Offline | 1. Go offline<br>2. Interact with loaded app<br>3. Observe behavior | Graceful degradation, no crashes | P1 |
| E2E-203 | Audio Blocked | 1. Block autoplay<br>2. Start demo<br>3. Observe behavior | Demo continues, no errors | P1 |

---

## 6. Performance Tests

### 6.1 Load Time Tests

| ID | Metric | Target | Method | Priority |
|----|--------|--------|--------|----------|
| PERF-001 | First Contentful Paint | < 1.5s | Lighthouse | P0 |
| PERF-002 | Largest Contentful Paint | < 2.5s | Lighthouse | P0 |
| PERF-003 | Time to Interactive | < 3.5s | Lighthouse | P0 |
| PERF-004 | Total Bundle Size (gzip) | < 600KB | Build output | P0 |
| PERF-005 | Initial JS Parse | < 500ms | Chrome DevTools | P1 |

### 6.2 Runtime Performance Tests

| ID | Scenario | Target | Method | Priority |
|----|----------|--------|--------|----------|
| PERF-101 | 50 aircraft render | 60fps | FPS counter | P0 |
| PERF-102 | Map pan/zoom | 60fps | FPS counter | P0 |
| PERF-103 | Alert animation | 60fps | FPS counter | P0 |
| PERF-104 | Demo step transition | < 100ms | Performance API | P0 |
| PERF-105 | TTS latency | < 500ms | Console timing | P1 |
| PERF-106 | Memory (30min session) | < 200MB | Chrome DevTools | P1 |

### 6.3 Stress Tests

| ID | Scenario | Load | Target | Priority |
|----|----------|------|--------|----------|
| PERF-201 | 100 aircraft | 100 moving aircraft | 30fps+ | P1 |
| PERF-202 | 50 alerts | 50 simultaneous alerts | No crash | P1 |
| PERF-203 | Rapid commands | 10 commands/second | Queue processed | P2 |
| PERF-204 | Long session | 1 hour continuous | No memory leak | P2 |

---

## 7. Security Tests

| ID | Category | Test Description | Expected Result | Priority |
|----|----------|------------------|-----------------|----------|
| SEC-001 | API Key | Check key in source | Key restricted to TTS API only | P0 |
| SEC-002 | XSS | Inject script in input | Input sanitized, no execution | P0 |
| SEC-003 | CSP | Check Content-Security-Policy | Restrictive policy applied | P1 |
| SEC-004 | HTTPS | Force HTTPS redirect | All traffic encrypted | P0 |
| SEC-005 | Dependencies | npm audit | No critical vulnerabilities | P0 |

---

## 8. Accessibility Tests

| ID | Category | Test Description | WCAG | Priority |
|----|----------|------------------|------|----------|
| A11Y-001 | Contrast | Text contrast ratio | 2.1 AA (4.5:1) | P1 |
| A11Y-002 | Focus | Visible focus indicator | 2.1 AA | P1 |
| A11Y-003 | Keyboard | Tab navigation works | 2.1 A | P1 |
| A11Y-004 | Screen Reader | Landmarks present | 2.1 A | P2 |
| A11Y-005 | Alt Text | Images have alt text | 2.1 A | P2 |
| A11Y-006 | Motion | Reduced motion respected | 2.1 AAA | P2 |

---

## 9. Regression Tests

### 9.1 Critical Path Regression

After each deployment, run:

| ID | Test | Duration | Automation |
|----|------|----------|------------|
| REG-001 | Page loads | 5s | Automated |
| REG-002 | Demo starts | 10s | Automated |
| REG-003 | Voice plays | 15s | Manual |
| REG-004 | Version visible | 5s | Automated |
| REG-005 | No console errors | 30s | Automated |

### 9.2 Visual Regression

| ID | Component | Baseline | Method |
|----|-----------|----------|--------|
| VIS-001 | StatusBar | Captured | Percy/Chromatic |
| VIS-002 | AlertPanel | Captured | Percy/Chromatic |
| VIS-003 | NarratorPanel | Captured | Percy/Chromatic |
| VIS-004 | HeroModePanel | Captured | Percy/Chromatic |

---

## 10. Test Data

### 10.1 Demo Flight Data

| Callsign | Airline | Type | Origin | Destination | Notes |
|----------|---------|------|--------|-------------|-------|
| AIC302 | Air India | B787 | DEL | BOS | Hijack scenario |
| QFA8 | Qantas | A380 | SYD | LAX | Hero mode |
| EK203 | Emirates | A380 | DXB | JFK | Crash scenario |
| BAW117 | British Airways | A350 | LHR | JFK | Normal ops |
| UAL2547 | United | B787 | SFO | BOS | Normal ops |

### 10.2 Test Accounts

Not applicable - no authentication required.

---

## 11. Entry & Exit Criteria

### 11.1 Entry Criteria

- [ ] Code complete and merged to main
- [ ] Build passes without errors
- [ ] Deployment to test environment successful
- [ ] Test data available
- [ ] Test tools configured

### 11.2 Exit Criteria

- [ ] All P0 tests pass (100%)
- [ ] 95%+ P1 tests pass
- [ ] No open P0/P1 bugs
- [ ] Performance targets met
- [ ] Security scan clean
- [ ] Accessibility score > 80

---

## 12. Defect Management

### 12.1 Severity Definitions

| Severity | Definition | Response Time | Example |
|----------|------------|---------------|---------|
| P0 - Critical | System unusable, no workaround | 4 hours | Demo doesn't start |
| P1 - Major | Major feature broken, workaround exists | 24 hours | Voice doesn't play |
| P2 - Minor | Minor feature issue | 1 week | Wrong color on badge |
| P3 - Cosmetic | Visual polish | Next release | Spacing slightly off |

### 12.2 Bug Report Template

```markdown
**Title:** [Component] Brief description

**Severity:** P0/P1/P2/P3
**Environment:** Browser, OS, Device
**Build:** Version number

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots/Logs:**
[Attach if available]

**Additional Context:**
Any other relevant information
```

---

## 13. Schedule

| Phase | Start | End | Owner |
|-------|-------|-----|-------|
| Test Plan Review | 2025-12-22 | 2025-12-22 | QA Lead |
| Unit Test Writing | 2025-12-23 | 2025-12-27 | Dev Team |
| Integration Tests | 2025-12-27 | 2025-12-30 | Dev Team |
| E2E Tests | 2025-12-30 | 2026-01-03 | QA Team |
| Performance Tests | 2026-01-03 | 2026-01-05 | Dev Team |
| Bug Fixing | 2026-01-05 | 2026-01-10 | Dev Team |
| Final Regression | 2026-01-10 | 2026-01-12 | QA Team |
| Sign-off | 2026-01-12 | 2026-01-12 | All |

---

## 14. Deliverables

- [x] Test Plan (this document)
- [ ] Unit Test Suite (Jest/Vitest)
- [ ] Integration Test Suite
- [ ] E2E Test Suite (Playwright/Cypress)
- [ ] Performance Test Results
- [ ] Test Summary Report
- [ ] Defect Report

---

## 15. Appendix

### 15.1 Test Tools

| Tool | Purpose | Version |
|------|---------|---------|
| Vitest | Unit testing | 2.x |
| React Testing Library | Component testing | 14.x |
| Playwright | E2E testing | 1.40+ |
| Lighthouse | Performance | Chrome built-in |
| axe-core | Accessibility | 4.x |
| Percy | Visual regression | Cloud |

### 15.2 Test Commands

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm test -- --coverage

# Run E2E tests
npx playwright test

# Run specific test file
npm test -- StatusBar.test.tsx

# Run Lighthouse audit
npx lighthouse https://ui-client-595822882252.us-central1.run.app

# Run accessibility audit
npx axe https://ui-client-595822882252.us-central1.run.app
```

### 15.3 CI/CD Test Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

### 15.4 References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
