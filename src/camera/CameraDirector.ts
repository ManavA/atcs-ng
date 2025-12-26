/**
 * Camera Director - Cinematic Camera Choreography System
 *
 * Manages automatic camera movements to follow the action:
 * - Auto-zoom to aircraft during emergencies
 * - Smooth panning to follow tracked flights
 * - Cinematic establishing shots for scenario introductions
 * - Dynamic framing based on scene context
 */

import type { Track } from '../types';

export type ShotType = 'establishing' | 'follow' | 'close-up' | 'wide' | 'dramatic';

export interface CameraShot {
  type: ShotType;
  target?: string;          // Track ID to focus on
  targetPosition?: [number, number]; // Lat/lng to center on
  zoom: number;             // Leaflet zoom level (5-18) or 3D distance
  duration: number;         // Transition duration in ms
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
  padding?: number;         // Extra space around target (for 2D)
  angle?: number;           // Camera angle for 3D (degrees)
  height?: number;          // Camera height for 3D
}

export interface CameraDirectorConfig {
  defaultDuration: number;
  defaultEasing: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
  minZoom: number;
  maxZoom: number;
}

const DEFAULT_CONFIG: CameraDirectorConfig = {
  defaultDuration: 1500,
  defaultEasing: 'easeInOut',
  minZoom: 5,
  maxZoom: 15,
};

/**
 * Camera Director manages cinematic camera movements
 */
export class CameraDirector {
  private config: CameraDirectorConfig;
  private currentShot: CameraShot | null = null;
  private animationFrameId: number | null = null;
  private callbacks: {
    onZoomChange?: (zoom: number) => void;
    onCenterChange?: (center: [number, number]) => void;
    on3DCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
  } = {};

  constructor(config: Partial<CameraDirectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register callbacks for camera updates
   */
  registerCallbacks(callbacks: {
    onZoomChange?: (zoom: number) => void;
    onCenterChange?: (center: [number, number]) => void;
    on3DCameraChange?: (position: [number, number, number], target: [number, number, number]) => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Play a camera shot with smooth animation
   */
  playShot(shot: CameraShot): Promise<void> {
    return new Promise((resolve) => {
      // Cancel any ongoing animation
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }

      this.currentShot = shot;
      const startTime = Date.now();
      const duration = shot.duration || this.config.defaultDuration;
      const easing = shot.easing || this.config.defaultEasing;

      // Get current state (we'll need to interpolate from here)
      const startZoom = 8; // Default - would be read from actual camera in real implementation
      const targetZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, shot.zoom));

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.ease(progress, easing);

        // Interpolate zoom
        const currentZoom = startZoom + (targetZoom - startZoom) * easedProgress;

        // Notify zoom change
        if (this.callbacks.onZoomChange) {
          this.callbacks.onZoomChange(currentZoom);
        }

        // Notify center change if target position is set
        if (shot.targetPosition && this.callbacks.onCenterChange) {
          this.callbacks.onCenterChange(shot.targetPosition);
        }

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          this.animationFrameId = null;
          this.currentShot = null;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Create an establishing shot (wide view of entire sector)
   */
  createEstablishingShot(center: [number, number] = [42.0, -71.0]): CameraShot {
    return {
      type: 'establishing',
      targetPosition: center,
      zoom: 7,
      duration: 2000,
      easing: 'easeInOut',
    };
  }

  /**
   * Create a follow shot (medium zoom tracking a specific aircraft)
   */
  createFollowShot(track: Track): CameraShot {
    return {
      type: 'follow',
      target: track.trackId,
      targetPosition: [track.latitudeDeg, track.longitudeDeg],
      zoom: 11,
      duration: 1500,
      easing: 'easeInOut',
    };
  }

  /**
   * Create a close-up shot (tight zoom on aircraft for dramatic moments)
   */
  createCloseUpShot(track: Track): CameraShot {
    return {
      type: 'close-up',
      target: track.trackId,
      targetPosition: [track.latitudeDeg, track.longitudeDeg],
      zoom: 14,
      duration: 1800,
      easing: 'easeIn',
    };
  }

  /**
   * Create a dramatic shot (very close, slower zoom for maximum impact)
   */
  createDramaticShot(track: Track): CameraShot {
    return {
      type: 'dramatic',
      target: track.trackId,
      targetPosition: [track.latitudeDeg, track.longitudeDeg],
      zoom: 15,
      duration: 2500,
      easing: 'easeIn',
    };
  }

  /**
   * Create a wide shot (pull back to show context)
   */
  createWideShot(center: [number, number]): CameraShot {
    return {
      type: 'wide',
      targetPosition: center,
      zoom: 9,
      duration: 1500,
      easing: 'easeOut',
    };
  }

  /**
   * Stop current camera animation
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.currentShot = null;
  }

  /**
   * Get current active shot
   */
  getCurrentShot(): CameraShot | null {
    return this.currentShot;
  }

  /**
   * Easing functions for smooth animation
   */
  private ease(t: number, type: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut'): number {
    switch (type) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t * t;
      case 'easeOut':
        return 1 - Math.pow(1 - t, 3);
      case 'easeInOut':
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      default:
        return t;
    }
  }

  /**
   * Calculate optimal zoom level for viewing multiple tracks
   */
  calculateOptimalZoom(tracks: Track[]): number {
    if (tracks.length === 0) return 8;
    if (tracks.length === 1) return 12;

    // Calculate bounds
    const lats = tracks.map(t => t.latitudeDeg);
    const lngs = tracks.map(t => t.longitudeDeg);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate span
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // Map span to zoom level (rough approximation)
    // Larger span = need to zoom out more
    if (maxSpan > 10) return 5;
    if (maxSpan > 5) return 6;
    if (maxSpan > 2) return 7;
    if (maxSpan > 1) return 8;
    if (maxSpan > 0.5) return 9;
    if (maxSpan > 0.2) return 10;
    if (maxSpan > 0.1) return 11;
    return 12;
  }

  /**
   * Calculate center point for multiple tracks
   */
  calculateCenter(tracks: Track[]): [number, number] {
    if (tracks.length === 0) return [42.0, -71.0]; // Boston default

    const avgLat = tracks.reduce((sum, t) => sum + t.latitudeDeg, 0) / tracks.length;
    const avgLng = tracks.reduce((sum, t) => sum + t.longitudeDeg, 0) / tracks.length;

    return [avgLat, avgLng];
  }

  /**
   * Create automatic shot based on scenario context
   */
  createContextualShot(
    context: 'normal' | 'emergency' | 'conflict' | 'hero' | 'ghost',
    track: Track
  ): CameraShot {
    switch (context) {
      case 'emergency':
      case 'hero':
        return this.createCloseUpShot(track);
      case 'conflict':
        return this.createDramaticShot(track);
      case 'ghost':
        return this.createFollowShot(track);
      default:
        return this.createFollowShot(track);
    }
  }
}

/**
 * Global camera director instance
 */
export const globalCameraDirector = new CameraDirector();
