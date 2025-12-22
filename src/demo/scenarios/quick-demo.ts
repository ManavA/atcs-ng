import type { Scenario } from './types';

/**
 * Quick Demo - 2-minute automatic showcase with dramatic events
 * Runs completely automatically - no user interaction required
 * Designed for executives, stakeholders, and time-constrained presentations
 */
export const quickDemoScenario: Scenario = {
  id: 'quick-demo',
  title: 'Quick Demo',
  description: '2-minute automatic showcase of all ATCS-NG capabilities with dramatic events',
  icon: 'zap',
  duration: 2,
  initialState: {
    tracks: [
      // Initial traffic - 8 aircraft in sector
      {
        trackId: 'TRK-QD-001',
        callsign: 'UAL123',
        latitudeDeg: 42.4,
        longitudeDeg: -71.8,
        altitudeFt: 35000,
        headingDeg: 90,
        speedKt: 450,
        verticalRateFpm: 0,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-002',
        callsign: 'DAL456',
        latitudeDeg: 42.4,
        longitudeDeg: -70.6,
        altitudeFt: 35000,
        headingDeg: 270,
        speedKt: 460,
        verticalRateFpm: 0,
        confidence: 0.94,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-003',
        callsign: 'AAL777',
        latitudeDeg: 42.0,
        longitudeDeg: -71.4,
        altitudeFt: 28000,
        headingDeg: 180,
        speedKt: 380,
        verticalRateFpm: -1000,
        confidence: 0.97,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-004',
        callsign: 'SWA333',
        latitudeDeg: 41.8,
        longitudeDeg: -71.0,
        altitudeFt: 24000,
        headingDeg: 45,
        speedKt: 410,
        verticalRateFpm: 1500,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-005',
        callsign: 'JBU888',
        latitudeDeg: 42.6,
        longitudeDeg: -71.2,
        altitudeFt: 32000,
        headingDeg: 135,
        speedKt: 420,
        verticalRateFpm: 0,
        confidence: 0.93,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-006',
        callsign: 'FFT999',
        latitudeDeg: 41.6,
        longitudeDeg: -71.6,
        altitudeFt: 38000,
        headingDeg: 0,
        speedKt: 480,
        verticalRateFpm: 0,
        confidence: 0.92,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-007',
        callsign: 'ASA601',
        latitudeDeg: 42.2,
        longitudeDeg: -70.8,
        altitudeFt: 29000,
        headingDeg: 225,
        speedKt: 400,
        verticalRateFpm: 0,
        confidence: 0.94,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-QD-008',
        callsign: 'NKS444',
        latitudeDeg: 41.9,
        longitudeDeg: -71.8,
        altitudeFt: 31000,
        headingDeg: 90,
        speedKt: 430,
        verticalRateFpm: 0,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
    ],
    alerts: [],
    predictions: [],
  },
  steps: [
    // [0:00-0:08] INTRO
    {
      id: 'intro',
      narrative: 'ATCS-NG Quick Demo — Watch as our AI-powered air traffic control system handles multiple dramatic events in real-time.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
    {
      id: 'traffic-overview',
      narrative: '8 aircraft currently in sector. Real-time surveillance with sub-second updates. Let\'s see what happens next...',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },

    // [0:08-0:20] WEATHER HAZARD
    {
      id: 'weather-spawns',
      narrative: 'WEATHER ALERT — Severe thunderstorm cell detected! Three aircraft in the affected corridor.',
      spotlight: { type: 'component', id: 'alerts' },
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-QD-WX01',
            severity: 'WARNING',
            alertType: 'WEATHER_HAZARD',
            message: 'Severe thunderstorm cell moving NE at 45kt. Tops to FL450. Affected: JBU888, ASA601, NKS444',
            involvedFlightIds: ['JBU888', 'ASA601', 'NKS444'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'weather-reroute',
      narrative: 'AI recommends rerouting affected aircraft around the storm cell. Executing deviation...',
      spotlight: { type: 'flight', callsign: 'JBU888' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-005', headingDeg: 180 },
        },
        {
          delay: 500,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-007', headingDeg: 270 },
        },
        {
          delay: 1000,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-008', headingDeg: 45 },
        },
        {
          delay: 2500,
          type: 'removeAlert',
          payload: { alertId: 'ALT-QD-WX01' },
        },
      ],
      autoAdvance: 5000,
    },

    // [0:20-0:40] CONFLICT DETECTION & RESOLUTION
    {
      id: 'conflict-detected',
      narrative: 'CONFLICT ALERT — UAL123 and DAL456 on collision course! AI predicts 94% probability of conflict in 2 minutes.',
      spotlight: { type: 'component', id: 'predictions' },
      events: [
        {
          delay: 300,
          type: 'addPrediction',
          payload: {
            id: 'PRED-QD-001',
            predictionType: 'CONFLICT',
            involvedFlights: ['UAL123', 'DAL456'],
            probability: 0.94,
            predictedTime: new Date(Date.now() + 120000).toISOString(),
            description: 'IMMINENT CONFLICT: Head-on at FL350. Closure rate 910kt. Time to impact: 2:12',
          },
        },
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-QD-CF01',
            severity: 'WARNING',
            alertType: 'CONFLICT_PREDICTED',
            message: 'Conflict predicted: UAL123 vs DAL456 at FL350. Recommend: UAL123 climb FL370 immediately.',
            involvedFlightIds: ['UAL123', 'DAL456'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'conflict-resolution',
      narrative: 'Resolution advisory: UAL123 climb to FL370. Executing... Aircraft climbing 2,000 ft/min.',
      spotlight: { type: 'flight', callsign: 'UAL123' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-001', verticalRateFpm: 2500, altitudeFt: 36000 },
        },
        {
          delay: 2000,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-001', altitudeFt: 37000, verticalRateFpm: 0 },
        },
        {
          delay: 2500,
          type: 'updatePrediction',
          payload: { id: 'PRED-QD-001', probability: 0.02, description: 'Conflict resolved - 2,000ft vertical separation established' },
        },
        {
          delay: 3500,
          type: 'removePrediction',
          payload: { id: 'PRED-QD-001' },
        },
        {
          delay: 3500,
          type: 'removeAlert',
          payload: { alertId: 'ALT-QD-CF01' },
        },
      ],
      autoAdvance: 6000,
    },
    {
      id: 'conflict-resolved',
      narrative: 'CONFLICT RESOLVED — 2,000 feet vertical separation now established. Aircraft safely separated.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 3000,
    },

    // [0:40-1:05] EMERGENCY DECLARATION
    {
      id: 'emergency-declared',
      narrative: 'MAYDAY MAYDAY — AAL777 squawking 7700! Engine fire declared! 156 souls on board!',
      spotlight: { type: 'flight', callsign: 'AAL777' },
      events: [
        {
          delay: 0,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-QD-EM01',
            severity: 'CRITICAL',
            alertType: 'LOSS_OF_SEPARATION',
            message: 'EMERGENCY: AAL777 squawking 7700 — ENGINE FIRE. Requesting immediate vectors to BOS. Souls: 156. Fuel: 2 hours.',
            involvedFlightIds: ['AAL777'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'emergency-priority',
      narrative: 'PRIORITY HANDLING — Vectoring all traffic clear of emergency aircraft. Direct routing to Boston Logan.',
      spotlight: { type: 'component', id: 'alerts' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-004', headingDeg: 135 },
        },
        {
          delay: 500,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-006', headingDeg: 45 },
        },
        {
          delay: 1000,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-003', headingDeg: 160, verticalRateFpm: -2500 },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'emergency-routing',
      narrative: 'AAL777 cleared direct BOS runway 4R. Emergency services alerted. All traffic clear.',
      spotlight: { type: 'flight', callsign: 'AAL777' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-003', altitudeFt: 22000 },
        },
        {
          delay: 2000,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-003', altitudeFt: 18000 },
        },
      ],
      autoAdvance: 5000,
    },

    // [1:05-1:25] SECTOR HANDOFF
    {
      id: 'handoff-initiate',
      narrative: 'SECTOR HANDOFF — SWA333 approaching sector boundary. Initiating handoff to Boston Center.',
      spotlight: { type: 'flight', callsign: 'SWA333' },
      events: [
        {
          delay: 0,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-QD-HO01',
            severity: 'INFO',
            alertType: 'DEVIATION_DETECTED',
            message: 'Handoff initiated: SWA333 transferring to Boston Center (BOS_34). Awaiting acceptance.',
            involvedFlightIds: ['SWA333'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'handoff-complete',
      narrative: 'Handoff accepted. SWA333 now under Boston Center control. Seamless transition complete.',
      spotlight: { type: 'component', id: 'strips' },
      events: [
        {
          delay: 0,
          type: 'removeAlert',
          payload: { alertId: 'ALT-QD-HO01' },
        },
        {
          delay: 1500,
          type: 'removeAlert',
          payload: { alertId: 'ALT-QD-EM01' },
        },
      ],
      autoAdvance: 4000,
    },

    // [1:25-1:45] AI OPTIMIZATION
    {
      id: 'ai-optimization',
      narrative: 'AI OPTIMIZATION — Route optimization opportunity detected. Potential savings across multiple flights.',
      spotlight: { type: 'component', id: 'predictions' },
      events: [
        {
          delay: 0,
          type: 'addPrediction',
          payload: {
            id: 'PRED-QD-OPT1',
            predictionType: 'ROUTE_OPTIMIZATION',
            involvedFlights: ['FFT999', 'NKS444', 'ASA601'],
            probability: 0.88,
            predictedTime: new Date(Date.now() + 60000).toISOString(),
            description: 'Direct routing available. Total savings: 2,400 lbs fuel, 8 minutes flight time.',
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'optimization-applied',
      narrative: 'Optimization applied — Three aircraft now on direct routing. Fuel saved: 2,400 lbs. Time saved: 8 minutes.',
      spotlight: { type: 'component', id: 'predictions' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-006', headingDeg: 15 },
        },
        {
          delay: 500,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-007', headingDeg: 200 },
        },
        {
          delay: 1000,
          type: 'updateTrack',
          payload: { trackId: 'TRK-QD-008', headingDeg: 75 },
        },
        {
          delay: 3000,
          type: 'removePrediction',
          payload: { id: 'PRED-QD-OPT1' },
        },
      ],
      autoAdvance: 6000,
    },

    // [1:45-2:00] FINALE
    {
      id: 'all-clear',
      narrative: 'ALL EVENTS RESOLVED — Conflict avoided. Emergency handled. Handoffs complete. Routes optimized.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
    {
      id: 'summary',
      narrative: 'ATCS-NG: AI-powered surveillance • Predictive conflict detection • Emergency prioritization • Seamless coordination • Continuous optimization',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
    {
      id: 'end',
      narrative: 'Quick Demo complete. Explore individual scenarios or start the Feature Guide for an in-depth walkthrough.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
  ],
};
