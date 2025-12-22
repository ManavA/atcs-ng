import { useState, useEffect } from 'react';
import type { Prediction } from '../types';

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    // Mock predictions
    const mockPredictions: Prediction[] = [
      {
        id: 'PRED-001',
        predictionType: 'CONFLICT',
        involvedFlights: ['UAL123', 'DAL456'],
        probability: 0.87,
        predictedTime: new Date(Date.now() + 180000).toISOString(),
        description: 'High probability conflict in 3 minutes at intersection BOSSS',
      },
      {
        id: 'PRED-002',
        predictionType: 'CONFLICT',
        involvedFlights: ['AAL789', 'SWA101'],
        probability: 0.65,
        predictedTime: new Date(Date.now() + 270000).toISOString(),
        description: 'Moderate probability conflict at FL350',
      },
    ];

    setPredictions(mockPredictions);
  }, []);

  return { predictions };
}
