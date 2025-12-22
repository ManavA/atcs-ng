import { useMemo } from 'react';
import { useDemoMode } from '../DemoProvider';
import { useUIStore } from '../../store';
import type { Track, Alert, Prediction } from '../../types';

interface UseDemoDataOptions {
  tracks: Track[];
  alerts: Alert[];
  predictions: Prediction[];
}

interface UseDemoDataResult {
  tracks: Track[];
  alerts: Alert[];
  predictions: Prediction[];
  isDemoActive: boolean;
}

/**
 * Hook that merges regular data with demo data when demo mode is active.
 * Returns demo data when a scenario is playing, otherwise returns regular data.
 * When liveOnly is true, always returns regular data (no demo).
 */
export function useDemoData(regularData: UseDemoDataOptions): UseDemoDataResult {
  const { state } = useDemoMode();
  const { liveOnly } = useUIStore();

  // If liveOnly mode, never use demo data
  const isDemoActive = !liveOnly && state.isActive && state.mode !== 'menu';

  const tracks = useMemo(() => {
    if (isDemoActive && state.tracks.length > 0) {
      return state.tracks;
    }
    return regularData.tracks;
  }, [isDemoActive, state.tracks, regularData.tracks]);

  const alerts = useMemo(() => {
    if (isDemoActive && state.alerts.length > 0) {
      return state.alerts;
    }
    return regularData.alerts;
  }, [isDemoActive, state.alerts, regularData.alerts]);

  const predictions = useMemo(() => {
    if (isDemoActive && state.predictions.length > 0) {
      return state.predictions;
    }
    return regularData.predictions;
  }, [isDemoActive, state.predictions, regularData.predictions]);

  return {
    tracks,
    alerts,
    predictions,
    isDemoActive,
  };
}
