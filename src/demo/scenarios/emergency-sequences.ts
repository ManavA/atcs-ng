import { useEmergencyStore, type EmergencyType } from '../../store';

interface EmergencySequenceConfig {
  type: EmergencyType;
  trackIds: string[];
  location?: { lat: number; lng: number };
  duration: number;
}

export function triggerEmergencySequence(config: EmergencySequenceConfig) {
  const { triggerEmergency, updateEmergencyPhase, clearEmergency, triggerScreenShake, setVignetteColor } = useEmergencyStore.getState();

  const emergencyId = `emergency-${Date.now()}`;

  // Phase 1: Warning
  triggerEmergency({
    id: emergencyId,
    type: config.type,
    involvedTrackIds: config.trackIds,
    location: config.location,
  });

  // Phase 2: Active (after 2s)
  setTimeout(() => {
    updateEmergencyPhase(emergencyId, 'active');

    if (config.type === 'crash') {
      triggerScreenShake(8, 1000);
      setVignetteColor('rgba(255, 51, 102, 0.3)');
    } else if (config.type === 'nmac') {
      triggerScreenShake(4, 500);
      setVignetteColor('rgba(255, 170, 0, 0.2)');
    }
  }, 2000);

  // Phase 3: Resolving
  setTimeout(() => {
    updateEmergencyPhase(emergencyId, 'resolving');
    setVignetteColor(null);
  }, config.duration * 0.7);

  // Phase 4: Resolved
  setTimeout(() => {
    updateEmergencyPhase(emergencyId, 'resolved');
  }, config.duration * 0.9);

  // Cleanup
  setTimeout(() => {
    clearEmergency(emergencyId);
  }, config.duration);

  return emergencyId;
}

export const emergencyScenarios = {
  crash: (trackId: string, location: { lat: number; lng: number }) =>
    triggerEmergencySequence({
      type: 'crash',
      trackIds: [trackId],
      location,
      duration: 15000,
    }),

  nmac: (trackId1: string, trackId2: string) =>
    triggerEmergencySequence({
      type: 'nmac',
      trackIds: [trackId1, trackId2],
      duration: 10000,
    }),

  weatherReroute: (trackIds: string[]) =>
    triggerEmergencySequence({
      type: 'weather-reroute',
      trackIds,
      duration: 20000,
    }),

  massEmergency: (trackIds: string[]) =>
    triggerEmergencySequence({
      type: 'mass-emergency',
      trackIds,
      duration: 30000,
    }),

  incursion: (trackId: string, location: { lat: number; lng: number }) =>
    triggerEmergencySequence({
      type: 'incursion',
      trackIds: [trackId],
      location,
      duration: 12000,
    }),
};
