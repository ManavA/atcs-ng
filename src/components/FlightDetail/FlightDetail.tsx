import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Navigation,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
  Radio,
  MapPin,
  Route,
  Send,
  Users,
  Building2,
} from 'lucide-react';
import type { Track, Flight } from '../../types';
import { AircraftSilhouette, getAircraftSize } from '../AircraftSilhouette';
import { getAirlineFromCallsign, AIRCRAFT_TYPES } from '../../assets/airlines';
import { useUIStore } from '../../store';

interface FlightDetailProps {
  track: Track | null;
  flight?: Flight | null;
  onClose: () => void;
  onSendMessage?: (callsign: string) => void;
}

function formatAltitude(altFt: number): string {
  if (altFt >= 18000) {
    return `FL${Math.round(altFt / 100).toString().padStart(3, '0')}`;
  }
  return `${Math.round(altFt / 100) * 100} ft`;
}

function formatVerticalRate(rate: number): { icon: typeof ArrowUp; color: string; text: string } {
  if (Math.abs(rate) < 100) {
    return { icon: Minus, color: '#8b949e', text: 'Level' };
  }
  if (rate > 0) {
    return { icon: ArrowUp, color: '#00ff88', text: `+${rate} fpm` };
  }
  return { icon: ArrowDown, color: '#ffaa00', text: `${rate} fpm` };
}

function formatCoordinate(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  const latDeg = Math.abs(lat).toFixed(4);
  const lonDeg = Math.abs(lon).toFixed(4);
  return `${latDeg}°${latDir} ${lonDeg}°${lonDir}`;
}

export function FlightDetail({
  track,
  flight,
  onClose,
  onSendMessage,
}: FlightDetailProps) {
  if (!track) return null;

  const verticalInfo = formatVerticalRate(track.verticalRateFpm);
  const VerticalIcon = verticalInfo.icon;

  // Get airline and aircraft info
  const airlineInfo = getAirlineFromCallsign(track.callsign);
  const aircraftType = track.aircraftType ? AIRCRAFT_TYPES[track.aircraftType] : null;
  const aircraftSize = track.aircraftType ? getAircraftSize(track.aircraftType) : 'narrow';
  const isMilitary = aircraftType?.category === 'military';

  // Estimate souls on board
  const souls = aircraftType?.typicalSeats
    ? Math.round(aircraftType.typicalSeats * 0.85) + 6
    : null;

  // Track following state
  const { trackedFlightId, setTrackedFlightId } = useUIStore();
  const isTracking = trackedFlightId === track.trackId;

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 320,
            background: 'rgba(13, 17, 23, 0.95)',
            border: '1px solid rgba(0, 212, 255, 0.5)',
            borderRadius: 8,
            overflow: 'hidden',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.1)',
          }}
        >
          {/* Header with airline branding */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: airlineInfo
              ? `linear-gradient(90deg, ${airlineInfo.color}30, transparent)`
              : 'linear-gradient(90deg, rgba(0, 212, 255, 0.15), transparent)',
            borderBottom: `1px solid ${airlineInfo?.color || 'rgba(0, 212, 255, 0.3)'}50`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Country flag */}
              {airlineInfo && (
                <span style={{ fontSize: 24, lineHeight: 1 }}>
                  {airlineInfo.countryFlag}
                </span>
              )}
              {/* Aircraft silhouette */}
              <AircraftSilhouette
                size={aircraftSize}
                color={airlineInfo?.color || '#00d4ff'}
                width={28}
                isMilitary={isMilitary}
              />
              <div>
                <h3 style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: airlineInfo?.color || '#00d4ff',
                  margin: 0,
                  letterSpacing: 2,
                }}>
                  {track.callsign}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 2,
                }}>
                  {airlineInfo && (
                    <span style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: airlineInfo.color,
                    }}>
                      {airlineInfo.name}
                    </span>
                  )}
                  {aircraftType && (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: '#8b949e',
                    }}>
                      {aircraftType.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                background: 'transparent',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: 4,
                color: '#8b949e',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Airline & Aircraft Info Bar */}
          {(airlineInfo || souls) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
            }}>
              {airlineInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={12} style={{ color: '#6e7681' }} />
                  <span style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 11,
                    color: '#8b949e',
                  }}>
                    {airlineInfo.country}
                  </span>
                  <span style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 10,
                    color: '#6e7681',
                    background: 'rgba(110, 118, 129, 0.2)',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}>
                    {isMilitary ? 'MILITARY' : aircraftType?.category?.toUpperCase() || 'COMMERCIAL'}
                  </span>
                </div>
              )}
              {souls && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Users size={12} style={{ color: '#ffaa00' }} />
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#ffaa00',
                  }}>
                    {souls}
                  </span>
                  <span style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 10,
                    color: '#6e7681',
                  }}>
                    SOB
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Data grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            padding: 1,
            background: 'rgba(0, 255, 136, 0.1)',
          }}>
            {/* Altitude */}
            <DataCell
              icon={Gauge}
              label="ALTITUDE"
              value={formatAltitude(track.altitudeFt)}
              color="#00ff88"
            />
            {/* Speed */}
            <DataCell
              icon={Navigation}
              label="SPEED"
              value={`${track.speedKt} KT`}
              color="#00d4ff"
            />
            {/* Heading */}
            <DataCell
              icon={Navigation}
              label="HEADING"
              value={`${Math.round(track.headingDeg).toString().padStart(3, '0')}°`}
              color="#00d4ff"
            />
            {/* Vertical Rate */}
            <DataCell
              icon={VerticalIcon}
              label="V/S"
              value={verticalInfo.text}
              color={verticalInfo.color}
            />
          </div>

          {/* Position */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(0, 255, 136, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}>
              <MapPin size={12} style={{ color: '#6e7681' }} />
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 9,
                color: '#6e7681',
                letterSpacing: 1,
              }}>
                POSITION
              </span>
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: '#e6edf3',
            }}>
              {formatCoordinate(track.latitudeDeg, track.longitudeDeg)}
            </div>
          </div>

          {/* Route info (if flight data available) */}
          {flight && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(0, 255, 136, 0.1)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}>
                <Route size={12} style={{ color: '#6e7681' }} />
                <span style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 9,
                  color: '#6e7681',
                  letterSpacing: 1,
                }}>
                  ROUTE
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#00ff88',
                }}>
                  {flight.departureAirport}
                </div>
                <div style={{
                  flex: 1,
                  height: 2,
                  margin: '0 12px',
                  background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                  borderRadius: 1,
                }} />
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#00d4ff',
                }}>
                  {flight.arrivalAirport}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '12px 16px',
            borderTop: '1px solid rgba(0, 255, 136, 0.1)',
          }}>
            <button
              onClick={() => onSendMessage?.(track.callsign)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: 4,
                color: '#00d4ff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >
              <Send size={12} />
              MESSAGE
            </button>
            <button
              onClick={() => setTrackedFlightId(isTracking ? null : track.trackId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                background: isTracking ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                border: `1px solid ${isTracking ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 255, 136, 0.3)'}`,
                borderRadius: 4,
                color: '#00ff88',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >
              <Radio size={12} />
              {isTracking ? 'TRACKING' : 'TRACK'}
            </button>
          </div>

          {/* Confidence indicator */}
          <div style={{
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 10,
              color: '#6e7681',
            }}>
              TRACK CONFIDENCE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 60,
                height: 4,
                background: 'rgba(0, 255, 136, 0.2)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${track.confidence * 100}%`,
                  height: '100%',
                  background: track.confidence > 0.9 ? '#00ff88' : track.confidence > 0.7 ? '#ffaa00' : '#ff3366',
                  borderRadius: 2,
                }} />
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: track.confidence > 0.9 ? '#00ff88' : track.confidence > 0.7 ? '#ffaa00' : '#ff3366',
              }}>
                {Math.round(track.confidence * 100)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DataCell({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(13, 17, 23, 0.95)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
      }}>
        <Icon size={10} style={{ color: '#6e7681' }} />
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 8,
          color: '#6e7681',
          letterSpacing: 1,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 14,
        fontWeight: 600,
        color,
        textShadow: `0 0 8px ${color}40`,
      }}>
        {value}
      </div>
    </div>
  );
}
