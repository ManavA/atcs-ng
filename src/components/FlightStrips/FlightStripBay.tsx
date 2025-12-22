import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Filter, SortAsc, Search } from 'lucide-react';
import type { Track, Flight, Alert } from '../../types';
import { FlightStrip } from './FlightStrip';

interface FlightStripBayProps {
  tracks: Track[];
  flights?: Map<string, Flight>;
  alerts?: Alert[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
}

type SortField = 'callsign' | 'altitude' | 'speed';
type SortDirection = 'asc' | 'desc';

export function FlightStripBay({
  tracks,
  flights = new Map(),
  alerts = [],
  selectedTrackId,
  onSelectTrack,
}: FlightStripBayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortField, setSortField] = useState<SortField>('callsign');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get flight IDs with alerts
  const alertedFlightIds = useMemo(() => {
    const ids = new Set<string>();
    alerts.forEach(alert => {
      alert.involvedFlightIds.forEach(id => ids.add(id));
    });
    return ids;
  }, [alerts]);

  // Sort and filter tracks
  const sortedTracks = useMemo(() => {
    let filtered = tracks;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toUpperCase();
      filtered = tracks.filter(t => t.callsign.toUpperCase().includes(term));
    }

    // Apply sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'callsign':
          comparison = a.callsign.localeCompare(b.callsign);
          break;
        case 'altitude':
          comparison = a.altitudeFt - b.altitudeFt;
          break;
        case 'speed':
          comparison = a.speedKt - b.speedKt;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tracks, sortField, sortDirection, searchTerm]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flight-strip-bay panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="panel-header" style={{ flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 8px #00ff88',
          }} />
          FLIGHT STRIPS
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: '#8b949e',
            marginLeft: 4,
          }}>
            ({sortedTracks.length})
          </span>
        </span>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: 'transparent',
            border: 'none',
            color: showFilters ? '#00ff88' : '#8b949e',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Filter size={14} />
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Filter controls */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px' }}>
              {/* Search input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 4,
                padding: '6px 10px',
                marginBottom: 8,
              }}>
                <Search size={12} style={{ color: '#6e7681' }} />
                <input
                  type="text"
                  placeholder="Search callsign..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#e6edf3',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    width: '100%',
                  }}
                />
              </div>

              {/* Sort buttons */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['callsign', 'altitude', 'speed'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    style={{
                      flex: 1,
                      background: sortField === field ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                      border: `1px solid ${sortField === field ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.1)'}`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      color: sortField === field ? '#00ff88' : '#8b949e',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 10,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortField === field && (
                      <SortAsc size={10} style={{
                        transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strip list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: 8,
            }}
          >
            <AnimatePresence mode="popLayout">
              {sortedTracks.map((track) => (
                <FlightStrip
                  key={track.trackId}
                  track={track}
                  flight={flights.get(track.callsign)}
                  isSelected={selectedTrackId === track.trackId}
                  onSelect={() => onSelectTrack(track.trackId)}
                  hasAlert={alertedFlightIds.has(track.callsign)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
