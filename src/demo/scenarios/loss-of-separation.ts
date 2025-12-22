import type { Scenario } from './types';

export const lossOfSeparationScenario: Scenario = {
  id: 'loss-of-separation',
  title: 'Loss of Separation',
  description: 'Experience how the system handles critical separation alerts',
  icon: 'shield',
  duration: 1,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-DEMO-L01',
        callsign: 'FFT401',
        latitudeDeg: 42.1,
        longitudeDeg: -71.3,
        altitudeFt: 33000,
        headingDeg: 180,
        speedKt: 440,
        verticalRateFpm: 0,
        confidence: 0.94,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-L02',
        callsign: 'SKW502',
        latitudeDeg: 42.05,
        longitudeDeg: -71.28,
        altitudeFt: 33200,
        headingDeg: 350,
        speedKt: 435,
        verticalRateFpm: 0,
        confidence: 0.92,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
    ],
    alerts: [],
    predictions: [],
  },
  steps: [
    {
      id: 'intro',
      narrative: 'This scenario demonstrates how ATCS-NG handles the most critical situation in air traffic control: loss of separation between aircraft.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
    {
      id: 'aircraft-close',
      narrative: 'FFT401 and SKW502 are dangerously close - only 3.2nm lateral separation and 200ft vertical. This violates the required 5nm/1000ft minimum.',
      spotlight: { type: 'flight', callsign: 'FFT401' },
      autoAdvance: 4000,
    },
    {
      id: 'critical-alert',
      narrative: 'CRITICAL ALERT! The system has detected loss of separation. This is the highest priority alert - notice the flashing red indicator and urgent styling.',
      spotlight: { type: 'component', id: 'alerts' },
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-DEMO-L01',
            severity: 'CRITICAL',
            alertType: 'LOSS_OF_SEPARATION',
            message: 'LOSS OF SEPARATION: FFT401 and SKW502 - 3.2nm lateral, 200ft vertical. Immediate action required!',
            involvedFlightIds: ['FFT401', 'SKW502'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'acknowledge-critical',
      narrative: 'Critical alerts require immediate acknowledgment to confirm the controller is aware and taking action.',
      spotlight: { type: 'alert', alertId: 'ALT-DEMO-L01' },
      interaction: {
        type: 'acknowledge',
        target: 'ALT-DEMO-L01',
        hint: 'Acknowledge the critical alert immediately',
      },
    },
    {
      id: 'separation-restored',
      narrative: 'Emergency separation maneuvers are in progress. FFT401 is descending while SKW502 climbs to restore safe separation.',
      spotlight: { type: 'component', id: 'radar' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-L01',
            verticalRateFpm: -2500,
            altitudeFt: 31000,
          },
        },
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-L02',
            verticalRateFpm: 2500,
            altitudeFt: 35000,
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'summary',
      narrative: 'Loss of separation events are rare but critical. ATCS-NG ensures controllers are immediately alerted with clear, actionable information to restore safety.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
  ],
};
