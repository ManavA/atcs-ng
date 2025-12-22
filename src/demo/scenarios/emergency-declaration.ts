import type { Scenario } from './types';

export const emergencyDeclarationScenario: Scenario = {
  id: 'emergency-declaration',
  title: 'Emergency Declaration',
  description: 'Experience how the system prioritizes and handles aircraft emergencies',
  icon: 'siren',
  duration: 1.5,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-DEMO-E01',
        callsign: 'UAL999',
        latitudeDeg: 42.2,
        longitudeDeg: -71.4,
        altitudeFt: 28000,
        headingDeg: 180,
        speedKt: 380,
        verticalRateFpm: -1500,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-E02',
        callsign: 'SWA111',
        latitudeDeg: 41.9,
        longitudeDeg: -71.2,
        altitudeFt: 25000,
        headingDeg: 90,
        speedKt: 420,
        verticalRateFpm: 0,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-E03',
        callsign: 'JBU222',
        latitudeDeg: 42.0,
        longitudeDeg: -71.6,
        altitudeFt: 30000,
        headingDeg: 45,
        speedKt: 410,
        verticalRateFpm: 0,
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
      narrative: 'Aircraft emergencies require immediate attention and priority handling. This scenario shows how ATCS-NG helps controllers manage emergency situations.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
    {
      id: 'normal-traffic',
      narrative: 'Three aircraft are in the sector operating normally. UAL999 is descending through FL280 toward Boston Logan.',
      spotlight: { type: 'flight', callsign: 'UAL999' },
      autoAdvance: 4000,
    },
    {
      id: 'emergency-declared',
      narrative: 'EMERGENCY! UAL999 has squawked 7700 - the universal emergency code. The pilot reports an engine fire and requests immediate priority handling.',
      spotlight: { type: 'component', id: 'alerts' },
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-DEMO-E01',
            severity: 'CRITICAL',
            alertType: 'LOSS_OF_SEPARATION', // Using as emergency type
            message: 'EMERGENCY: UAL999 squawking 7700 - Engine fire declared. Requesting immediate vectors to BOS. Souls on board: 156.',
            involvedFlightIds: ['UAL999'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
      autoAdvance: 4000,
    },
    {
      id: 'priority-visual',
      narrative: 'The emergency aircraft is now highlighted with priority visual indicators. Notice the flight strip is emphasized and the radar track is enhanced.',
      spotlight: { type: 'flight', callsign: 'UAL999' },
      autoAdvance: 4000,
    },
    {
      id: 'acknowledge-emergency',
      narrative: 'Acknowledge the emergency to confirm you\'re providing priority handling.',
      spotlight: { type: 'alert', alertId: 'ALT-DEMO-E01' },
      interaction: {
        type: 'acknowledge',
        target: 'ALT-DEMO-E01',
        hint: 'Acknowledge the emergency alert',
      },
    },
    {
      id: 'clear-path',
      narrative: 'Other traffic is being vectored clear of the emergency aircraft\'s path. UAL999 has been given direct routing to Boston Logan runway 4R.',
      spotlight: { type: 'component', id: 'radar' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-E02',
            headingDeg: 120,
          },
        },
        {
          delay: 500,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-E03',
            headingDeg: 315,
          },
        },
        {
          delay: 1000,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-E01',
            headingDeg: 160,
            verticalRateFpm: -2000,
            altitudeFt: 25000,
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'summary',
      narrative: 'Emergency handling in ATCS-NG ensures critical situations get immediate attention with clear visual priority, automatic traffic coordination, and streamlined communications.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
  ],
};
