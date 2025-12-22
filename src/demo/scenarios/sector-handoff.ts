import type { Scenario } from './types';

export const sectorHandoffScenario: Scenario = {
  id: 'sector-handoff',
  title: 'Sector Handoff',
  description: 'Learn how aircraft are transferred between controller sectors',
  icon: 'arrow-right-left',
  duration: 1.5,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-DEMO-H01',
        callsign: 'DAL801',
        latitudeDeg: 42.4,
        longitudeDeg: -71.8,
        altitudeFt: 35000,
        headingDeg: 90,
        speedKt: 455,
        verticalRateFpm: 0,
        confidence: 0.97,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-H02',
        callsign: 'AAL902',
        latitudeDeg: 41.8,
        longitudeDeg: -71.5,
        altitudeFt: 31000,
        headingDeg: 45,
        speedKt: 430,
        verticalRateFpm: 500,
        confidence: 0.94,
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
      narrative: 'Airspace is divided into sectors, each managed by a controller. When aircraft fly from one sector to another, they must be "handed off" to the next controller.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
    {
      id: 'approaching-boundary',
      narrative: 'DAL801 is approaching the sector boundary (shown as a dashed line on the radar). It will soon enter the adjacent sector BOS_34.',
      spotlight: { type: 'flight', callsign: 'DAL801' },
      autoAdvance: 4000,
    },
    {
      id: 'handoff-pending',
      narrative: 'The system has automatically initiated a handoff request. Notice the flight strip for DAL801 now shows a pending handoff indicator.',
      spotlight: { type: 'component', id: 'strips' },
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-DEMO-H01',
            severity: 'INFO',
            alertType: 'DEVIATION_DETECTED', // Using as handoff type
            message: 'Handoff pending: DAL801 → Sector BOS_34. Aircraft 2nm from boundary.',
            involvedFlightIds: ['DAL801'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'accept-handoff',
      narrative: 'As the receiving controller, you would accept the handoff. Click to simulate accepting control of DAL801.',
      spotlight: { type: 'alert', alertId: 'ALT-DEMO-H01' },
      interaction: {
        type: 'click',
        target: 'ALT-DEMO-H01',
        hint: 'Click to accept the handoff',
      },
    },
    {
      id: 'handoff-complete',
      narrative: 'Handoff complete! DAL801 is now under your control. The flight strip color has updated to indicate active control, and the previous sector has been notified.',
      spotlight: { type: 'flight', callsign: 'DAL801' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-H01',
            longitudeDeg: -71.5,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'summary',
      narrative: 'Seamless handoffs ensure continuous monitoring of all aircraft. ATCS-NG automates the handoff process while giving controllers clear visibility and control.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
  ],
};
