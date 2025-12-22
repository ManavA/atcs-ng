import { create } from 'zustand';
import type { Alert } from '../types';

interface AlertState {
  alerts: Alert[];

  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  removeAlert: (alertId: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
  })),

  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a.alertId === alertId ? { ...a, acknowledged: true } : a
    ),
  })),

  removeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter((a) => a.alertId !== alertId),
  })),
}));
