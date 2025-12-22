import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoloPanel } from '../Holographic';
import type { CPDLCMessage } from '../../types';

interface CommsConsoleProps {
  messages: CPDLCMessage[];
  onSendMessage: (callsign: string, type: string, content: string) => void;
}

const messageColors: Record<string, string> = {
  CLIMB: '#00ff88',
  DESCEND: '#00d4ff',
  TURN: '#ffaa00',
  SPEED: '#ff6600',
  EMERGENCY: '#ff3366',
  ROGER: '#00ff88',
  WILCO: '#00ff88',
  UNABLE: '#ff3366',
};

export function CommsConsole({ messages, onSendMessage }: CommsConsoleProps) {
  const [selectedCallsign, setSelectedCallsign] = useState('');
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (selectedCallsign && messageText) {
      onSendMessage(selectedCallsign, 'CLEARANCE', messageText);
      setMessageText('');
    }
  };

  return (
    <HoloPanel title="COMMUNICATIONS">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400 }}>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {messages.slice(0, 10).map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.direction === 'uplink' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: '8px 12px',
                  background: msg.direction === 'uplink'
                    ? 'rgba(0, 255, 136, 0.1)'
                    : 'rgba(0, 212, 255, 0.1)',
                  borderRadius: 4,
                  borderLeft: `3px solid ${messageColors[msg.messageType] || '#8b949e'}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#00ff88', fontWeight: 600 }}>{msg.flightCallsign}</span>
                  <span style={{ color: '#6e7681', fontSize: 10 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: '#e6edf3' }}>{msg.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={selectedCallsign}
            onChange={(e) => setSelectedCallsign(e.target.value.toUpperCase())}
            placeholder="CALLSIGN"
            style={{
              width: 100,
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: 4,
              color: '#00ff88',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          />
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value.toUpperCase())}
            placeholder="MESSAGE..."
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: 4,
              color: '#e6edf3',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: '8px 16px',
              background: '#00ff88',
              color: '#0a0e14',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </HoloPanel>
  );
}
