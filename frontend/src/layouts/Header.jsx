/**
 * Top Navigation Header
 * Displays live backend RTT latency, simulation engine controls, and fleet health.
 */

import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Play, Pause, Square, Wifi, WifiOff, Bell, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  const {
    isBackendOnline,
    lastLatencyMs,
    simulationStatus,
    startSimulation,
    stopSimulation,
    pauseSimulation,
    resumeSimulation,
    alertSummary,
    isPollingActive,
    setIsPollingActive,
    refreshAll
  } = useSystem();

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>IoT Sensor Data Anomaly Monitoring System</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Network & Backend Status Badge */}
        <Link
          to="/network"
          className="badge"
          style={{
            backgroundColor: isBackendOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isBackendOnline ? 'var(--state-normal)' : 'var(--state-faulty)',
            border: `1px solid ${isBackendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '0.35rem 0.75rem',
            textTransform: 'none'
          }}
          title="Click to view full Computer Networks telemetry"
        >
          {isBackendOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isBackendOnline ? `Online (${lastLatencyMs}ms)` : 'Offline'}</span>
        </Link>

        {/* Polling Toggle Button */}
        <button
          onClick={() => setIsPollingActive(!isPollingActive)}
          className="btn btn-secondary btn-sm"
          title={isPollingActive ? 'Pause auto-refresh polling' : 'Resume 3s auto-refresh polling'}
        >
          <RefreshCw size={14} className={isPollingActive ? 'spin-icon' : ''} />
          <span>{isPollingActive ? 'Polling (3s)' : 'Paused'}</span>
        </button>

        {/* Simulator Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-card)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {!simulationStatus.isRunning ? (
            <button
              onClick={startSimulation}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--state-normal)', color: '#000' }}
              title="Start IoT Sensor Simulation Engine"
            >
              <Play size={14} />
              <span>Start Sim</span>
            </button>
          ) : (
            <>
              {simulationStatus.isPaused ? (
                <button
                  onClick={resumeSimulation}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: 'var(--state-normal)', color: '#000' }}
                  title="Resume Simulation"
                >
                  <Play size={14} />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseSimulation}
                  className="btn btn-secondary btn-sm"
                  title="Pause Simulation"
                >
                  <Pause size={14} />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={stopSimulation}
                className="btn btn-danger btn-sm"
                title="Stop Simulation"
              >
                <Square size={14} />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>

        {/* Unacknowledged Alerts Icon */}
        <Link
          to="/alerts"
          style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
          title="View Anomaly Alerts"
        >
          <Bell size={20} />
          {alertSummary.unacknowledgedTotal > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                backgroundColor: 'var(--state-faulty)',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.1rem 0.35rem',
                lineHeight: 1
              }}
            >
              {alertSummary.unacknowledgedTotal}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
