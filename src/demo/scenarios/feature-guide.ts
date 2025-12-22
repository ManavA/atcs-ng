import type { Scenario } from './types';

/**
 * Feature Guide - Interactive step-by-step walkthrough of all UI features
 * Self-paced with required interactions at each step
 * Designed for training and comprehensive feature discovery
 */
export const featureGuideScenario: Scenario = {
  id: 'feature-guide',
  title: 'Feature Guide',
  description: 'Interactive walkthrough of all ATCS-NG features. Self-paced with hands-on practice.',
  icon: 'book-open',
  duration: 15,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-FG-001',
        callsign: 'UAL100',
        latitudeDeg: 42.3,
        longitudeDeg: -71.5,
        altitudeFt: 35000,
        headingDeg: 90,
        speedKt: 450,
        verticalRateFpm: 0,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-FG-002',
        callsign: 'DAL200',
        latitudeDeg: 42.1,
        longitudeDeg: -71.2,
        altitudeFt: 28000,
        headingDeg: 180,
        speedKt: 420,
        verticalRateFpm: -500,
        confidence: 0.94,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-FG-003',
        callsign: 'AAL300',
        latitudeDeg: 41.9,
        longitudeDeg: -71.8,
        altitudeFt: 32000,
        headingDeg: 45,
        speedKt: 440,
        verticalRateFpm: 1000,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-FG-004',
        callsign: 'SWA400',
        latitudeDeg: 42.5,
        longitudeDeg: -70.9,
        altitudeFt: 24000,
        headingDeg: 270,
        speedKt: 380,
        verticalRateFpm: 0,
        confidence: 0.93,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
    ],
    alerts: [
      {
        alertId: 'ALT-FG-001',
        severity: 'INFO',
        alertType: 'DEVIATION_DETECTED',
        message: 'Advisory: DAL200 approaching sector boundary. Handoff recommended in 5 minutes.',
        involvedFlightIds: ['DAL200'],
        sectorId: 'BOS_33',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      },
    ],
    predictions: [
      {
        id: 'PRED-FG-001',
        predictionType: 'ROUTE_OPTIMIZATION',
        involvedFlights: ['AAL300'],
        probability: 0.72,
        predictedTime: new Date(Date.now() + 300000).toISOString(),
        description: 'Direct routing available to destination. Potential savings: 340 lbs fuel.',
      },
    ],
  },
  steps: [
    // ============================================
    // SECTION 1: RADAR DISPLAY (Steps 1-6)
    // ============================================
    {
      id: 'welcome',
      narrative: 'Welcome to the ATCS-NG Feature Guide. This interactive walkthrough will teach you every feature of the controller workstation. Take your time — each step waits for you.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 6000,
    },
    {
      id: 'radar-overview',
      narrative: 'RADAR SCOPE — This is your primary surveillance display. All aircraft in your sector appear here with real-time position updates. The scope uses WebGL for smooth 60fps rendering.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 6000,
    },
    {
      id: 'track-symbols',
      narrative: 'TRACK SYMBOLS — Each aircraft is represented by a symbol with a data block. The symbol shows position; the data block shows callsign and altitude. Green indicates normal operations.',
      spotlight: { type: 'flight', callsign: 'UAL100' },
      autoAdvance: 6000,
    },
    {
      id: 'track-select',
      narrative: 'Try clicking on an aircraft to select it. Selected aircraft are highlighted with additional details.',
      spotlight: { type: 'flight', callsign: 'UAL100' },
      interaction: {
        type: 'click',
        target: 'TRK-FG-001',
        hint: 'Click on UAL100 to select it',
      },
    },
    {
      id: 'track-details',
      narrative: 'Excellent! When selected, you can see extended information including heading, speed, and vertical rate. The flight strip on the right also highlights.',
      spotlight: { type: 'flight', callsign: 'UAL100' },
      autoAdvance: 5000,
    },
    {
      id: 'radar-controls',
      narrative: 'RADAR CONTROLS — Use scroll wheel to zoom, click-and-drag to pan. The radar automatically scales data blocks to avoid overlap at different zoom levels.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },

    // ============================================
    // SECTION 2: FLIGHT STRIPS (Steps 7-11)
    // ============================================
    {
      id: 'strips-intro',
      narrative: 'FLIGHT STRIPS — The right panel displays electronic flight strips for all aircraft in your sector. These replace paper strips with a digital, real-time interface.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 5000,
    },
    {
      id: 'strip-anatomy',
      narrative: 'Each strip shows: callsign, aircraft type, origin/destination, altitude, speed, and route. Status indicators show handoff state and any active alerts.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 5000,
    },
    {
      id: 'strip-select',
      narrative: 'Click on a flight strip to select that aircraft. The radar will center on it and show extended details.',
      spotlight: { type: 'component', id: 'strips' },
      interaction: {
        type: 'click',
        target: 'TRK-FG-002',
        hint: 'Click on the DAL200 flight strip',
      },
    },
    {
      id: 'strip-actions',
      narrative: 'Flight strips have quick action buttons: Amend (modify flight plan), Handoff (transfer to another sector), and Message (send CPDLC communication).',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 5000,
    },
    {
      id: 'strip-sorting',
      narrative: 'Strips can be sorted by callsign, altitude, or ETA. Use the sort controls at the top of the panel to organize your traffic list.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 4000,
    },

    // ============================================
    // SECTION 3: ALERTS SYSTEM (Steps 12-17)
    // ============================================
    {
      id: 'alerts-intro',
      narrative: 'ALERTS PANEL — The system continuously monitors for safety-critical conditions. When detected, alerts appear in the alerts panel with severity-coded colors.',
      spotlight: { type: 'component', id: 'alerts' },
      autoAdvance: 5000,
    },
    {
      id: 'alert-severities',
      narrative: 'SEVERITY LEVELS — CRITICAL (red): Immediate action required. WARNING (orange): Attention needed soon. INFO (blue): Awareness item, no immediate action.',
      spotlight: { type: 'component', id: 'alerts' },
      autoAdvance: 5000,
    },
    {
      id: 'alert-acknowledge',
      narrative: 'Alerts require acknowledgment to confirm you\'ve seen them. Click the acknowledge button on the current INFO alert.',
      spotlight: { type: 'alert', alertId: 'ALT-FG-001' },
      interaction: {
        type: 'acknowledge',
        target: 'ALT-FG-001',
        hint: 'Click the acknowledge button on the alert',
      },
    },
    {
      id: 'alert-acknowledged',
      narrative: 'Acknowledged alerts remain visible but are marked as seen. This creates an audit trail showing when each controller acknowledged each alert.',
      spotlight: { type: 'component', id: 'alerts' },
      autoAdvance: 4000,
    },
    {
      id: 'alert-escalation',
      narrative: 'Unacknowledged alerts escalate over time: visual intensity increases, and after 60 seconds, supervisor notification is triggered automatically.',
      spotlight: { type: 'component', id: 'alerts' },
      autoAdvance: 4000,
    },
    {
      id: 'alert-demo',
      narrative: 'Watch as a new WARNING alert appears. Notice the distinct visual treatment compared to INFO alerts.',
      spotlight: { type: 'component', id: 'alerts' },
      events: [
        {
          delay: 1000,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-FG-002',
            severity: 'WARNING',
            alertType: 'CONFLICT_PREDICTED',
            message: 'Traffic advisory: AAL300 climbing through DAL200 altitude. Monitor separation.',
            involvedFlightIds: ['AAL300', 'DAL200'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 5000,
    },

    // ============================================
    // SECTION 4: AI PREDICTIONS (Steps 18-22)
    // ============================================
    {
      id: 'predictions-intro',
      narrative: 'AI PREDICTIONS — ATCS-NG uses machine learning to predict future events: conflicts, optimal routes, weather impacts, and traffic patterns.',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 5000,
    },
    {
      id: 'prediction-types',
      narrative: 'PREDICTION TYPES — Conflict predictions show probability and time-to-impact. Optimization predictions show fuel and time savings. All predictions include confidence scores.',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 5000,
    },
    {
      id: 'prediction-click',
      narrative: 'Click on the route optimization prediction to see detailed information and available actions.',
      spotlight: { type: 'prediction', predictionId: 'PRED-FG-001' },
      interaction: {
        type: 'click',
        target: 'PRED-FG-001',
        hint: 'Click on the prediction card',
      },
    },
    {
      id: 'prediction-actions',
      narrative: 'Predictions offer actions: Accept (implement the recommendation), Dismiss (acknowledge but don\'t act), or View Details (see full analysis).',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 5000,
    },
    {
      id: 'ai-advisory',
      narrative: 'IMPORTANT: AI is always advisory. The controller retains full authority. All AI recommendations pass through safety validation before being offered.',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 5000,
    },

    // ============================================
    // SECTION 5: COMMUNICATIONS (Steps 23-26)
    // ============================================
    {
      id: 'comms-intro',
      narrative: 'COMMUNICATIONS — ATCS-NG supports Controller-Pilot Data Link Communications (CPDLC). Messages are sent digitally and delivery is confirmed.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 5000,
    },
    {
      id: 'comms-compose',
      narrative: 'To send a message, select a flight and click the Message action. Common clearances are available as templates for quick composition.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 5000,
    },
    {
      id: 'comms-status',
      narrative: 'Message status is tracked: SENT (transmitted), DELIVERED (received by aircraft), ACKNOWLEDGED (pilot confirmed). Failed messages trigger retry.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 4000,
    },
    {
      id: 'comms-audit',
      narrative: 'All communications are logged for audit. The playback feature allows reviewing communications history for training or incident investigation.',
      spotlight: { type: 'component', id: 'strips' },
      autoAdvance: 4000,
    },

    // ============================================
    // SECTION 6: CONCLUSION (Steps 27-28)
    // ============================================
    {
      id: 'summary',
      narrative: 'FEATURE GUIDE COMPLETE — You\'ve learned the core features: Radar display, Flight strips, Alerts system, AI predictions, and Communications.',
      spotlight: { type: 'component', id: 'radar' },
      events: [
        {
          delay: 0,
          type: 'removeAlert',
          payload: { alertId: 'ALT-FG-002' },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'next-steps',
      narrative: 'Explore the individual scenarios to see these features in action during realistic ATC situations. Or run the Quick Demo for a 2-minute showcase.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
  ],
};
