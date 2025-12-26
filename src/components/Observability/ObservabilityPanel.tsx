/**
 * Observability Panel - Real-time System Monitoring
 *
 * Displays microservices architecture with:
 * - Service tabs showing individual service status and logs
 * - Message stream showing inter-service communication
 * - Service health visualization
 */

import { useState, useEffect } from 'react';
import { Activity, Database, Radio, Cpu, Cloud, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// Mock service definitions
const SERVICES = [
  { id: 'sts', name: 'Surveillance Tracking', icon: Activity, color: '#00ff88' },
  { id: 'fds', name: 'Flight Data', icon: Database, color: '#00d4ff' },
  { id: 'ss', name: 'Scenario Service', icon: Radio, color: '#ff3366' },
  { id: 'ai', name: 'AI Conflict Detection', icon: Cpu, color: '#ffaa00' },
  { id: 'ws', name: 'WebSocket Server', icon: Cloud, color: '#8b5cf6' },
] as const;

type ServiceId = typeof SERVICES[number]['id'];

interface ServiceMessage {
  id: string;
  timestamp: number;
  from: ServiceId;
  to: ServiceId;
  type: string;
  payload: string;
  status: 'success' | 'pending' | 'error';
}

interface ServiceMetrics {
  uptime: number;
  messagesProcessed: number;
  avgLatency: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ServiceLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export function ObservabilityPanel() {
  const [activeTab, setActiveTab] = useState<'services' | 'messages' | 'health'>('messages');
  const [selectedService, setSelectedService] = useState<ServiceId>('sts');
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [serviceLogs, setServiceLogs] = useState<Record<ServiceId, ServiceLog[]>>({
    sts: [],
    fds: [],
    ss: [],
    ai: [],
    ws: [],
  });
  const [serviceMetrics, setServiceMetrics] = useState<Record<ServiceId, ServiceMetrics>>({
    sts: { uptime: 3600, messagesProcessed: 1243, avgLatency: 12, errorRate: 0.001, memoryUsage: 45, cpuUsage: 23 },
    fds: { uptime: 3600, messagesProcessed: 892, avgLatency: 8, errorRate: 0.002, memoryUsage: 38, cpuUsage: 15 },
    ss: { uptime: 3600, messagesProcessed: 156, avgLatency: 5, errorRate: 0, memoryUsage: 28, cpuUsage: 8 },
    ai: { uptime: 3600, messagesProcessed: 445, avgLatency: 45, errorRate: 0.015, memoryUsage: 62, cpuUsage: 48 },
    ws: { uptime: 3600, messagesProcessed: 3421, avgLatency: 3, errorRate: 0.003, memoryUsage: 35, cpuUsage: 12 },
  });

  // Simulate real-time message streaming
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random message between services
      const fromIdx = Math.floor(Math.random() * SERVICES.length);
      let toIdx = Math.floor(Math.random() * SERVICES.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * SERVICES.length);
      }

      const messageTypes = [
        'TRACK_UPDATE',
        'CONFLICT_DETECTED',
        'SCENARIO_EVENT',
        'PREDICTION_REQUEST',
        'CLIENT_SYNC',
        'HEALTH_CHECK',
      ];

      const newMessage: ServiceMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        from: SERVICES[fromIdx].id,
        to: SERVICES[toIdx].id,
        type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
        payload: `{track: "QFA8", alt: ${Math.floor(Math.random() * 40000)}ft}`,
        status: Math.random() > 0.05 ? 'success' : 'pending',
      };

      setMessages((prev) => [newMessage, ...prev].slice(0, 50));

      // Update service metrics
      setServiceMetrics((prev) => ({
        ...prev,
        [SERVICES[fromIdx].id]: {
          ...prev[SERVICES[fromIdx].id],
          messagesProcessed: prev[SERVICES[fromIdx].id].messagesProcessed + 1,
        },
      }));

      // Add service log
      const logMessages = [
        `Processing ${newMessage.type} from ${newMessage.from}`,
        `Sent ${newMessage.type} to ${newMessage.to}`,
        `Cache hit for track data`,
        `Conflict check completed in ${Math.floor(Math.random() * 100)}ms`,
        `WebSocket broadcast to 3 clients`,
      ];

      const newLog: ServiceLog = {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        level: Math.random() > 0.9 ? 'warn' : 'info',
        message: logMessages[Math.floor(Math.random() * logMessages.length)],
      };

      setServiceLogs((prev) => ({
        ...prev,
        [SERVICES[fromIdx].id]: [newLog, ...prev[SERVICES[fromIdx].id]].slice(0, 30),
      }));
    }, 800); // New message every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '280px',
        background: 'rgba(10, 14, 20, 0.98)',
        borderTop: '1px solid rgba(0, 255, 136, 0.3)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'JetBrains Mono', monospace",
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header with tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.05), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 16 }}>
          <Activity size={14} color="#00ff88" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00ff88', letterSpacing: 1 }}>
            SYSTEM OBSERVABILITY
          </span>
        </div>

        {[
          { id: 'messages', label: 'Message Stream' },
          { id: 'services', label: 'Service Logs' },
          { id: 'health', label: 'Health & Metrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '6px 12px',
              background: activeTab === tab.id ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(0, 255, 136, 0.4)' : '1px solid transparent',
              borderRadius: 4,
              color: activeTab === tab.id ? '#00ff88' : '#6e7681',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {activeTab === 'messages' && <MessageStreamView messages={messages} />}
        {activeTab === 'services' && (
          <ServiceLogsView
            services={SERVICES}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            logs={serviceLogs[selectedService]}
          />
        )}
        {activeTab === 'health' && <HealthMetricsView services={SERVICES} metrics={serviceMetrics} />}
      </div>
    </div>
  );
}

// Message Stream View
function MessageStreamView({ messages }: { messages: ServiceMessage[] }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', fontSize: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg) => {
          const fromService = SERVICES.find((s) => s.id === msg.from);
          const toService = SERVICES.find((s) => s.id === msg.to);
          const age = Date.now() - msg.timestamp;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                background: age < 1000 ? 'rgba(0, 255, 136, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                borderLeft: `2px solid ${fromService?.color || '#666'}`,
                borderRadius: 2,
                transition: 'background 0.5s',
              }}
            >
              <span style={{ color: '#6e7681', fontSize: 9 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <span style={{ color: fromService?.color, fontWeight: 600 }}>{msg.from.toUpperCase()}</span>
              <span style={{ color: '#6e7681' }}>→</span>
              <span style={{ color: toService?.color, fontWeight: 600 }}>{msg.to.toUpperCase()}</span>
              <span style={{ color: '#00d4ff' }}>{msg.type}</span>
              <span style={{ color: '#8b949e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {msg.payload}
              </span>
              {msg.status === 'success' && <CheckCircle size={12} color="#00ff88" />}
              {msg.status === 'pending' && <Clock size={12} color="#ffaa00" />}
              {msg.status === 'error' && <AlertCircle size={12} color="#ff3366" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Service Logs View
function ServiceLogsView({
  services,
  selectedService,
  onSelectService,
  logs,
}: {
  services: typeof SERVICES;
  selectedService: ServiceId;
  onSelectService: (id: ServiceId) => void;
  logs: ServiceLog[];
}) {
  return (
    <div style={{ flex: 1, display: 'flex' }}>
      {/* Service selector */}
      <div style={{ width: 180, borderRight: '1px solid rgba(0, 255, 136, 0.2)', padding: 8 }}>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => onSelectService(service.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                background: selectedService === service.id ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                border: selectedService === service.id ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                borderRadius: 4,
                color: selectedService === service.id ? service.color : '#6e7681',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} />
              <span>{service.name}</span>
            </button>
          );
        })}
      </div>

      {/* Logs display */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', fontSize: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderLeft: `2px solid ${log.level === 'error' ? '#ff3366' : log.level === 'warn' ? '#ffaa00' : '#00ff88'}`,
                borderRadius: 2,
              }}
            >
              <span style={{ color: '#6e7681', fontSize: 9 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                style={{
                  color: log.level === 'error' ? '#ff3366' : log.level === 'warn' ? '#ffaa00' : '#00ff88',
                  fontWeight: 600,
                  fontSize: 9,
                  textTransform: 'uppercase',
                }}
              >
                {log.level}
              </span>
              <span style={{ color: '#c9d1d9' }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Health & Metrics View
function HealthMetricsView({
  services,
  metrics,
}: {
  services: typeof SERVICES;
  metrics: Record<ServiceId, ServiceMetrics>;
}) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {services.map((service) => {
          const Icon = service.icon;
          const m = metrics[service.id];
          const health = m.errorRate < 0.01 && m.cpuUsage < 80 ? 'healthy' : m.errorRate < 0.05 ? 'degraded' : 'critical';

          return (
            <div
              key={service.id}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${health === 'healthy' ? 'rgba(0, 255, 136, 0.3)' : health === 'degraded' ? 'rgba(255, 170, 0, 0.3)' : 'rgba(255, 51, 102, 0.3)'}`,
                borderRadius: 6,
                padding: 12,
              }}
            >
              {/* Service header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon size={16} color={service.color} />
                <span style={{ fontSize: 11, fontWeight: 700, color: service.color }}>{service.name}</span>
                <div style={{ flex: 1 }} />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: health === 'healthy' ? '#00ff88' : health === 'degraded' ? '#ffaa00' : '#ff3366',
                    textTransform: 'uppercase',
                  }}
                >
                  {health}
                </span>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 9 }}>
                <MetricItem label="Uptime" value={`${Math.floor(m.uptime / 60)}m`} />
                <MetricItem label="Messages" value={m.messagesProcessed.toString()} />
                <MetricItem label="Latency" value={`${m.avgLatency}ms`} />
                <MetricItem label="Error Rate" value={`${(m.errorRate * 100).toFixed(2)}%`} />
                <MetricItem label="Memory" value={`${m.memoryUsage}%`} color={m.memoryUsage > 70 ? '#ffaa00' : undefined} />
                <MetricItem label="CPU" value={`${m.cpuUsage}%`} color={m.cpuUsage > 70 ? '#ffaa00' : undefined} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ color: '#6e7681', marginBottom: 2 }}>{label}</div>
      <div style={{ color: color || '#00d4ff', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
