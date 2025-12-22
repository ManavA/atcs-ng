import type { Scenario } from './types';

export const conflictDetectionScenario: Scenario = {
  id: 'conflict-detection',
  title: 'Conflict Detection & Resolution',
  description: 'Watch the AI predict and help resolve a potential mid-air conflict',
  icon: 'alert-triangle',
  duration: 2,
  initialState: {
    tracks: [
      {
        trackId: 'TRK-DEMO-001',
        callsign: 'UAL123',
        latitudeDeg: 42.2,
        longitudeDeg: -71.8,
        altitudeFt: 35000,
        headingDeg: 90,
        speedKt: 450,
        verticalRateFpm: 0,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-002',
        callsign: 'DAL456',
        latitudeDeg: 42.2,
        longitudeDeg: -70.8,
        altitudeFt: 35000,
        headingDeg: 270,
        speedKt: 460,
        verticalRateFpm: 0,
        confidence: 0.93,
        sequence: 1,
        updatedAt: new Date().toISOString(),
      },
      {
        trackId: 'TRK-DEMO-003',
        callsign: 'AAL789',
        latitudeDeg: 41.5,
        longitudeDeg: -71.2,
        altitudeFt: 28000,
        headingDeg: 45,
        speedKt: 420,
        verticalRateFpm: 1500,
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
      narrative: 'Welcome to the Conflict Detection scenario. You\'ll see how ATCS-NG uses AI to predict potential conflicts between aircraft before they become dangerous.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
    {
      id: 'observe-aircraft',
      narrative: 'Notice UAL123 and DAL456 on the radar. They\'re both at FL350, flying directly toward each other. The AI is continuously analyzing their trajectories.',
      spotlight: { type: 'flight', callsign: 'UAL123' },
      autoAdvance: 5000,
    },
    {
      id: 'prediction-appears',
      narrative: 'The AI has detected a potential conflict! A prediction has appeared in the AI Predictions panel with an 87% probability of conflict in approximately 3 minutes.',
      spotlight: { type: 'component', id: 'predictions' },
      events: [
        {
          delay: 500,
          type: 'addPrediction',
          payload: {
            id: 'PRED-DEMO-001',
            predictionType: 'CONFLICT',
            involvedFlights: ['UAL123', 'DAL456'],
            probability: 0.87,
            predictedTime: new Date(Date.now() + 180000).toISOString(),
            description: 'High probability conflict at intersection - both aircraft at FL350 on converging headings',
          },
        },
      ],
      autoAdvance: 6000,
    },
    {
      id: 'click-prediction',
      narrative: 'Click on the prediction to see more details about the potential conflict.',
      spotlight: { type: 'prediction', predictionId: 'PRED-DEMO-001' },
      interaction: {
        type: 'click',
        target: 'PRED-DEMO-001',
        hint: 'Click the prediction card to view details',
      },
    },
    {
      id: 'resolution-advisory',
      narrative: 'The system recommends having UAL123 climb to FL370. This vertical separation will safely resolve the conflict while minimizing route deviation.',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 5000,
    },
    {
      id: 'aircraft-climbs',
      narrative: 'UAL123 is now climbing to FL370. Watch the altitude change in the flight strip and on the radar data block.',
      spotlight: { type: 'flight', callsign: 'UAL123' },
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-001',
            verticalRateFpm: 2000,
            altitudeFt: 36000,
          },
        },
        {
          delay: 2000,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-DEMO-001',
            altitudeFt: 37000,
            verticalRateFpm: 0,
          },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'conflict-resolved',
      narrative: 'Excellent! With 2,000 feet of vertical separation now established, the conflict probability has dropped to zero. The prediction is cleared.',
      spotlight: { type: 'component', id: 'predictions' },
      events: [
        {
          delay: 500,
          type: 'updatePrediction',
          payload: {
            id: 'PRED-DEMO-001',
            probability: 0.05,
            description: 'Conflict resolved - vertical separation established at FL370/FL350',
          },
        },
        {
          delay: 2000,
          type: 'removePrediction',
          payload: { id: 'PRED-DEMO-001' },
        },
      ],
      autoAdvance: 5000,
    },
    {
      id: 'summary',
      narrative: 'This scenario demonstrated how ATCS-NG\'s AI continuously monitors traffic, predicts conflicts minutes in advance, and provides resolution advisories to keep aircraft safely separated.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 5000,
    },
  ],
};
