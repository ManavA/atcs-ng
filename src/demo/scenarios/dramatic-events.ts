import type { Scenario } from './types';
import { emergencyScenarios } from './emergency-sequences';

export const crashScenario: Scenario = {
  id: 'aircraft-crash',
  title: 'Aircraft Down',
  description: 'Experience a dramatic aircraft crash emergency sequence',
  icon: 'flame',
  duration: 1,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-CRASH-01',
        callsign: 'N12345',
        latitudeDeg: 42.1,
        longitudeDeg: -71.3,
        altitudeFt: 5000,
        headingDeg: 180,
        speedKt: 200,
        verticalRateFpm: -6000,
        confidence: 0.85,
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
      narrative: 'Aircraft N12345 is experiencing a rapid uncontrolled descent.',
      spotlight: { type: 'flight', callsign: 'N12345' },
      autoAdvance: 3000,
    },
    {
      id: 'emergency',
      narrative: 'EMERGENCY - Aircraft is descending at over 6000 feet per minute!',
      spotlight: { type: 'component', id: 'radar' },
      events: [
        {
          delay: 1000,
          type: 'custom',
          payload: () => emergencyScenarios.crash('TRK-CRASH-01', { lat: 42.0, lng: -71.3 }),
        },
      ],
      autoAdvance: 8000,
    },
    {
      id: 'aftermath',
      narrative: 'Search and rescue operations have been initiated at the crash site.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 4000,
    },
  ],
};

export const nmacScenario: Scenario = {
  id: 'nmac-event',
  title: 'Near Mid-Air Collision',
  description: 'Two aircraft on collision course trigger TCAS alerts',
  icon: 'alert-triangle',
  duration: 0.75,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-NMAC-01',
        callsign: 'UAL456',
        latitudeDeg: 42.2,
        longitudeDeg: -71.4,
        altitudeFt: 35000,
        headingDeg: 90,
        speedKt: 450,
        verticalRateFpm: 0,
        confidence: 0.98,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-NMAC-02',
        callsign: 'DAL789',
        latitudeDeg: 42.2,
        longitudeDeg: -71.2,
        altitudeFt: 35000,
        headingDeg: 270,
        speedKt: 440,
        verticalRateFpm: 0,
        confidence: 0.97,
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
      narrative: 'Two aircraft are on converging paths at FL350.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 3000,
    },
    {
      id: 'alert',
      narrative: 'TCAS ALERT - Aircraft are within 5nm and closing!',
      spotlight: { type: 'component', id: 'alerts' },
      events: [
        {
          delay: 500,
          type: 'custom',
          payload: () => emergencyScenarios.nmac('TRK-NMAC-01', 'TRK-NMAC-02'),
        },
      ],
      autoAdvance: 6000,
    },
    {
      id: 'resolved',
      narrative: 'Conflict resolved - aircraft have safely separated.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 3000,
    },
  ],
};
