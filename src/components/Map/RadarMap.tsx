import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import type { Track } from '../../types';
import { ZoomAwareAircraftMarker } from './ZoomAwareAircraftMarker';
import { RadarSweepCanvas } from './RadarSweepCanvas';
import { useUIStore } from '../../store';
import { useCameraDirector } from '../../camera/useCameraDirector';
import 'leaflet/dist/leaflet.css';

interface RadarMapProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  showDataBlocks: boolean;
  showTrails: boolean;
  weatherOverlays?: WeatherOverlay[];
  sectorBoundaries?: SectorBoundary[];
}

interface WeatherOverlay {
  id: string;
  center: [number, number];
  radiusNm: number;
  severity: 'LIGHT' | 'MODERATE' | 'SEVERE' | 'EXTREME';
}

interface SectorBoundary {
  id: string;
  name: string;
  coordinates: [number, number][];
  isActive: boolean;
}

// Track position history for trails
const trackHistory = new Map<string, [number, number][]>();
const MAX_TRAIL_LENGTH = 20;

// Radar sweep animation component
function RadarSweep() {
  const map = useMap();
  const sweepRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = map.getContainer();
    const existingSweep = container.querySelector('.radar-sweep-container');
    if (existingSweep) return;

    const sweepContainer = document.createElement('div');
    sweepContainer.className = 'radar-sweep-container';
    sweepContainer.innerHTML = `
      <div class="radar-sweep" style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        height: 200%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 400;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, rgba(0,255,136,0.5) 0%, rgba(0,255,136,0) 100%);
          transform-origin: 0% 50%;
          animation: radar-sweep 4s linear infinite;
        "></div>
      </div>
    `;
    container.appendChild(sweepContainer);
    sweepRef.current = sweepContainer;

    return () => {
      if (sweepRef.current && container.contains(sweepRef.current)) {
        container.removeChild(sweepRef.current);
      }
    };
  }, [map]);

  return null;
}

// Range rings component
function RangeRings({ center }: { center: [number, number] }) {
  const rings = [10, 25, 50, 100]; // nautical miles

  return (
    <>
      {rings.map((radiusNm) => (
        <Circle
          key={radiusNm}
          center={center}
          radius={radiusNm * 1852} // Convert nm to meters
          pathOptions={{
            color: 'rgba(0, 255, 136, 0.15)',
            weight: 1,
            fill: false,
            dashArray: '4, 8',
          }}
        />
      ))}
    </>
  );
}

// Weather overlay visualization
function WeatherOverlays({ overlays }: { overlays: WeatherOverlay[] }) {
  const getColor = (severity: WeatherOverlay['severity']) => {
    switch (severity) {
      case 'EXTREME': return 'rgba(255, 51, 102, 0.5)';
      case 'SEVERE': return 'rgba(255, 170, 0, 0.4)';
      case 'MODERATE': return 'rgba(255, 255, 0, 0.3)';
      default: return 'rgba(0, 212, 255, 0.2)';
    }
  };

  return (
    <>
      {overlays.map((overlay) => (
        <Circle
          key={overlay.id}
          center={overlay.center}
          radius={overlay.radiusNm * 1852}
          pathOptions={{
            color: getColor(overlay.severity),
            fillColor: getColor(overlay.severity),
            fillOpacity: 0.3,
            weight: 2,
          }}
        />
      ))}
    </>
  );
}

// Sector boundaries visualization
function SectorBoundaries({ sectors }: { sectors: SectorBoundary[] }) {
  return (
    <>
      {sectors.map((sector) => (
        <Polyline
          key={sector.id}
          positions={sector.coordinates}
          pathOptions={{
            color: sector.isActive ? '#00d4ff' : '#6e7681',
            weight: sector.isActive ? 2 : 1,
            opacity: sector.isActive ? 0.8 : 0.4,
            dashArray: sector.isActive ? undefined : '8, 4',
          }}
        />
      ))}
    </>
  );
}

// Follow tracked flight
function MapFollower({ tracks }: { tracks: Track[] }) {
  const map = useMap();
  const { trackedFlightId } = useUIStore();

  useEffect(() => {
    if (!trackedFlightId) return;

    const trackedFlight = tracks.find(t => t.trackId === trackedFlightId);
    if (trackedFlight) {
      map.panTo([trackedFlight.latitudeDeg, trackedFlight.longitudeDeg], {
        animate: true,
        duration: 0.5,
      });
    }
  }, [map, trackedFlightId, tracks]);

  return null;
}

// Compass rose component
function CompassRose() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const existingRose = container.querySelector('.compass-rose-container');
    if (existingRose) return;

    const roseContainer = document.createElement('div');
    roseContainer.className = 'compass-rose-container';
    roseContainer.innerHTML = `
      <div style="
        position: absolute;
        top: 20px;
        right: 20px;
        width: 80px;
        height: 80px;
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Orbitron', monospace;
        font-size: 10px;
        color: #00ff88;
        z-index: 500;
        background: rgba(10, 14, 20, 0.8);
      ">
        <div style="position: absolute; top: 5px;">N</div>
        <div style="position: absolute; bottom: 5px;">S</div>
        <div style="position: absolute; left: 8px;">W</div>
        <div style="position: absolute; right: 8px;">E</div>
        <div style="
          width: 2px;
          height: 30px;
          background: linear-gradient(to bottom, #ff3366, #00ff88);
          position: absolute;
        "></div>
        <div style="
          width: 30px;
          height: 2px;
          background: rgba(0, 255, 136, 0.5);
          position: absolute;
        "></div>
      </div>
    `;
    container.appendChild(roseContainer);

    return () => {
      if (container.contains(roseContainer)) {
        container.removeChild(roseContainer);
      }
    };
  }, [map]);

  return null;
}

// Zoom tracker component
function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoom: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

// Camera director controller for automatic cinematic shots
function CameraController() {
  const map = useMap();
  const cameraDirector = useCameraDirector({ map, enabled: true });

  // Expose camera director to window for demo step access
  useEffect(() => {
    (window as any).__cameraDirector = cameraDirector;
    return () => {
      delete (window as any).__cameraDirector;
    };
  }, [cameraDirector]);

  return null;
}

export function RadarMap({
  tracks,
  selectedTrackId,
  onSelectTrack,
  showDataBlocks,
  showTrails,
  weatherOverlays = [],
  sectorBoundaries = [],
}: RadarMapProps) {
  // Default center: Boston area
  const defaultCenter: [number, number] = [42.0, -71.0];

  // Track current zoom level
  const [currentZoom, setCurrentZoom] = useState(8);

  // Container dimensions for RadarSweepCanvas
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Update track history for trails
  useEffect(() => {
    tracks.forEach((track) => {
      const history = trackHistory.get(track.trackId) || [];
      const newPos: [number, number] = [track.latitudeDeg, track.longitudeDeg];

      // Only add if position changed significantly
      if (history.length === 0 ||
          Math.abs(history[history.length - 1][0] - newPos[0]) > 0.001 ||
          Math.abs(history[history.length - 1][1] - newPos[1]) > 0.001) {
        history.push(newPos);
        if (history.length > MAX_TRAIL_LENGTH) {
          history.shift();
        }
        trackHistory.set(track.trackId, history);
      }
    });
  }, [tracks]);

  return (
    <div ref={containerRef} className="radar-map-container" style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Enhanced radar sweep canvas */}
      <RadarSweepCanvas
        width={containerWidth || 800}
        height={containerHeight || 600}
      />

      <MapContainer
        center={defaultCenter}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Zoom tracking */}
        <ZoomTracker onZoomChange={setCurrentZoom} />

        {/* Camera director for cinematic shots */}
        <CameraController />

        {/* Radar effects */}
        <RadarSweep />
        <CompassRose />
        <RangeRings center={defaultCenter} />
        <MapFollower tracks={tracks} />

        {/* Sector boundaries */}
        <SectorBoundaries sectors={sectorBoundaries} />

        {/* Weather overlays */}
        <WeatherOverlays overlays={weatherOverlays} />

        {/* Aircraft markers with zoom-aware detail */}
        {tracks.map((track) => (
          <ZoomAwareAircraftMarker
            key={track.trackId}
            track={track}
            isSelected={selectedTrackId === track.trackId}
            onSelect={onSelectTrack}
            showDataBlock={showDataBlocks}
            trailPositions={showTrails ? trackHistory.get(track.trackId) : undefined}
            zoom={currentZoom}
          />
        ))}
      </MapContainer>

      {/* Map overlay controls */}
      <div className="map-controls" style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        display: 'flex',
        gap: 8,
        zIndex: 1000,
      }}>
        <div style={{
          background: 'rgba(13, 17, 23, 0.9)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: 4,
          padding: '8px 12px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: '#00ff88',
        }}>
          <span style={{ opacity: 0.7 }}>TRK:</span> {tracks.length}
        </div>
      </div>

      {/* Scanline effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)',
        zIndex: 999,
      }} />
    </div>
  );
}

export default RadarMap;
