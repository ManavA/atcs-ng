import { useState, useEffect, useCallback, useRef } from 'react';
import type { Track } from '../types';

// Mock track data generator for demo
function generateMockTracks(): Track[] {
  const airlines = ['UAL', 'DAL', 'AAL', 'SWA', 'JBU', 'SKW', 'ASA', 'FFT'];
  const tracks: Track[] = [];

  for (let i = 0; i < 24; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNum = Math.floor(Math.random() * 9000) + 100;
    const baseLat = 41.5 + (Math.random() - 0.5) * 3;
    const baseLon = -71.5 + (Math.random() - 0.5) * 4;

    tracks.push({
      trackId: `TRK-${i.toString().padStart(4, '0')}`,
      callsign: `${airline}${flightNum}`,
      latitudeDeg: baseLat,
      longitudeDeg: baseLon,
      altitudeFt: Math.floor(Math.random() * 35000) + 5000,
      headingDeg: Math.floor(Math.random() * 360),
      speedKt: Math.floor(Math.random() * 200) + 250,
      verticalRateFpm: (Math.random() - 0.5) * 2000,
      confidence: 0.85 + Math.random() * 0.15,
      sequence: i,
      updatedAt: new Date().toISOString(),
    });
  }

  return tracks;
}

export function useTrackStream(sectorId?: string) {
  const [tracks, setTracks] = useState<Map<string, Track>>(new Map());
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize with mock data
    const initialTracks = generateMockTracks();
    const trackMap = new Map<string, Track>();
    initialTracks.forEach(t => trackMap.set(t.trackId, t));
    setTracks(trackMap);
    setConnected(true);

    // Simulate real-time updates
    intervalRef.current = window.setInterval(() => {
      setTracks(prev => {
        const updated = new Map(prev);
        updated.forEach((track, id) => {
          // Move aircraft based on heading and speed
          const speedNmPerSec = track.speedKt / 3600;
          const headingRad = (track.headingDeg * Math.PI) / 180;
          const dLat = (speedNmPerSec * Math.cos(headingRad)) / 60;
          const dLon = (speedNmPerSec * Math.sin(headingRad)) / (60 * Math.cos((track.latitudeDeg * Math.PI) / 180));

          // Update altitude
          let newAlt = track.altitudeFt + (track.verticalRateFpm / 60);
          if (newAlt > 45000) newAlt = 45000;
          if (newAlt < 1000) newAlt = 1000;

          // Occasionally change heading slightly
          let newHeading = track.headingDeg;
          if (Math.random() < 0.05) {
            newHeading = (newHeading + (Math.random() - 0.5) * 10 + 360) % 360;
          }

          // Occasionally change vertical rate
          let newVRate = track.verticalRateFpm;
          if (Math.random() < 0.1) {
            newVRate = (Math.random() - 0.5) * 2000;
          }

          updated.set(id, {
            ...track,
            latitudeDeg: track.latitudeDeg + dLat,
            longitudeDeg: track.longitudeDeg + dLon,
            altitudeFt: Math.round(newAlt),
            headingDeg: Math.round(newHeading),
            verticalRateFpm: Math.round(newVRate),
            sequence: track.sequence + 1,
            updatedAt: new Date().toISOString(),
          });
        });
        return updated;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sectorId]);

  const getTracksArray = useCallback(() => {
    return Array.from(tracks.values());
  }, [tracks]);

  return { tracks: getTracksArray(), connected, trackCount: tracks.size };
}
