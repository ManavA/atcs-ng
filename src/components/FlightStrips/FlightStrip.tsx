import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, AlertTriangle, Users } from 'lucide-react';
import type { Track, Flight } from '../../types';
import { AircraftSilhouette, getAircraftSize } from '../AircraftSilhouette';
import { getAirlineFromCallsign, AIRCRAFT_TYPES } from '../../assets/airlines';

interface FlightStripProps {
  track: Track;
  flight?: Flight;
  isSelected: boolean;
  onSelect: () => void;
  hasAlert?: boolean;
}

// Format altitude for display
function formatAltitude(altFt: number): string {
  if (altFt >= 18000) {
    return `FL${Math.round(altFt / 100).toString().padStart(3, '0')}`;
  }
  return `${Math.round(altFt / 100) * 100}`;
}

// Get vertical rate indicator
function VerticalIndicator({ rate }: { rate: number }) {
  if (Math.abs(rate) < 100) {
    return <Minus size={12} className="text-secondary" />;
  }
  if (rate > 0) {
    return <ArrowUp size={12} className="text-phosphor" />;
  }
  return <ArrowDown size={12} className="text-amber" />;
}

export function FlightStrip({
  track,
  flight,
  isSelected,
  onSelect,
  hasAlert = false,
}: FlightStripProps) {
  // Get airline info from callsign
  const airlineInfo = getAirlineFromCallsign(track.callsign);
  const aircraftType = track.aircraftType ? AIRCRAFT_TYPES[track.aircraftType] : null;
  const aircraftSize = track.aircraftType ? getAircraftSize(track.aircraftType) : 'narrow';
  const isMilitary = aircraftType?.category === 'military';

  // Estimate souls on board (passengers + crew)
  const souls = aircraftType?.typicalSeats
    ? Math.round(aircraftType.typicalSeats * 0.85) + 6 // 85% load + crew
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.02, x: 4 }}
      onClick={onSelect}
      className={`flight-strip ${isSelected ? 'selected' : ''} ${hasAlert ? 'has-alert' : ''}`}
      style={{
        background: isSelected
          ? 'linear-gradient(90deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05))'
          : hasAlert
            ? 'linear-gradient(90deg, rgba(255, 51, 102, 0.15), rgba(255, 51, 102, 0.05))'
            : 'rgba(21, 27, 35, 0.8)',
        border: `1px solid ${isSelected ? 'rgba(0, 212, 255, 0.5)' : hasAlert ? 'rgba(255, 51, 102, 0.5)' : 'rgba(0, 255, 136, 0.15)'}`,
        borderRadius: 6,
        padding: '8px 12px',
        marginBottom: 4,
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Alert indicator */}
      {hasAlert && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: '#ff3366',
          }}
        />
      )}

      {/* Callsign and status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {/* Country flag */}
          {airlineInfo && (
            <span style={{ fontSize: 14, lineHeight: 1 }} title={airlineInfo.name}>
              {airlineInfo.countryFlag}
            </span>
          )}
          {/* Aircraft silhouette */}
          <AircraftSilhouette
            size={aircraftSize}
            color={isSelected ? '#00d4ff' : airlineInfo?.color || '#00ff88'}
            width={18}
            isMilitary={isMilitary}
          />
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: isSelected ? '#00d4ff' : '#e6edf3',
            letterSpacing: 1,
          }}>
            {track.callsign}
          </span>
          {hasAlert && <AlertTriangle size={12} style={{ color: '#ff3366' }} />}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {flight && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#8b949e',
            }}>
              {flight.departureAirport} → {flight.arrivalAirport}
            </span>
          )}
          {/* Airline name badge */}
          {airlineInfo && (
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9,
              fontWeight: 600,
              color: airlineInfo.color,
              background: `${airlineInfo.color}20`,
              padding: '1px 4px',
              borderRadius: 2,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {airlineInfo.name}
            </span>
          )}
          {/* Souls on board */}
          {souls && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: '#6e7681',
            }} title="Souls on board">
              <Users size={9} />
              {souls}
            </span>
          )}
        </div>
      </div>

      {/* Altitude block */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 50,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <VerticalIndicator rate={track.verticalRateFpm} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 600,
            color: '#00ff88',
          }}>
            {formatAltitude(track.altitudeFt)}
          </span>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: '#6e7681',
        }}>
          {Math.abs(track.verticalRateFpm) > 100 ? `${track.verticalRateFpm > 0 ? '+' : ''}${track.verticalRateFpm}` : 'LVL'}
        </span>
      </div>

      {/* Speed block */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        minWidth: 45,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          fontWeight: 600,
          color: '#00d4ff',
        }}>
          {track.speedKt}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: '#6e7681',
        }}>
          {Math.round(track.headingDeg).toString().padStart(3, '0')}°
        </span>
      </div>
    </motion.div>
  );
}
