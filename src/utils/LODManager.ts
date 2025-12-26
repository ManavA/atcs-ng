/**
 * Level of Detail (LOD) Manager
 *
 * Manages rendering detail levels based on camera distance/zoom level.
 * Ensures optimal performance while maximizing visual quality at appropriate scales.
 */

export type LODLevel = 0 | 1 | 2 | 3;

export interface LODConfig {
  /** Distance thresholds in scene units (1 unit = 10,000 ft horizontal) */
  thresholds: {
    level0: number;  // Far: >50 units (~500 nm) - Simple dots
    level1: number;  // Medium: 10-50 units (100-500 nm) - Basic shapes
    level2: number;  // Close: 2-10 units (20-100 nm) - Detailed meshes
    level3: number;  // Max zoom: <2 units (<20 nm) - Full 3D models
  };
}

export const DEFAULT_LOD_CONFIG: LODConfig = {
  thresholds: {
    level0: 50,  // Beyond 50 units = dots only
    level1: 10,  // 10-50 units = basic SVG-like 3D shapes
    level2: 2,   // 2-10 units = detailed geometry
    level3: 0,   // <2 units = full detailed models
  },
};

export class LODManager {
  private config: LODConfig;
  private currentLevel: LODLevel = 1;
  private levelChangeCallbacks: Array<(level: LODLevel) => void> = [];

  constructor(config: LODConfig = DEFAULT_LOD_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate LOD level based on camera distance to object
   */
  calculateLOD(distance: number): LODLevel {
    if (distance > this.config.thresholds.level0) return 0;
    if (distance > this.config.thresholds.level1) return 1;
    if (distance > this.config.thresholds.level2) return 2;
    return 3;
  }

  /**
   * Calculate LOD based on camera distance and object position
   */
  calculateLODFromCamera(
    cameraPosition: [number, number, number],
    objectPosition: [number, number, number]
  ): LODLevel {
    const dx = cameraPosition[0] - objectPosition[0];
    const dy = cameraPosition[1] - objectPosition[1];
    const dz = cameraPosition[2] - objectPosition[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return this.calculateLOD(distance);
  }

  /**
   * Update current LOD level and trigger callbacks if changed
   */
  updateLevel(newLevel: LODLevel): void {
    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      this.levelChangeCallbacks.forEach(cb => cb(newLevel));
    }
  }

  /**
   * Get current LOD level
   */
  getLevel(): LODLevel {
    return this.currentLevel;
  }

  /**
   * Register callback for LOD level changes
   */
  onLevelChange(callback: (level: LODLevel) => void): () => void {
    this.levelChangeCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.levelChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.levelChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get recommended polygon count for current LOD level
   */
  getRecommendedPolyCount(): number {
    switch (this.currentLevel) {
      case 0: return 4;      // Minimal - just a dot/pyramid
      case 1: return 16;     // Low - basic cone/pyramid
      case 2: return 64;     // Medium - recognizable aircraft shape
      case 3: return 512;    // High - detailed fuselage, wings, tail
      default: return 16;
    }
  }

  /**
   * Should we render trails at this LOD level?
   */
  shouldRenderTrails(): boolean {
    return this.currentLevel >= 1;
  }

  /**
   * Should we render data blocks at this LOD level?
   */
  shouldRenderDataBlocks(): boolean {
    return this.currentLevel >= 2;
  }

  /**
   * Should we render detailed geometry (windows, engines, etc.)?
   */
  shouldRenderDetailedGeometry(): boolean {
    return this.currentLevel >= 3;
  }

  /**
   * Get particle count for engine effects based on LOD
   */
  getEngineEffectParticleCount(): number {
    switch (this.currentLevel) {
      case 3: return 100;  // Full particle effects
      case 2: return 20;   // Minimal particles
      default: return 0;   // No particles
    }
  }
}

/**
 * Global LOD manager instance
 */
export const globalLODManager = new LODManager();

/**
 * Calculate distance for 2D map zoom level (Leaflet)
 * Maps Leaflet zoom to approximate 3D camera distance
 */
export function leafletZoomToDistance(zoomLevel: number): number {
  // Leaflet zoom: 5 (far) to 15 (close)
  // Map to our distance scale: 50 (far) to 1 (close)
  // Exponential mapping for natural feel
  const normalized = (zoomLevel - 5) / 10; // 0 (far) to 1 (close)
  return 50 * Math.pow(0.02, normalized); // 50 -> 1
}

/**
 * Get LOD level from Leaflet zoom
 */
export function getLODFromLeafletZoom(zoomLevel: number): LODLevel {
  if (zoomLevel < 7) return 0;   // Zoomed way out
  if (zoomLevel < 10) return 1;  // Medium zoom
  if (zoomLevel < 13) return 2;  // Close zoom
  return 3;                      // Max zoom
}
