/**
 * Centralized API Client Service
 * Interacts with backend REST endpoints with automatic base URL detection.
 */

import axios from 'axios';

// Base API URL: falls back to localhost:5000/api for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to unwrap data
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response ? error.response.data : {
      success: false,
      error: error.message || 'Network connection failed'
    };
    return Promise.reject(errorPayload);
  }
);

// Device Endpoints
export const getDevices = (params) => apiClient.get('/devices', { params });
export const getDeviceById = (id) => apiClient.get(`/devices/${id}`);
export const createDevice = (data) => apiClient.post('/devices', data);
export const updateDevice = (id, data) => apiClient.put(`/devices/${id}`, data);
export const deleteDevice = (id) => apiClient.delete(`/devices/${id}`);

// Sensor Telemetry Endpoints
export const getSensorReadings = (params) => apiClient.get('/sensors/readings', { params });
export const getLatestReadings = () => apiClient.get('/sensors/readings/latest');
export const getDeviceReadings = (deviceId, limit = 50) =>
  apiClient.get(`/sensors/readings/${deviceId}`, { params: { limit } });
export const postSensorReading = (data) => apiClient.post('/sensors/readings', data);

// Alert Endpoints
export const getAlerts = (params) => apiClient.get('/alerts', { params });
export const getAlertSummary = () => apiClient.get('/alerts/summary');
export const acknowledgeAlert = (id) => apiClient.put(`/alerts/${id}/acknowledge`);

// State Transitions Endpoints
export const getStateTransitions = (params) => apiClient.get('/states', { params });
export const getDeviceStateTransitions = (deviceId) => apiClient.get(`/states/${deviceId}`);

// Settings Endpoints
export const getSettings = () => apiClient.get('/settings');
export const updateSettings = (data) => apiClient.put('/settings', data);

// Network Telemetry Endpoints
export const getNetworkStats = () => apiClient.get('/network/stats');
export const checkHealth = () => apiClient.get('/health', { baseURL: API_BASE_URL.replace('/api', '') });

// FLAT Validator Endpoints
export const testMessageValidation = (message) => apiClient.post('/validator/test', { message });
export const getValidatorSamples = () => apiClient.get('/validator/samples');

// FLAT Automata Endpoints
export const getAutomataDefinition = () => apiClient.get('/automata/definition');
export const simulateAutomataTransition = (currentState, inputSymbol) =>
  apiClient.post('/automata/transition', { currentState, inputSymbol });
export const getAutomataHistory = (params) => apiClient.get('/automata/history', { params });

// Simulator Endpoints
export const getSimulationStatus = () => apiClient.get('/simulation/status');
export const startSimulation = () => apiClient.post('/simulation/start');
export const stopSimulation = () => apiClient.post('/simulation/stop');
export const pauseSimulation = () => apiClient.post('/simulation/pause');
export const resumeSimulation = () => apiClient.post('/simulation/resume');
export const triggerSimulationAnomaly = (deviceId, type) =>
  apiClient.post(`/simulation/anomaly/${deviceId}`, { type });
export const disconnectSimulationDevice = (deviceId) =>
  apiClient.post(`/simulation/disconnect/${deviceId}`);
export const restoreSimulationDevice = (deviceId) =>
  apiClient.post(`/simulation/restore/${deviceId}`);

export default apiClient;
