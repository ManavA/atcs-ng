import { useState, useEffect, useCallback } from 'react';
import type { Alert } from '../types';

// Mock alert generator
function generateMockAlerts(): Alert[] {
  const alerts: Alert[] = [
    {
      alertId: 'ALT-001',
      severity: 'CRITICAL',
      alertType: 'LOSS_OF_SEPARATION',
      message: 'Loss of separation between UAL123 and DAL456 - 3.2nm lateral, 400ft vertical',
      involvedFlightIds: ['UAL123', 'DAL456'],
      sectorId: 'BOS_33',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      acknowledged: false,
    },
    {
      alertId: 'ALT-002',
      severity: 'WARNING',
      alertType: 'CONFLICT_PREDICTED',
      message: 'Conflict predicted in 4:30 - AAL789 and SWA101 converging at FL350',
      involvedFlightIds: ['AAL789', 'SWA101'],
      sectorId: 'BOS_33',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      acknowledged: false,
    },
    {
      alertId: 'ALT-003',
      severity: 'WARNING',
      alertType: 'WEATHER_HAZARD',
      message: 'Severe turbulence reported - FL300-FL380, 20nm radius centered 42.1N 71.5W',
      involvedFlightIds: [],
      sectorId: 'BOS_33',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      acknowledged: false,
    },
    {
      alertId: 'ALT-004',
      severity: 'INFO',
      alertType: 'DEVIATION_DETECTED',
      message: 'JBU202 deviating from assigned route - 2.1nm off course',
      involvedFlightIds: ['JBU202'],
      sectorId: 'BOS_34',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      acknowledged: true,
    },
  ];

  return alerts;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setAlerts(generateMockAlerts());

    // Occasionally add new alerts
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const newAlert: Alert = {
          alertId: `ALT-${Date.now()}`,
          severity: Math.random() < 0.3 ? 'CRITICAL' : Math.random() < 0.6 ? 'WARNING' : 'INFO',
          alertType: 'CONFLICT_PREDICTED',
          message: `New conflict predicted - check radar display`,
          involvedFlightIds: [],
          sectorId: 'BOS_33',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.alertId === alertId ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return { alerts, acknowledgeAlert, unacknowledgedCount, criticalCount };
}
