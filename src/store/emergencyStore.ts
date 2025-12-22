import { create } from 'zustand';

export type EmergencyType =
  | 'crash'
  | 'nmac'
  | 'weather-reroute'
  | 'mass-emergency'
  | 'incursion'
  | 'system-degradation';

export type EmergencyPhase =
  | 'idle'
  | 'warning'
  | 'active'
  | 'resolving'
  | 'resolved'
  | 'aftermath';

interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  phase: EmergencyPhase;
  involvedTrackIds: string[];
  startTime: number;
  location?: { lat: number; lng: number };
  metadata?: Record<string, unknown>;
}

interface EmergencyState {
  activeEmergencies: EmergencyEvent[];
  screenShake: { intensity: number; duration: number } | null;
  vignetteColor: string | null;

  // Actions
  triggerEmergency: (event: Omit<EmergencyEvent, 'phase' | 'startTime'>) => void;
  updateEmergencyPhase: (id: string, phase: EmergencyPhase) => void;
  clearEmergency: (id: string) => void;
  triggerScreenShake: (intensity: number, duration: number) => void;
  clearScreenShake: () => void;
  setVignetteColor: (color: string | null) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  activeEmergencies: [],
  screenShake: null,
  vignetteColor: null,

  triggerEmergency: (event) => set((state) => ({
    activeEmergencies: [
      ...state.activeEmergencies,
      { ...event, phase: 'warning', startTime: Date.now() },
    ],
  })),

  updateEmergencyPhase: (id, phase) => set((state) => ({
    activeEmergencies: state.activeEmergencies.map((e) =>
      e.id === id ? { ...e, phase } : e
    ),
  })),

  clearEmergency: (id) => set((state) => ({
    activeEmergencies: state.activeEmergencies.filter((e) => e.id !== id),
  })),

  triggerScreenShake: (intensity, duration) => set({
    screenShake: { intensity, duration }
  }),

  clearScreenShake: () => set({ screenShake: null }),

  setVignetteColor: (color) => set({ vignetteColor: color }),
}));
