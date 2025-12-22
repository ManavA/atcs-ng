import axios from 'axios';
import type { Flight, Sector, WeatherHazard, Alert, CommsMessage, Prediction } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Surveillance Service
export const surveillanceApi = {
  getTracks: () => api.get('/sts/v1/tracks').then(res => res.data),
  getTrack: (id: string) => api.get(`/sts/v1/tracks/${id}`).then(res => res.data),
};

// Flight Data Service
export const flightDataApi = {
  getFlights: () => api.get<Flight[]>('/fds/v1/flights').then(res => res.data),
  getFlight: (id: string) => api.get<Flight>(`/fds/v1/flights/${id}`).then(res => res.data),
  getFlightByCallsign: (callsign: string) =>
    api.get<Flight>(`/fds/v1/flights/callsign/${callsign}`).then(res => res.data),
  activateFlight: (id: string) =>
    api.post<Flight>(`/fds/v1/flights/${id}/activate`).then(res => res.data),
};

// Safety Service
export const safetyApi = {
  getAlerts: () => api.get<Alert[]>('/ss/v1/alerts').then(res => res.data),
  acknowledgeAlert: (id: string) => api.post(`/ss/v1/alerts/${id}/acknowledge`),
};

// Airspace Service
export const airspaceApi = {
  getSectors: () => api.get<Sector[]>('/as/v1/sectors').then(res => res.data),
  getSector: (id: string) => api.get<Sector>(`/as/v1/sectors/${id}`).then(res => res.data),
  getOverCapacitySectors: () => api.get<Sector[]>('/as/v1/sectors/overcapacity').then(res => res.data),
};

// Weather Service
export const weatherApi = {
  getHazards: () => api.get<WeatherHazard[]>('/ws/v1/hazards').then(res => res.data),
  getHazard: (id: string) => api.get<WeatherHazard>(`/ws/v1/hazards/${id}`).then(res => res.data),
};

// AI Service
export const aiApi = {
  getPredictions: () => api.get<Prediction[]>('/ai/v1/predictions').then(res => res.data),
};

// Communications Service
export const commsApi = {
  getMessages: (flightCallsign?: string) =>
    api.get<CommsMessage[]>('/cs/v1/messages', { params: { flightCallsign } }).then(res => res.data),
  sendMessage: (message: Partial<CommsMessage>) =>
    api.post<CommsMessage>('/cs/v1/messages', message).then(res => res.data),
};
