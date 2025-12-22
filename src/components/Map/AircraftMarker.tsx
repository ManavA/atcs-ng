import { useMemo } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Track } from '../../types';
import { getAirlineFromCallsign, getTrackColor, AIRCRAFT_TYPES } from '../../assets/airlines';

interface AircraftMarkerProps {
  track: Track;
  isSelected: boolean;
  onSelect: (trackId: string) => void;
  showDataBlock: boolean;
  trailPositions?: [number, number][];
}

// Create rotated aircraft icon with visual state support
function createAircraftIcon(
  heading: number,
  isSelected: boolean,
  track: Track
): L.DivIcon {
  const color = getTrackColor(track.visualState, isSelected, track.confidence);
  const size = isSelected ? 28 : 24;
  const airline = track.airline ? getAirlineFromCallsign(track.callsign) : null;

  // Visual effects based on state
  let extraStyles = '';
  let badge = '';

  switch (track.visualState) {
    case 'hostile':
      extraStyles = 'animation: hostile-pulse 0.5s infinite;';
      badge = `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:10px;">${airline?.countryFlag || '🔴'}</div>`;
      break;
    case 'hijacked':
      const corruption = track.dataCorruption || 0;
      extraStyles = corruption > 0.5
        ? 'animation: glitch 0.1s infinite; filter: blur(1px);'
        : 'animation: hijack-flash 0.3s infinite;';
      break;
    case 'ghost':
      extraStyles = 'animation: ghost-fade 1s infinite; opacity: 0.5;';
      break;
    case 'hero':
      extraStyles = 'animation: hero-glow 1s infinite;';
      break;
  }

  // Airline badge (small flag/icon)
  if (airline && track.visualState !== 'hostile') {
    badge = `<div style="position:absolute;top:-10px;left:-8px;font-size:8px;background:rgba(0,0,0,0.7);padding:1px 2px;border-radius:2px;">${airline.countryFlag}</div>`;
  }

  // Transponder off indicator
  const transponderOff = track.transponderActive === false
    ? `<div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);font-size:7px;color:#ff6600;">NO XPDR</div>`
    : '';

  return L.divIcon({
    className: 'aircraft-marker',
    html: `
      <style>
        @keyframes hostile-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes hijack-flash { 0%, 100% { filter: none; } 50% { filter: hue-rotate(30deg); } }
        @keyframes ghost-fade { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes hero-glow { 0%, 100% { filter: drop-shadow(0 0 4px #00ff88); } 50% { filter: drop-shadow(0 0 12px #00ff88); } }
        @keyframes glitch { 0% { transform: translate(0); } 25% { transform: translate(-2px, 1px); } 50% { transform: translate(2px, -1px); } 75% { transform: translate(-1px, 2px); } 100% { transform: translate(0); } }
      </style>
      <div class="aircraft-icon" style="position:relative;transform: rotate(${heading}deg);${extraStyles}">
        ${badge}
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L8 10H4L6 12L4 14H8L12 22L16 14H20L18 12L20 10H16L12 2Z"
                fill="${color}"
                stroke="${isSelected ? '#ffffff' : '#000000'}"
                stroke-width="1"
                filter="drop-shadow(0 0 ${isSelected ? '8' : '4'}px ${color})"/>
        </svg>
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

export function AircraftMarker({
  track,
  isSelected,
  onSelect,
  showDataBlock,
  trailPositions = [],
}: AircraftMarkerProps) {
  const icon = useMemo(
    () => createAircraftIcon(track.headingDeg, isSelected, track),
    [track.headingDeg, isSelected, track.confidence, track.visualState, track.dataCorruption, track.transponderActive, track.airline, track.callsign]
  );

  // Get airline info for popup
  const airlineInfo = useMemo(() => getAirlineFromCallsign(track.callsign), [track.callsign]);
  const aircraftInfo = track.aircraftType ? AIRCRAFT_TYPES[track.aircraftType] : null;

  const position: [number, number] = [track.latitudeDeg, track.longitudeDeg];

  return (
    <>
      {/* Trail line */}
      {trailPositions.length > 1 && (
        <Polyline
          positions={trailPositions}
          pathOptions={{
            color: isSelected ? '#00d4ff' : '#00ff88',
            weight: 1,
            opacity: 0.4,
            dashArray: '4, 4',
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
        <Popup className="aircraft-popup">
          <div className="popup-content" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            minWidth: 180,
          }}>
            <div className="popup-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
              paddingBottom: 6,
              borderBottom: '1px solid rgba(0, 255, 136, 0.3)',
            }}>
              {airlineInfo && (
                <span style={{ fontSize: 14 }}>{airlineInfo.countryFlag}</span>
              )}
              <span style={{
                fontWeight: 700,
                color: getTrackColor(track.visualState, false, track.confidence),
              }}>
                {track.callsign}
              </span>
              {track.visualState === 'hostile' && (
                <span style={{
                  background: '#ff0000',
                  color: 'white',
                  fontSize: 8,
                  padding: '1px 4px',
                  borderRadius: 2,
                  fontWeight: 700,
                }}>HOSTILE</span>
              )}
              {track.squawkCode === '7500' && (
                <span style={{
                  background: '#ff3300',
                  color: 'white',
                  fontSize: 8,
                  padding: '1px 4px',
                  borderRadius: 2,
                  fontWeight: 700,
                }}>HIJACK</span>
              )}
            </div>

            {/* Airline & Aircraft info */}
            {(airlineInfo || aircraftInfo) && (
              <div style={{ marginBottom: 6, color: '#8b949e', fontSize: 10 }}>
                {airlineInfo && <div>{airlineInfo.name}</div>}
                {aircraftInfo && <div>{aircraftInfo.name}</div>}
                {track.souls && <div style={{ color: '#00d4ff' }}>{track.souls} souls on board</div>}
              </div>
            )}

            <div className="popup-data" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <div>ALT: {formatAltitude(track.altitudeFt)}</div>
              <div>SPD: {track.speedKt} KT</div>
              <div>HDG: {Math.round(track.headingDeg)}°</div>
              <div>V/S: {track.verticalRateFpm > 0 ? '+' : ''}{track.verticalRateFpm}</div>
            </div>

            {track.transponderActive === false && (
              <div style={{
                marginTop: 6,
                padding: 4,
                background: 'rgba(255, 102, 0, 0.2)',
                borderRadius: 2,
                color: '#ff6600',
                fontSize: 9,
                textAlign: 'center',
              }}>
                TRANSPONDER INACTIVE
              </div>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Data block overlay */}
      {showDataBlock && (
        <DataBlock track={track} isSelected={isSelected} />
      )}
    </>
  );
}

// Data block component positioned near aircraft
function DataBlock({ track, isSelected }: { track: Track; isSelected: boolean }) {
  const dataBlockIcon = L.divIcon({
    className: 'data-block-marker',
    html: `
      <div class="data-block ${isSelected ? 'selected' : ''}" style="
        position: absolute;
        left: 20px;
        top: -20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: ${isSelected ? '#00d4ff' : '#00ff88'};
        text-shadow: 0 0 4px currentColor;
        white-space: nowrap;
        pointer-events: none;
      ">
        <div style="font-weight: bold;">${track.callsign}</div>
        <div>${formatAltitude(track.altitudeFt)} ${formatVerticalRate(track.verticalRateFpm)}</div>
        <div>${track.speedKt}</div>
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
