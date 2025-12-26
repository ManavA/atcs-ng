/**
 * Zoom-Aware Aircraft Marker for 2D Map
 *
 * Adjusts marker detail based on Leaflet zoom level:
 * - Zoom <7: Simple colored dots
 * - Zoom 7-10: Basic aircraft icons
 * - Zoom 10-13: Detailed icons with data blocks
 * - Zoom 13+: Full detail with windows, livery, animated effects
 */

import { useMemo } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Track } from '../../types';
import { getAirlineFromCallsign, getTrackColor, AIRCRAFT_TYPES } from '../../assets/airlines';
import { getLODFromLeafletZoom } from '../../utils/LODManager';

interface ZoomAwareAircraftMarkerProps {
  track: Track;
  isSelected: boolean;
  onSelect: (trackId: string) => void;
  showDataBlock: boolean;
  trailPositions?: [number, number][];
  zoom: number; // Current map zoom level
}

// Create rotated aircraft icon based on zoom level
function createZoomAwareIcon(
  heading: number,
  isSelected: boolean,
  track: Track,
  zoom: number
): L.DivIcon {
  const color = getTrackColor(track.visualState, isSelected, track.confidence);
  const lodLevel = getLODFromLeafletZoom(zoom);
  const airline = track.airline ? getAirlineFromCallsign(track.callsign) : null;

  // LOD 0: Simple dot (zoom < 7)
  if (lodLevel === 0) {
    const size = isSelected ? 10 : 6;
    return L.divIcon({
      className: 'aircraft-dot',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          box-shadow: 0 0 ${isSelected ? '8px' : '4px'} ${color};
          border: ${isSelected ? '2px solid #ffffff' : 'none'};
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // LOD 1: Basic icon (zoom 7-10)
  if (lodLevel === 1) {
    const size = isSelected ? 24 : 20;
    return L.divIcon({
      className: 'aircraft-marker-basic',
      html: `
        <div style="transform: rotate(${heading}deg);">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24">
            <path d="M12 2L8 10H4L6 12L4 14H8L12 22L16 14H20L18 12L20 10H16L12 2Z"
                  fill="${color}"
                  stroke="${isSelected ? '#ffffff' : '#000000'}"
                  stroke-width="1"
                  filter="drop-shadow(0 0 ${isSelected ? '6' : '3'}px ${color})"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // LOD 2+: Detailed icon with animations (zoom 10+)
  const size = lodLevel === 3 ? 36 : 28;
  let extraStyles = '';
  let badge = '';
  let overlays = '';

  // Visual state effects
  switch (track.visualState) {
    case 'hostile':
      extraStyles = 'animation: hostile-pulse 0.5s infinite;';
      badge = `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:12px;text-shadow:0 0 4px #ff0000;">${airline?.countryFlag || '🔴'}</div>`;
      overlays = '<div style="position:absolute;top:-20px;right:-20px;background:#ff0000;color:white;font-size:8px;padding:2px 4px;border-radius:2px;font-weight:700;">HOSTILE</div>';
      break;
    case 'hijacked':
      const corruption = track.dataCorruption || 0;
      extraStyles = corruption > 0.5
        ? 'animation: glitch 0.1s infinite; filter: blur(1px);'
        : 'animation: hijack-flash 0.3s infinite;';
      overlays = '<div style="position:absolute;top:-20px;right:-20px;background:#ff3300;color:white;font-size:8px;padding:2px 4px;border-radius:2px;font-weight:700;">HIJACK</div>';
      break;
    case 'ghost':
      extraStyles = 'animation: ghost-fade 1s infinite; opacity: 0.6;';
      overlays = '<div style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:9px;color:#6e7681;">GHOST</div>';
      break;
    case 'hero':
      extraStyles = 'animation: hero-glow 1s infinite;';
      overlays = '<div style="position:absolute;top:-20px;right:-20px;background:#00ff88;color:#0a0e14;font-size:8px;padding:2px 4px;border-radius:2px;font-weight:700;">EMERGENCY</div>';
      break;
  }

  // Airline badge
  if (airline && track.visualState !== 'hostile' && lodLevel >= 3) {
    badge = `<div style="position:absolute;top:-12px;left:-10px;font-size:10px;background:rgba(0,0,0,0.8);padding:2px 4px;border-radius:3px;border:1px solid ${color};">${airline.countryFlag}</div>`;
  }

  // Transponder off indicator
  const transponderOff = track.transponderActive === false && lodLevel >= 2
    ? `<div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);font-size:8px;color:#ff6600;font-weight:700;">NO XPDR</div>`
    : '';

  // Aircraft type indicator (LOD 3 only)
  const aircraftType = track.aircraftType && lodLevel >= 3
    ? `<div style="position:absolute;top:-10px;right:-10px;font-size:7px;color:${color};background:rgba(0,0,0,0.8);padding:1px 3px;border-radius:2px;">${track.aircraftType}</div>`
    : '';

  return L.divIcon({
    className: 'aircraft-marker-detailed',
    html: `
      <style>
        @keyframes hostile-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
        @keyframes hijack-flash { 0%, 100% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(45deg) brightness(1.3); } }
        @keyframes ghost-fade { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes hero-glow { 0%, 100% { filter: drop-shadow(0 0 6px #00ff88); } 50% { filter: drop-shadow(0 0 16px #00ff88) brightness(1.3); } }
        @keyframes glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-3px, 2px); }
          50% { transform: translate(3px, -2px); }
          75% { transform: translate(-2px, 3px); }
          100% { transform: translate(0); }
        }
      </style>
      <div class="aircraft-icon" style="position:relative;">
        ${badge}
        ${aircraftType}
        ${overlays}
        <div style="transform: rotate(${heading}deg);${extraStyles}">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
            ${lodLevel >= 3 ? `
              <!-- Detailed aircraft with fuselage, wings, tail -->
              <g>
                <!-- Fuselage -->
                <ellipse cx="12" cy="12" rx="1.5" ry="5" fill="${color}" opacity="0.9"/>
                <!-- Main wings -->
                <path d="M6 12 L18 12 L17 14 L7 14 Z" fill="${color}" stroke="${isSelected ? '#ffffff' : color}" stroke-width="0.5"/>
                <!-- Tail wings -->
                <path d="M10 6 L14 6 L13.5 7.5 L10.5 7.5 Z" fill="${color}" opacity="0.8"/>
                <!-- Vertical stabilizer -->
                <path d="M12 3 L12 8 L13 7 L12 3 Z" fill="${color}" opacity="0.7"/>
                <!-- Engines (if widebody) -->
                ${track.aircraftType?.includes('A380') || track.aircraftType?.includes('777') ? `
                  <circle cx="9" cy="13" r="0.8" fill="#333333" stroke="${color}" stroke-width="0.3"/>
                  <circle cx="15" cy="13" r="0.8" fill="#333333" stroke="${color}" stroke-width="0.3"/>
                  <circle cx="7" cy="13" r="0.8" fill="#333333" stroke="${color}" stroke-width="0.3"/>
                  <circle cx="17" cy="13" r="0.8" fill="#333333" stroke="${color}" stroke-width="0.3"/>
                ` : `
                  <circle cx="8" cy="13" r="1" fill="#333333" stroke="${color}" stroke-width="0.3"/>
                  <circle cx="16" cy="13" r="1" fill="#333333" stroke="${color}" stroke-width="0.3"/>
                `}
              </g>
            ` : `
              <!-- Basic aircraft icon -->
              <path d="M12 2L8 10H4L6 12L4 14H8L12 22L16 14H20L18 12L20 10H16L12 2Z"
                    fill="${color}"
                    stroke="${isSelected ? '#ffffff' : '#000000'}"
                    stroke-width="1"
                    filter="drop-shadow(0 0 ${isSelected ? '8' : '4'}px ${color})"/>
            `}
          </svg>
        </div>
        ${transponderOff}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Format altitude for display
function formatAltitude(altFt: number): string {
  if (altFt >= 18000) {
    return `FL${Math.round(altFt / 100)}`;
  }
  return `${Math.round(altFt / 100) * 100}'`;
}

// Format vertical rate
function formatVerticalRate(vRate: number): string {
  if (Math.abs(vRate) < 100) return '→';
  return vRate > 0 ? '↑' : '↓';
}

export function ZoomAwareAircraftMarker({
  track,
  isSelected,
  onSelect,
  showDataBlock,
  trailPositions = [],
  zoom,
}: ZoomAwareAircraftMarkerProps) {
  const lodLevel = getLODFromLeafletZoom(zoom);

  const icon = useMemo(
    () => createZoomAwareIcon(track.headingDeg, isSelected, track, zoom),
    [track.headingDeg, isSelected, track.confidence, track.visualState, track.dataCorruption,
     track.transponderActive, track.airline, track.callsign, track.aircraftType, zoom]
  );

  // Get airline info for popup
  const airlineInfo = useMemo(() => getAirlineFromCallsign(track.callsign), [track.callsign]);
  const aircraftInfo = track.aircraftType ? AIRCRAFT_TYPES[track.aircraftType] : null;

  const position: [number, number] = [track.latitudeDeg, track.longitudeDeg];

  return (
    <>
      {/* Trail line (only at LOD 1+) */}
      {lodLevel >= 1 && trailPositions.length > 1 && (
        <Polyline
          positions={trailPositions}
          pathOptions={{
            color: isSelected ? '#00d4ff' : '#00ff88',
            weight: lodLevel >= 2 ? 2 : 1,
            opacity: lodLevel >= 2 ? 0.6 : 0.4,
            dashArray: lodLevel >= 3 ? undefined : '4, 4',
          }}
        />
      )}

      {/* Aircraft marker */}
      <Marker
        position={position}
        icon={icon}
        eventHandlers={{
          click: () => onSelect(track.trackId),
        }}
      >
        {/* Popup with details (LOD 2+) */}
        {lodLevel >= 2 && (
          <Popup className="aircraft-popup">
            <div className="popup-content" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: lodLevel >= 3 ? 12 : 11,
              minWidth: lodLevel >= 3 ? 200 : 180,
            }}>
              <div className="popup-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: '1px solid rgba(0, 255, 136, 0.3)',
              }}>
                {airlineInfo && (
                  <span style={{ fontSize: lodLevel >= 3 ? 16 : 14 }}>{airlineInfo.countryFlag}</span>
                )}
                <span style={{
                  fontWeight: 700,
                  fontSize: lodLevel >= 3 ? 14 : 12,
                  color: getTrackColor(track.visualState, false, track.confidence),
                }}>
                  {track.callsign}
                </span>
                {track.visualState === 'hostile' && (
                  <span style={{
                    background: '#ff0000',
                    color: 'white',
                    fontSize: 8,
                    padding: '2px 5px',
                    borderRadius: 3,
                    fontWeight: 700,
                  }}>HOSTILE</span>
                )}
                {track.squawkCode === '7500' && (
                  <span style={{
                    background: '#ff3300',
                    color: 'white',
                    fontSize: 8,
                    padding: '2px 5px',
                    borderRadius: 3,
                    fontWeight: 700,
                  }}>HIJACK</span>
                )}
              </div>

              {/* Airline & Aircraft info */}
              {(airlineInfo || aircraftInfo) && (
                <div style={{ marginBottom: 8, color: '#8b949e', fontSize: 10 }}>
                  {airlineInfo && <div>{airlineInfo.name}</div>}
                  {aircraftInfo && <div>{aircraftInfo.name}</div>}
                  {track.souls && <div style={{ color: '#00d4ff', fontWeight: 600 }}>{track.souls} souls on board</div>}
                </div>
              )}

              <div className="popup-data" style={{
                display: 'grid',
                gridTemplateColumns: lodLevel >= 3 ? '1fr 1fr 1fr' : '1fr 1fr',
                gap: lodLevel >= 3 ? 4 : 2,
                fontSize: lodLevel >= 3 ? 11 : 10,
              }}>
                <div><strong>ALT:</strong> {formatAltitude(track.altitudeFt)}</div>
                <div><strong>SPD:</strong> {track.speedKt} KT</div>
                <div><strong>HDG:</strong> {Math.round(track.headingDeg)}°</div>
                <div><strong>V/S:</strong> {track.verticalRateFpm > 0 ? '+' : ''}{track.verticalRateFpm}</div>
                {lodLevel >= 3 && track.squawkCode && (
                  <div><strong>SQ:</strong> {track.squawkCode}</div>
                )}
              </div>

              {track.transponderActive === false && (
                <div style={{
                  marginTop: 8,
                  padding: 5,
                  background: 'rgba(255, 102, 0, 0.2)',
                  border: '1px solid #ff6600',
                  borderRadius: 3,
                  color: '#ff6600',
                  fontSize: 9,
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  ⚠ TRANSPONDER INACTIVE
                </div>
              )}
            </div>
          </Popup>
        )}
      </Marker>

      {/* Data block overlay (LOD 2+ and when enabled) */}
      {showDataBlock && lodLevel >= 2 && (
        <DataBlock track={track} isSelected={isSelected} lodLevel={lodLevel} />
      )}
    </>
  );
}

// Data block component positioned near aircraft
function DataBlock({ track, isSelected, lodLevel }: { track: Track; isSelected: boolean; lodLevel: number }) {
  const dataBlockIcon = L.divIcon({
    className: 'data-block-marker',
    html: `
      <div class="data-block ${isSelected ? 'selected' : ''}" style="
        position: absolute;
        left: ${lodLevel >= 3 ? '24px' : '20px'};
        top: ${lodLevel >= 3 ? '-24px' : '-20px'};
        font-family: 'JetBrains Mono', monospace;
        font-size: ${lodLevel >= 3 ? '11px' : '10px'};
        color: ${isSelected ? '#00d4ff' : '#00ff88'};
        text-shadow: 0 0 ${lodLevel >= 3 ? '6px' : '4px'} currentColor;
        white-space: nowrap;
        pointer-events: none;
        font-weight: ${lodLevel >= 3 ? '600' : '500'};
        background: ${lodLevel >= 3 ? 'rgba(10, 14, 20, 0.7)' : 'transparent'};
        padding: ${lodLevel >= 3 ? '4px 6px' : '0'};
        border-radius: ${lodLevel >= 3 ? '3px' : '0'};
        border: ${lodLevel >= 3 && isSelected ? '1px solid currentColor' : 'none'};
      ">
        <div style="font-weight: bold;">${track.callsign}</div>
        <div>${formatAltitude(track.altitudeFt)} ${formatVerticalRate(track.verticalRateFpm)}</div>
        <div>${track.speedKt} KT</div>
        ${lodLevel >= 3 ? `<div>${Math.round(track.headingDeg)}°</div>` : ''}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <Marker
      position={[track.latitudeDeg, track.longitudeDeg]}
      icon={dataBlockIcon}
      interactive={false}
    />
  );
}
