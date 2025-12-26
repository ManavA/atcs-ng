import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { RadarMap } from './components/Map';
import { Scene3D } from './components/Scene3D';
import { FlightStripBay } from './components/FlightStrips';
import { AlertPanel } from './components/Alerts';
import { PredictionPanel } from './components/Predictions';
import { FlightDetail } from './components/FlightDetail';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { ScreenEffects } from './components/Effects';
import { ViewModeToggle, TimeSlider, PresentationModeToggle, CommandLog } from './components/Controls';
import { SectorStats, WeatherWidget } from './components/Widgets';
import { CommandModal } from './components/CommandModal';
import { HeroModePanel } from './components/HeroMode';
import { DemoProvider, SpotlightOverlay, NarratorPanel, DemoMenuModal, ATCCommandDisplay, useDemoMode } from './demo';
import { ObservabilityPanel } from './components/Observability/ObservabilityPanel';
import { useUIStore } from './store';
import { useDemoData } from './demo/hooks/useDemoData';
import { useTrackStream } from './hooks/useTrackStream';
import { useAlerts } from './hooks/useAlerts';
import { usePredictions } from './hooks/usePredictions';
import { VoiceNotification } from './audio';
import './styles/globals.css';

function AppContent() {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showDataBlocks, setShowDataBlocks] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [commandModalCallsign, setCommandModalCallsign] = useState<string | null>(null);
  const voiceInitializedRef = useRef(false);

  const { completeInteraction, state: demoState, currentStep } = useDemoMode();
  const { heroModeActive, setHeroModeActive, viewMode, liveOnly } = useUIStore();

  // Initialize voice on first user interaction (required by browsers)
  // Note: Demo menu is opened by DemoProvider on mount, not here
  useEffect(() => {
    const initVoice = () => {
      if (!voiceInitializedRef.current) {
        voiceInitializedRef.current = true;
        VoiceNotification.forceInit();
        console.log('[Voice] Initialized on user interaction');
      }
    };

    document.addEventListener('click', initVoice, { once: true });
    document.addEventListener('keydown', initVoice, { once: true });

    return () => {
      document.removeEventListener('click', initVoice);
      document.removeEventListener('keydown', initVoice);
    };
  }, []);

  // Data hooks - get base data
  const { tracks: baseTracks, connected, trackCount } = useTrackStream('BOS_33');
  const { alerts: baseAlerts, acknowledgeAlert: baseAcknowledgeAlert } = useAlerts();
  const { predictions: basePredictions } = usePredictions();

  // Merge with demo data when active
  const { tracks, alerts, predictions, isDemoActive } = useDemoData({
    tracks: baseTracks,
    alerts: baseAlerts,
    predictions: basePredictions,
  });

  const handleSelectTrack = useCallback((trackId: string | null) => {
    setSelectedTrackId(trackId);
  }, []);

  const handleSelectFlight = useCallback((callsign: string) => {
    const track = tracks.find(t => t.callsign === callsign);
    if (track) {
      setSelectedTrackId(track.trackId);
    }
  }, [tracks]);

  // Handle alert acknowledgment - check for demo interaction
  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    if (isDemoActive && demoState.pendingInteraction?.target === alertId) {
      completeInteraction();
    }
    baseAcknowledgeAlert(alertId);
  }, [isDemoActive, demoState.pendingInteraction, completeInteraction, baseAcknowledgeAlert]);

  // Get selected track
  const selectedTrack = useMemo(() => {
    if (!selectedTrackId) return null;
    return tracks.find(t => t.trackId === selectedTrackId) || null;
  }, [selectedTrackId, tracks]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--color-bg-primary)',
    }}>
      {/* Header */}
      <div data-demo-id="header">
        <Header
          showDataBlocks={showDataBlocks}
          showTrails={showTrails}
          onToggleDataBlocks={() => setShowDataBlocks(prev => !prev)}
          onToggleTrails={() => setShowTrails(prev => !prev)}
        />
        {/* Controls bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '8px 20px',
          background: 'rgba(13, 17, 23, 0.95)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
        }}>
          <ViewModeToggle />
          <TimeSlider />
          <div style={{ flex: 1 }} />
          <PresentationModeToggle />
        </div>
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr 360px',
        gap: 8,
        padding: 8,
        overflow: 'hidden',
      }}>
        {/* Left sidebar - Flight strips and widgets */}
        <div
          data-demo-id="strips"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FlightStripBay
              tracks={tracks}
              alerts={alerts}
              selectedTrackId={selectedTrackId}
              onSelectTrack={handleSelectTrack}
            />
          </div>
          {/* Sector stats widget */}
          <div style={{ flexShrink: 0 }}>
            <SectorStats tracks={tracks} />
          </div>
        </div>

        {/* Center - Radar map or 3D scene */}
        <div
          data-demo-id="radar"
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            position: 'relative',
          }}
        >
          {viewMode === '2d' ? (
            <RadarMap
              tracks={tracks}
              selectedTrackId={selectedTrackId}
              onSelectTrack={handleSelectTrack}
              showDataBlocks={showDataBlocks}
              showTrails={showTrails}
            />
          ) : (
            <Scene3D
              tracks={tracks}
              selectedTrackId={selectedTrackId}
              onSelectTrack={handleSelectTrack}
              mapCenter={[42.3601, -71.0589]} // Boston center
            />
          )}
          {/* Flight detail overlay */}
          <FlightDetail
            track={selectedTrack}
            onClose={() => setSelectedTrackId(null)}
            onSendMessage={(callsign) => setCommandModalCallsign(callsign)}
          />
        </div>

        {/* Right sidebar - Alerts, Predictions, and Weather */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflow: 'hidden',
        }}>
          <div data-demo-id="alerts" style={{ flex: 1, overflow: 'hidden' }}>
            <AlertPanel
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onSelectFlight={handleSelectFlight}
            />
          </div>
          <div data-demo-id="predictions" style={{ flex: 0, maxHeight: '30%', overflow: 'hidden' }}>
            <PredictionPanel
              predictions={predictions}
              onSelectFlight={handleSelectFlight}
            />
          </div>
          {/* Weather widget */}
          <div style={{ flexShrink: 0 }}>
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar
        connected={connected}
        trackCount={isDemoActive ? tracks.length : trackCount}
        alertCount={alerts.filter(a => !a.acknowledged).length}
        sectorId="BOS_33"
      />

      {/* CRT effects */}
      <div className="scanline-overlay" />
      <div className="vignette-overlay" />

      {/* Demo mode overlays - only show when not in live mode */}
      {!liveOnly && (
        <>
          <SpotlightOverlay />
          <NarratorPanel />
          {/* ATC Command Display - shows "YOU:" typing when ATC issues commands */}
          {demoState.mode === 'playing' && currentStep?.atcCommand && (
            <ATCCommandDisplay command={currentStep.atcCommand} />
          )}
        </>
      )}
      {/* Menu modal always shown to allow mode selection */}
      <DemoMenuModal />

      {/* Command log */}
      <CommandLog />

      {/* Command modal */}
      <CommandModal
        callsign={commandModalCallsign || ''}
        isOpen={commandModalCallsign !== null}
        onClose={() => setCommandModalCallsign(null)}
      />

      {/* Hero mode panel */}
      {heroModeActive && (
        <HeroModePanel
          hijackedFlightId="TRK-SD-002"
          onComplete={(success) => {
            setHeroModeActive(false);
            console.log('[Hero Mode]', success ? 'Success!' : 'Failed');
          }}
        />
      )}

      {/* Observability Panel - System monitoring */}
      <ObservabilityPanel />

      {/* Screen effects */}
      <ScreenEffects />
    </div>
  );
}

function App() {
  return (
    <DemoProvider>
      <AppContent />
    </DemoProvider>
  );
}

export default App;
