/**
 * Global System Context
 * Manages real-time REST polling, device fleet telemetry, simulation state,
 * and anomaly alerts across the entire application.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getDevices,
  getAlerts,
  getAlertSummary,
  getSimulationStatus,
  startSimulation as apiStartSim,
  stopSimulation as apiStopSim,
  pauseSimulation as apiPauseSim,
  resumeSimulation as apiResumeSim,
  triggerSimulationAnomaly as apiTriggerAnomaly,
  disconnectSimulationDevice as apiDisconnectDevice,
  restoreSimulationDevice as apiRestoreDevice,
  checkHealth
} from '../services/api';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertSummary, setAlertSummary] = useState({ unacknowledgedTotal: 0, severityBreakdown: {} });
  const [simulationStatus, setSimulationStatus] = useState({ isRunning: false, isPaused: false });
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [lastLatencyMs, setLastLatencyMs] = useState(0);
  const [lastPollTime, setLastPollTime] = useState(null);
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const pollTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.id === Date.now() ? null : current));
    }, 4000);
  }, []);

  // Poll server data
  const fetchData = useCallback(async () => {
    const startTime = performance.now();
    try {
      const [devRes, alertRes, summaryRes, simRes] = await Promise.all([
        getDevices(),
        getAlerts({ limit: 15 }),
        getAlertSummary(),
        getSimulationStatus().catch(() => ({ success: false }))
      ]);

      const duration = Math.round(performance.now() - startTime);
      setLastLatencyMs(duration);

      if (devRes && devRes.success) {
        setDevices(devRes.data || []);
      }
      if (alertRes && alertRes.success) {
        setAlerts(alertRes.data || []);
      }
      if (summaryRes && summaryRes.success) {
        setAlertSummary(summaryRes.data || { unacknowledgedTotal: 0, severityBreakdown: {} });
      }
      if (simRes && simRes.success) {
        setSimulationStatus(simRes.data || { isRunning: false, isPaused: false });
      }

      setIsBackendOnline(true);
      setLastPollTime(new Date());
    } catch (err) {
      setIsBackendOnline(false);
      console.warn('[POLL WARNING] Backend connection failed:', err.message || err.error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling loop
  useEffect(() => {
    fetchData();

    if (isPollingActive) {
      pollTimerRef.current = setInterval(() => {
        fetchData();
      }, 3000);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchData, isPollingActive]);

  // Simulator Actions
  const handleStartSim = async () => {
    try {
      const res = await apiStartSim();
      if (res.success) {
        setSimulationStatus(res.data);
        showToast('IoT Simulation engine started', 'success');
      }
    } catch (err) {
      showToast('Failed to start simulation: ' + (err.error || err.message), 'error');
    }
  };

  const handleStopSim = async () => {
    try {
      const res = await apiStopSim();
      if (res.success) {
        setSimulationStatus(res.data);
        showToast('IoT Simulation stopped', 'info');
      }
    } catch (err) {
      showToast('Failed to stop simulation', 'error');
    }
  };

  const handlePauseSim = async () => {
    try {
      const res = await apiPauseSim();
      if (res.success) {
        setSimulationStatus(res.data);
        showToast('IoT Simulation paused', 'info');
      }
    } catch (err) {
      showToast('Failed to pause simulation', 'error');
    }
  };

  const handleResumeSim = async () => {
    try {
      const res = await apiResumeSim();
      if (res.success) {
        setSimulationStatus(res.data);
        showToast('IoT Simulation resumed', 'success');
      }
    } catch (err) {
      showToast('Failed to resume simulation', 'error');
    }
  };

  const handleTriggerAnomaly = async (deviceId, type = 'FAULTY') => {
    try {
      const res = await apiTriggerAnomaly(deviceId, type);
      if (res.success) {
        showToast(`Triggered ${type} anomaly on ${deviceId}`, 'warning');
        fetchData();
      }
    } catch (err) {
      showToast(`Failed triggering anomaly: ${err.error || err.message}`, 'error');
    }
  };

  const handleDisconnect = async (deviceId) => {
    try {
      const res = await apiDisconnectDevice(deviceId);
      if (res.success) {
        showToast(`Disconnected device ${deviceId}. Watchdog active.`, 'warning');
        fetchData();
      }
    } catch (err) {
      showToast(`Failed disconnecting device: ${err.error || err.message}`, 'error');
    }
  };

  const handleRestore = async (deviceId) => {
    try {
      const res = await apiRestoreDevice(deviceId);
      if (res.success) {
        showToast(`Restored device ${deviceId} to normal transmission`, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(`Failed restoring device: ${err.error || err.message}`, 'error');
    }
  };

  return (
    <SystemContext.Provider
      value={{
        devices,
        alerts,
        alertSummary,
        simulationStatus,
        isBackendOnline,
        lastLatencyMs,
        lastPollTime,
        isPollingActive,
        setIsPollingActive,
        loading,
        toast,
        refreshAll: fetchData,
        startSimulation: handleStartSim,
        stopSimulation: handleStopSim,
        pauseSimulation: handlePauseSim,
        resumeSimulation: handleResumeSim,
        triggerAnomaly: handleTriggerAnomaly,
        disconnectDevice: handleDisconnect,
        restoreDevice: handleRestore,
        showToast
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
