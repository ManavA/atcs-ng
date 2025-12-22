// Track data from surveillance service
export interface Track {
  trackId: string;
  callsign: string;
  latitudeDeg: number;
  longitudeDeg: number;
  altitudeFt: number;
  headingDeg: number;
  speedKt: number;
  verticalRateFpm: number;
  confidence: number;
  sequence: number;
  updatedAt: string;

  // Visual state for dramatic effects
  visualState?: 'normal' | 'warning' | 'hijacked' | 'ghost' | 'hostile' | 'hero' | 'crashed';

  // Transponder simulation
  transponderActive?: boolean;  // false = radar only (stealth/hijack)
  squawkCode?: string;  // '7500' = hijack, '7700' = emergency, '7600' = radio fail

  // Aircraft metadata
  aircraftType?: string;  // 'B787', 'A320', 'SU-35', 'A380', etc.
  airline?: string;       // 'UAL', 'DAL', 'RUS_AF' for logos
  countryCode?: string;   // 'US', 'RU', 'GB', 'AE' for flags
  souls?: number;         // Passengers + crew count

  // Control state for hero mode
  controlState?: 'normal' | 'compromised' | 'remote' | 'lost';

  // For cinematic hijack sequence
  dataCorruption?: number;  // 0-1, how garbled the display is

  // Position uncertainty for stealth aircraft
  positionUncertainty?: number;  // nm radius
}

// Alert from safety service
export interface Alert {
  alertId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  alertType: AlertType;
  message: string;
  involvedFlightIds: string[];
  sectorId: string;
  timestamp: string;
  acknowledged: boolean;
}

export type AlertType =
  | 'LOSS_OF_SEPARATION'
  | 'CONFLICT_PREDICTED'
  | 'RESTRICTED_AIRSPACE_VIOLATION'
  | 'WEATHER_HAZARD'
  | 'DEVIATION_DETECTED'
  | 'EMERGENCY_DECLARED';

// Flight from flight-data service
export interface Flight {
  flightId: string;
  callsign: string;
  status: FlightStatus;
  departureAirport: string;
  arrivalAirport: string;
  aircraftType: string;
  cruiseAltitude: number;
  amendmentCount: number;
}

export type FlightStatus =
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'DEVIATED'
  | 'EMERGENCY'
  | 'LANDED'
  | 'CANCELLED';

// Sector from airspace service
export interface Sector {
  id: string;
  name: string;
  type: SectorType;
  floorFt: number;
  ceilingFt: number;
  flightCount: number;
  maxCapacity: number;
  controllerId?: string;
}

export type SectorType = 'LOW' | 'HIGH' | 'SUPER' | 'TERMINAL' | 'OCEANIC';

// Weather hazard
export interface WeatherHazard {
  id: string;
  type: HazardType;
  severity: number;
  centerLat: number;
  centerLon: number;
  radiusNm: number;
  baseAltFt: number;
  topAltFt: number;
  validFrom: string;
  validUntil: string;
}

export type HazardType =
  | 'THUNDERSTORM'
  | 'TURBULENCE'
  | 'ICING'
  | 'LOW_VISIBILITY'
  | 'VOLCANIC_ASH'
  | 'WIND_SHEAR'
  | 'CONVECTION';

// AI Prediction
export interface Prediction {
  id: string;
  predictionType: string;
  involvedFlights: string[];
  probability: number;
  predictedTime: string;
  description: string;
}

// Communications message
export interface CommsMessage {
  id: string;
  type: MessageType;
  senderId: string;
  recipientId: string;
  flightCallsign: string;
  content: string;
  frequency: string;
  acknowledged: boolean;
  createdAt: string;
}

export type MessageType =
  | 'CLEARANCE'
  | 'READBACK'
  | 'INSTRUCTION'
  | 'REQUEST'
  | 'ADVISORY'
  | 'EMERGENCY'
  | 'HANDOFF';

// UI State
export interface SelectedAircraft {
  trackId: string;
  callsign: string;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

// 4D Trajectory types
export interface TrajectoryPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: number; // Unix timestamp
  uncertainty: number; // Radius in nm
}

export interface Trajectory {
  flightId: string;
  points: TrajectoryPoint[];
  conflicts: ConflictPoint[];
}

export interface ConflictPoint {
  lat: number;
  lng: number;
  altitude: number;
  timestamp: number;
  otherFlightId: string;
  separationNm: number;
  separationFt: number;
}

// AI Recommendation types
export interface AIRecommendation {
  id: string;
  type: 'conflict_resolution' | 'route_optimization' | 'weather_avoidance';
  confidence: number;
  flightId: string;
  description: string;
  action: string;
  impacts: {
    fuelLbs: number;
    timeMinutes: number;
  };
  alternatives: AIRecommendation[];
}

// CPDLC Message types
export interface CPDLCMessage {
  id: string;
  timestamp: string;
  direction: 'uplink' | 'downlink';
  flightCallsign: string;
  messageType: CPDLCMessageType;
  content: string;
  status: 'pending' | 'acknowledged' | 'rejected' | 'timeout';
  urgency: 'routine' | 'urgent' | 'distress';
}

export type CPDLCMessageType =
  | 'CLIMB'
  | 'DESCEND'
  | 'TURN'
  | 'SPEED'
  | 'DIRECT'
  | 'HOLD'
  | 'CLEARED'
  | 'CONTACT'
  | 'ROGER'
  | 'WILCO'
  | 'UNABLE'
  | 'REQUEST'
  | 'EMERGENCY';

// Weather visualization types
export interface WeatherCell {
  id: string;
  type: 'thunderstorm' | 'rain' | 'turbulence' | 'icing' | 'fog';
  severity: 1 | 2 | 3 | 4 | 5;
  centerLat: number;
  centerLng: number;
  radiusNm: number;
  topAltitude: number;
  baseAltitude: number;
  movementVector: { heading: number; speedKt: number };
  lightningActive: boolean;
}

// 3D View types
export interface Camera3D {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// Emergency event types for dramatic sequences
export interface CrashEvent {
  trackId: string;
  callsign: string;
  location: { lat: number; lng: number };
  impactTime: number;
  phase: 'descent' | 'impact' | 'aftermath';
}

export interface NMACEvent {
  trackId1: string;
  trackId2: string;
  closestApproach: { lat: number; lng: number; altitude: number };
  tcasRA: 'climb' | 'descend' | 'monitor';
  separationNm: number;
  separationFt: number;
}
