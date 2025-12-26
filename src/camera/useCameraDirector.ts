/**
 * React Hook for Camera Director Integration
 *
 * Provides camera choreography control for Leaflet maps
 */

import { useEffect, useCallback, useRef } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { CameraDirector, type CameraShot } from './CameraDirector';
import type { Track } from '../types';

interface UseCameraDirectorOptions {
  map: LeafletMap | null;
  enabled?: boolean;
}

export function useCameraDirector({ map, enabled = true }: UseCameraDirectorOptions) {
  const directorRef = useRef<CameraDirector>(new CameraDirector());
  const currentAnimationRef = useRef<Promise<void> | null>(null);

  // Register map callbacks
  useEffect(() => {
    if (!map || !enabled) return;

    const director = directorRef.current;

    director.registerCallbacks({
      onZoomChange: (zoom) => {
        map.setZoom(zoom, { animate: true });
      },
      onCenterChange: (center) => {
        map.panTo(center, { animate: true, duration: 0.5 });
      },
    });
  }, [map, enabled]);

  /**
   * Play a camera shot
   */
  const playShot = useCallback(async (shot: CameraShot): Promise<void> => {
    if (!enabled) return;

    const director = directorRef.current;

    // Cancel any ongoing animation
    director.stop();

    // Play new shot
    currentAnimationRef.current = director.playShot(shot);
    await currentAnimationRef.current;
    currentAnimationRef.current = null;
  }, [enabled]);

  /**
   * Focus on a specific track with contextual zoom
   */
  const focusOnTrack = useCallback(async (
    track: Track,
    context: 'normal' | 'emergency' | 'conflict' | 'hero' | 'ghost' = 'normal'
  ): Promise<void> => {
    if (!enabled) return;

    const director = directorRef.current;
    const shot = director.createContextualShot(context, track);
    await playShot(shot);
  }, [enabled, playShot]);

  /**
   * Show establishing shot (wide view)
   */
  const showEstablishing = useCallback(async (center?: [number, number]): Promise<void> => {
    if (!enabled) return;

    const director = directorRef.current;
    const shot = director.createEstablishingShot(center);
    await playShot(shot);
  }, [enabled, playShot]);

  /**
   * Show close-up of track
   */
  const showCloseUp = useCallback(async (track: Track): Promise<void> => {
    if (!enabled) return;

    const director = directorRef.current;
    const shot = director.createCloseUpShot(track);
    await playShot(shot);
  }, [enabled, playShot]);

  /**
   * Follow a track at medium zoom
   */
  const followTrack = useCallback(async (track: Track): Promise<void> => {
    if (!enabled) return;

    const director = directorRef.current;
    const shot = director.createFollowShot(track);
    await playShot(shot);
  }, [enabled, playShot]);

  /**
   * Frame multiple tracks optimally
   */
  const frameTracks = useCallback(async (tracks: Track[]): Promise<void> => {
    if (!enabled || !map || tracks.length === 0) return;

    const director = directorRef.current;
    const center = director.calculateCenter(tracks);
    const zoom = director.calculateOptimalZoom(tracks);

    const shot: CameraShot = {
      type: 'wide',
      targetPosition: center,
      zoom,
      duration: 1500,
      easing: 'easeInOut',
    };

    await playShot(shot);
  }, [enabled, map, playShot]);

  /**
   * Stop any ongoing camera movement
   */
  const stop = useCallback(() => {
    const director = directorRef.current;
    director.stop();
    currentAnimationRef.current = null;
  }, []);

  return {
    playShot,
    focusOnTrack,
    showEstablishing,
    showCloseUp,
    followTrack,
    frameTracks,
    stop,
    director: directorRef.current,
  };
}
