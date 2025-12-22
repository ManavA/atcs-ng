import type { Scenario } from './types';

export const routeDeviationScenario: Scenario = {
  id: 'route-deviation',
  title: 'Route Deviation Detection',
  description: 'See how the system monitors and alerts on aircraft deviating from assigned routes',
  icon: 'navigation',
  duration: 1,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-DEMO-R01',
        callsign: 'ASA601',
        latitudeDeg: 42.3,
        longitudeDeg: -71.6,
        altitudeFt: 29000,
        headingDeg: 85,
        speedKt: 420,
        verticalRateFpm: 0,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-R02',
        callsign: 'UAL702',
        latitudeDeg: 41.9,
        longitudeDeg: -71.2,
        altitudeFt: 34000,
        headingDeg: 270,
        speedKt: 445,
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
    {
      id: 'intro',
      narrative: 'Aircraft must follow their assigned routes precisely. ATCS-NG continuously monitors for deviations and alerts controllers when aircraft stray from their flight paths.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
    {
      id: 'normal-operation',
      narrative: 'ASA601 is currently on its assigned route heading 085° toward Boston. The system is tracking its position relative to the filed flight plan.',
      spotlight: { type: 'flight', callsign: 'ASA601' },
      autoAdvance: 4000,
    },
    {
      id: 'deviation-occurs',
      narrative: 'ASA601 has started deviating from its assigned route! The aircraft is now 2.1nm off course and continuing to drift.',
      spotlight: { type: 'flight', callsign: 'ASA601' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-R01',
            headingDeg: 95,
            latitudeDeg: 42.28,
          },
        },
        {
          delay: 1500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-DEMO-R01',
            severity: 'INFO',
            alertType: 'DEVIATION_DETECTED',
            message: 'ASA601 deviating from assigned route - 2.1nm off course, heading 095° (assigned 085°)',
            involvedFlightIds: ['ASA601'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'view-alert',
      narrative: 'A deviation alert has appeared. Note this is an INFO-level alert - not immediately dangerous, but requires controller awareness.',
      spotlight: { type: 'alert', alertId: 'ALT-DEMO-R01' },
      autoAdvance: 4000,
    },
    {
      id: 'acknowledge-deviation',
      narrative: 'Acknowledge the deviation to indicate you\'ve noticed and will follow up with the pilot.',
      spotlight: { type: 'alert', alertId: 'ALT-DEMO-R01' },
      interaction: {
        type: 'acknowledge',
        target: 'ALT-DEMO-R01',
        hint: 'Acknowledge the deviation alert',
      },
    },
    {
      id: 'correction',
      narrative: 'After controller intervention, ASA601 is correcting back to its assigned route. The heading is returning to 085°.',
      spotlight: { type: 'flight', callsign: 'ASA601' },
      events: [
        {
          delay: 500,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-R01',
            headingDeg: 80,
          },
        },
        {
          delay: 2000,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-R01',
            headingDeg: 85,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'summary',
      narrative: 'Route deviation detection helps maintain orderly traffic flow and prevents aircraft from entering restricted airspace or conflicting with other traffic.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
  ],
};
