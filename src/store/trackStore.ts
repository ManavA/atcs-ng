import { create } from 'zustand';
import type { Track } from '../types';

interface TrackState {
  tracks: Track[];
  selectedTrackId: string | null;
  trackHistory: Map<string, [number, number][]>;

  // Actions
  setTracks: (tracks: Track[]) => void;
  selectTrack: (trackId: string | null) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  addTrackPosition: (trackId: string, position: [number, number]) => void;
}

const MAX_TRAIL_LENGTH = 20;

export const useTrackStore = create<TrackState>((set, get) => ({
  tracks: [],
  selectedTrackId: null,
  trackHistory: new Map(),

  setTracks: (tracks) => {
    // Update history for each track
    const history = new Map(get().trackHistory);
    tracks.forEach((track) => {
      const existing = history.get(track.trackId) || [];
      const newPos: [number, number] = [track.latitudeDeg, track.longitudeDeg];

      if (existing.length === 0 ||
          Math.abs(existing[existing.length - 1][0] - newPos[0]) > 0.001 ||
          Math.abs(existing[existing.length - 1][1] - newPos[1]) > 0.001) {
        existing.push(newPos);
        if (existing.length > MAX_TRAIL_LENGTH) existing.shift();
        history.set(track.trackId, existing);
      }
    });

    set({ tracks, trackHistory: history });
  },

  selectTrack: (trackId) => set({ selectedTrackId: trackId }),

  updateTrack: (trackId, updates) => set((state) => ({
    tracks: state.tracks.map((t) =>
      t.trackId === trackId ? { ...t, ...updates } : t
    ),
  })),

  addTrackPosition: (trackId, position) => set((state) => {
    const history = new Map(state.trackHistory);
    const existing = history.get(trackId) || [];
    existing.push(position);
    if (existing.length > MAX_TRAIL_LENGTH) existing.shift();
    history.set(trackId, existing);
    return { trackHistory: history };
  }),
}));
