// Airline data with colors and simple icon representations
// Using Unicode symbols and emoji flags for lightweight implementation

export interface AirlineInfo {
  name: string;
  color: string;
  icon: string;  // Simple icon/symbol
  country: string;
  countryFlag: string;
}

export const AIRLINES: Record<string, AirlineInfo> = {
  // US Carriers
  UAL: { name: 'United', color: '#0033A0', icon: '◆', country: 'US', countryFlag: '🇺🇸' },
  DAL: { name: 'Delta', color: '#E31837', icon: '▲', country: 'US', countryFlag: '🇺🇸' },
  AAL: { name: 'American', color: '#0078D2', icon: '★', country: 'US', countryFlag: '🇺🇸' },
  SWA: { name: 'Southwest', color: '#304CB2', icon: '♥', country: 'US', countryFlag: '🇺🇸' },
  JBU: { name: 'JetBlue', color: '#003876', icon: '●', country: 'US', countryFlag: '🇺🇸' },
  NKS: { name: 'Spirit', color: '#FFE600', icon: '◈', country: 'US', countryFlag: '🇺🇸' },
  ASA: { name: 'Alaska', color: '#00205B', icon: '◇', country: 'US', countryFlag: '🇺🇸' },

  // Cargo
  FDX: { name: 'FedEx', color: '#4D148C', icon: '▣', country: 'US', countryFlag: '🇺🇸' },
  UPS: { name: 'UPS', color: '#351C15', icon: '▤', country: 'US', countryFlag: '🇺🇸' },

  // International
  BAW: { name: 'British Airways', color: '#2E5198', icon: '◆', country: 'GB', countryFlag: '🇬🇧' },
  AFR: { name: 'Air France', color: '#002157', icon: '◆', country: 'FR', countryFlag: '🇫🇷' },
  DLH: { name: 'Lufthansa', color: '#05164D', icon: '◎', country: 'DE', countryFlag: '🇩🇪' },
  UAE: { name: 'Emirates', color: '#D71921', icon: '◆', country: 'AE', countryFlag: '🇦🇪' },
  QTR: { name: 'Qatar Airways', color: '#5C0632', icon: '◆', country: 'QA', countryFlag: '🇶🇦' },
  SIA: { name: 'Singapore Airlines', color: '#F5A623', icon: '◆', country: 'SG', countryFlag: '🇸🇬' },
  ANA: { name: 'All Nippon', color: '#00467F', icon: '◆', country: 'JP', countryFlag: '🇯🇵' },
  CPA: { name: 'Cathay Pacific', color: '#006564', icon: '◆', country: 'HK', countryFlag: '🇭🇰' },
  KLM: { name: 'KLM', color: '#00A1DE', icon: '◆', country: 'NL', countryFlag: '🇳🇱' },
  AIC: { name: 'Air India', color: '#E31837', icon: '◆', country: 'IN', countryFlag: '🇮🇳' },
  QFA: { name: 'Qantas', color: '#E0001A', icon: '◆', country: 'AU', countryFlag: '🇦🇺' },

  // Military / Government
  RUS_AF: { name: 'Russian Air Force', color: '#D52B1E', icon: '☆', country: 'RU', countryFlag: '🇷🇺' },
  USAF: { name: 'US Air Force', color: '#00308F', icon: '★', country: 'US', countryFlag: '🇺🇸' },
  RAF: { name: 'Royal Air Force', color: '#00247D', icon: '✦', country: 'GB', countryFlag: '🇬🇧' },
  PLAAF: { name: 'PLA Air Force', color: '#DE2910', icon: '☆', country: 'CN', countryFlag: '🇨🇳' },
};

// Country flags for quick lookup
export const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  RU: '🇷🇺',
  GB: '🇬🇧',
  FR: '🇫🇷',
  DE: '🇩🇪',
  AE: '🇦🇪',
  QA: '🇶🇦',
  SG: '🇸🇬',
  JP: '🇯🇵',
  HK: '🇭🇰',
  NL: '🇳🇱',
  CN: '🇨🇳',
  KR: '🇰🇷',
  AU: '🇦🇺',
  CA: '🇨🇦',
  IN: '🇮🇳',
  BR: '🇧🇷',
  MX: '🇲🇽',
};

// Aircraft size categories for silhouettes
export type AircraftSize = 'regional' | 'narrow' | 'wide' | 'heavy' | 'super';

// Aircraft type info
export interface AircraftTypeInfo {
  name: string;
  manufacturer: string;
  category: 'narrow' | 'wide' | 'regional' | 'cargo' | 'military';
  size: AircraftSize;
  typicalSeats?: number;
}

export const AIRCRAFT_TYPES: Record<string, AircraftTypeInfo> = {
  // Narrow-body (single aisle)
  'B737': { name: 'Boeing 737', manufacturer: 'Boeing', category: 'narrow', size: 'narrow', typicalSeats: 160 },
  'B738': { name: 'Boeing 737-800', manufacturer: 'Boeing', category: 'narrow', size: 'narrow', typicalSeats: 175 },
  'B739': { name: 'Boeing 737-900', manufacturer: 'Boeing', category: 'narrow', size: 'narrow', typicalSeats: 180 },
  'A320': { name: 'Airbus A320', manufacturer: 'Airbus', category: 'narrow', size: 'narrow', typicalSeats: 150 },
  'A321': { name: 'Airbus A321', manufacturer: 'Airbus', category: 'narrow', size: 'narrow', typicalSeats: 185 },

  // Wide-body (twin aisle)
  'B787': { name: 'Boeing 787 Dreamliner', manufacturer: 'Boeing', category: 'wide', size: 'wide', typicalSeats: 290 },
  'B789': { name: 'Boeing 787-9', manufacturer: 'Boeing', category: 'wide', size: 'wide', typicalSeats: 296 },
  'B777': { name: 'Boeing 777', manufacturer: 'Boeing', category: 'wide', size: 'wide', typicalSeats: 350 },
  'A330': { name: 'Airbus A330', manufacturer: 'Airbus', category: 'wide', size: 'wide', typicalSeats: 277 },
  'A350': { name: 'Airbus A350', manufacturer: 'Airbus', category: 'wide', size: 'wide', typicalSeats: 325 },

  // Heavy (large wide-body)
  'B77W': { name: 'Boeing 777-300ER', manufacturer: 'Boeing', category: 'wide', size: 'heavy', typicalSeats: 396 },
  'B747': { name: 'Boeing 747', manufacturer: 'Boeing', category: 'wide', size: 'heavy', typicalSeats: 416 },

  // Super (double-decker)
  'A380': { name: 'Airbus A380', manufacturer: 'Airbus', category: 'wide', size: 'super', typicalSeats: 489 },

  // Regional jets
  'E175': { name: 'Embraer E175', manufacturer: 'Embraer', category: 'regional', size: 'regional', typicalSeats: 76 },
  'CRJ9': { name: 'Bombardier CRJ-900', manufacturer: 'Bombardier', category: 'regional', size: 'regional', typicalSeats: 76 },

  // Military (fighter = regional size silhouette)
  'SU35': { name: 'Sukhoi Su-35 Flanker', manufacturer: 'Sukhoi', category: 'military', size: 'regional' },
  'SU57': { name: 'Sukhoi Su-57 Felon', manufacturer: 'Sukhoi', category: 'military', size: 'regional' },
  'F22': { name: 'F-22 Raptor', manufacturer: 'Lockheed Martin', category: 'military', size: 'regional' },
  'F15': { name: 'F-15 Eagle', manufacturer: 'McDonnell Douglas', category: 'military', size: 'regional' },
  'F16': { name: 'F-16 Fighting Falcon', manufacturer: 'General Dynamics', category: 'military', size: 'regional' },
};

// Helper to extract airline code from callsign
export function getAirlineFromCallsign(callsign: string): AirlineInfo | null {
  // Common 3-letter ICAO prefixes
  const prefix3 = callsign.substring(0, 3);
  if (AIRLINES[prefix3]) {
    return AIRLINES[prefix3];
  }

  // Try 2-letter prefix for some
  const prefix2 = callsign.substring(0, 2);
  const twoLetterMap: Record<string, string> = {
    'UA': 'UAL',
    'DL': 'DAL',
    'AA': 'AAL',
    'WN': 'SWA',
    'B6': 'JBU',
    'AS': 'ASA',
    'NK': 'NKS',
    'BA': 'BAW',
    'AF': 'AFR',
    'LH': 'DLH',
    'EK': 'UAE',
    'QR': 'QTR',
    'SQ': 'SIA',
    'AI': 'AIC',
    'QF': 'QFA',
  };

  if (twoLetterMap[prefix2] && AIRLINES[twoLetterMap[prefix2]]) {
    return AIRLINES[twoLetterMap[prefix2]];
  }

  return null;
}

// Get display color based on visual state
export function getTrackColor(
  visualState?: string,
  isSelected?: boolean,
  confidence?: number
): string {
  if (isSelected) return '#00d4ff';

  switch (visualState) {
    case 'hostile':
      return '#ff0000';
    case 'hijacked':
      return '#ff3300';
    case 'warning':
      return '#ffaa00';
    case 'ghost':
      return '#666666';
    case 'hero':
      return '#00ff88';
    default:
      return confidence && confidence < 0.9 ? '#ffaa00' : '#00ff88';
  }
}
