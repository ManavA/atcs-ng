import { create } from 'zustand';

export type ViewMode = '2d' | '3d';
export type PresentationMode = 'cinematic' | 'professional' | 'silent';
export type AppMode = 'demo' | 'live';

// Command log entry for ATC commands
export interface CommandLogEntry {
  id: string;
  timestamp: Date;
  callsign: string;
  command: string;
  type: 'heading' | 'altitude' | 'speed' | 'squawk' | 'frequency' | 'hold' | 'other';
}

interface UIState {
  // App mode (demo vs live)
  appMode: AppMode;

  // Live only mode - skip all demo data, show only real data
  liveOnly: boolean;

  // View settings
  viewMode: ViewMode;
  showDataBlocks: boolean;
  showTrails: boolean;
  showWeather: boolean;
  show4DTrajectories: boolean;

  // Audio settings
  narrationEnabled: boolean;
  atcAudioEnabled: boolean;
  alertSoundsEnabled: boolean;
  autoTranslate: boolean;
  audioVolume: number;

  // Simulation speed (1x, 2x, 4x, 8x, 16x for demo, 75x-300x for live)
  simulationSpeed: number;

  // Track following
  trackedFlightId: string | null;

  // Command log
  commandLog: CommandLogEntry[];

  // Hero mode
  heroModeActive: boolean;

  // Time slider for 4D
  timeOffsetMinutes: number;
  playbackSpeed: number;
  isPlaying: boolean;

  // Presentation mode
  presentationMode: PresentationMode;

  // Panels
  showCommsPanel: boolean;
  showAIPanel: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleDataBlocks: () => void;
  toggleTrails: () => void;
  toggleWeather: () => void;
  toggle4DTrajectories: () => void;
  setTimeOffset: (minutes: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  togglePlayback: () => void;
  setPresentationMode: (mode: PresentationMode) => void;
  toggleCommsPanel: () => void;
  toggleAIPanel: () => void;
  setSimulationSpeed: (speed: number) => void;
  setAppMode: (mode: AppMode) => void;
  setTrackedFlightId: (id: string | null) => void;
  addCommandLog: (entry: Omit<CommandLogEntry, 'id' | 'timestamp'>) => void;
  clearCommandLog: () => void;
  setHeroModeActive: (active: boolean) => void;
  setLiveOnly: (liveOnly: boolean) => void;
  // Audio actions
  setNarrationEnabled: (enabled: boolean) => void;
  setAtcAudioEnabled: (enabled: boolean) => void;
  setAlertSoundsEnabled: (enabled: boolean) => void;
  setAutoTranslate: (enabled: boolean) => void;
  setAudioVolume: (volume: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // App mode - default to demo
  appMode: 'demo',

  // Live only mode - default to false (show demo if available)
  liveOnly: false,

  viewMode: '2d',
  showDataBlocks: true,
  showTrails: true,
  showWeather: true,
  show4DTrajectories: false,

  // Audio defaults
  narrationEnabled: true,
  atcAudioEnabled: true,
  alertSoundsEnabled: true,
  autoTranslate: true,
  audioVolume: 0.8,

  simulationSpeed: 4,  // Default 4x for demo, 150x for live

  // Track following
  trackedFlightId: null,

  // Command log
  commandLog: [],

  // Hero mode
  heroModeActive: false,
  timeOffsetMinutes: 0,
  playbackSpeed: 1,
  isPlaying: false,
  presentationMode: 'cinematic',
  showCommsPanel: false,
  showAIPanel: true,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleDataBlocks: () => set((s) => ({ showDataBlocks: !s.showDataBlocks })),
  toggleTrails: () => set((s) => ({ showTrails: !s.showTrails })),
  toggleWeather: () => set((s) => ({ showWeather: !s.showWeather })),
  toggle4DTrajectories: () => set((s) => ({ show4DTrajectories: !s.show4DTrajectories })),
  setTimeOffset: (minutes) => set({ timeOffsetMinutes: Math.max(0, Math.min(60, minutes)) }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  togglePlayback: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPresentationMode: (mode) => set({ presentationMode: mode }),
  toggleCommsPanel: () => set((s) => ({ showCommsPanel: !s.showCommsPanel })),
  toggleAIPanel: () => set((s) => ({ showAIPanel: !s.showAIPanel })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: Math.max(1, Math.min(300, speed)) }),
  setAppMode: (mode) => set({
    appMode: mode,
    // Reset speed when switching modes
    simulationSpeed: mode === 'demo' ? 4 : 150,
  }),
  setTrackedFlightId: (id) => set({ trackedFlightId: id }),
  addCommandLog: (entry) => set((s) => ({
    commandLog: [
      { ...entry, id: `cmd-${Date.now()}`, timestamp: new Date() },
      ...s.commandLog,
    ].slice(0, 50), // Keep last 50 commands
  })),
  clearCommandLog: () => set({ commandLog: [] }),
  setHeroModeActive: (active) => set({ heroModeActive: active }),
  setLiveOnly: (liveOnly) => set({ liveOnly }),
  // Audio actions
  setNarrationEnabled: (enabled) => set({ narrationEnabled: enabled }),
  setAtcAudioEnabled: (enabled) => set({ atcAudioEnabled: enabled }),
  setAlertSoundsEnabled: (enabled) => set({ alertSoundsEnabled: enabled }),
  setAutoTranslate: (enabled) => set({ autoTranslate: enabled }),
  setAudioVolume: (volume) => set({ audioVolume: Math.max(0, Math.min(1, volume)) }),
}));
