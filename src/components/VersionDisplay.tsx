/**
 * Version Display Component
 *
 * Shows current version and build info in the UI
 */

import { Info } from 'lucide-react';
import packageJson from '../../package.json';

export function VersionDisplay() {
  const version = packageJson.version;
  const buildDate = new Date().toISOString().split('T')[0];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: 4,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: '#8b949e',
      }}
    >
      <Info size={12} color="#00d4ff" />
      <span style={{ color: '#00d4ff', fontWeight: 600 }}>v{version}</span>
      <span style={{ color: '#6e7681' }}>|</span>
      <span style={{ color: '#8b949e' }}>{buildDate}</span>
    </div>
  );
}

export function DetailedVersionInfo() {
  const version = packageJson.version;

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: '#c9d1d9',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: 12,
        borderRadius: 6,
        border: '1px solid rgba(0, 255, 136, 0.3)',
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#00ff88' }}>
        ATCS-NG v{version}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 10 }}>
        <span style={{ color: '#6e7681' }}>Version:</span>
        <span style={{ color: '#00d4ff' }}>{version}</span>

        <span style={{ color: '#6e7681' }}>Features:</span>
        <span style={{ color: '#c9d1d9' }}>
          Audio Sync • Voice Pacing • LOD Graphics • Camera Choreography • Observability
        </span>

        <span style={{ color: '#6e7681' }}>Build:</span>
        <span style={{ color: '#c9d1d9' }}>{new Date().toISOString()}</span>

        <span style={{ color: '#6e7681' }}>Platform:</span>
        <span style={{ color: '#c9d1d9' }}>React {packageJson.dependencies.react}</span>
      </div>
    </div>
  );
}
