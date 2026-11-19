/**
 * Live Monitoring Page
 * Real-time auto-refresh telemetry grid showing current sensor parameters per device,
 * plus interactive Manual Telemetry Dispatcher for student/faculty demonstration.
 */

import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import {
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  RefreshCw,
  Send,
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { postSensorReading } from '../services/api';

export const LiveMonitoring = () => {
  const { devices, lastPollTime, refreshAll, showToast } = useSystem();
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [lastDispatchResult, setLastDispatchResult] = useState(null);

  // Manual Dispatch Form State
  const [manualData, setManualData] = useState({
    deviceId: 'IOT-001',
    temperature: 24.5,
    humidity: 48.0,
    pressure: 1013.2
  });

  const filteredDevices = devices.filter((d) => {
    if (selectedDevice === 'ALL') return true;
    return d.deviceId === selectedDevice;
  });

  const handleOpenManual = (devId = 'IOT-001') => {
    setManualData({
      deviceId: devId,
      temperature: 24.5,
      humidity: 48.0,
      pressure: 1013.2
    });
    setLastDispatchResult(null);
    setIsManualModalOpen(true);
  };

  const handleApplyPreset = (type) => {
    if (type === 'NORMAL') {
      setManualData((prev) => ({ ...prev, temperature: 24.0, humidity: 45.0, pressure: 1013.2 }));
    } else if (type === 'WARNING') {
      setManualData((prev) => ({ ...prev, temperature: 35.5, humidity: 68.0, pressure: 1035.0 }));
    } else if (type === 'FAULTY') {
      setManualData((prev) => ({ ...prev, temperature: 48.0, humidity: 88.0, pressure: 1065.0 }));
    }
  };

  const handleTransmit = async (e) => {
    e.preventDefault();
    setTransmitting(true);
    try {
      const res = await postSensorReading(manualData);
      if (res.success) {
        setLastDispatchResult(res.data);
        showToast(`Frame transmitted for ${manualData.deviceId}! State: ${res.data.currentState}`, 'success');
        refreshAll();
      }
    } catch (err) {
      showToast(err.error || 'Failed to transmit sensor reading', 'error');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={24} style={{ color: 'var(--accent-cyan)' }} />
            Live Telemetry Monitor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Synchronous REST polling stream (3-second refresh cycle) directly connected to MongoDB Atlas
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => handleOpenManual(devices[0]?.deviceId || 'IOT-001')}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Send size={15} />
            <span>Manual Telemetry Dispatcher</span>
          </button>
          <button onClick={refreshAll} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 0.85rem' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Device Filter Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, marginRight: '0.5rem' }}>
          FILTER FLEET NODE:
        </span>
        <button
          onClick={() => setSelectedDevice('ALL')}
          className={`btn btn-sm ${selectedDevice === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Nodes ({devices.length})
        </button>
        {devices.map((d) => (
          <button
            key={d.deviceId}
            onClick={() => setSelectedDevice(d.deviceId)}
            className={`btn btn-sm ${selectedDevice === d.deviceId ? 'btn-primary' : 'btn-secondary'}`}
          >
            {d.deviceId}
          </button>
        ))}
      </div>

      {/* Telemetry Cards Grid */}
      <div className="grid-cols-2">
        {filteredDevices.map((dev) => {
          const tel = dev.latestTelemetry;
          const temp = tel ? tel.temperature : null;
          const hum = tel ? tel.humidity : null;
          const press = tel ? tel.pressure : null;

          return (
            <div key={dev.deviceId} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--accent-cyan)' }}>
                      {dev.deviceId}
                    </span>
                    <span style={{ fontWeight: 600 }}>{dev.deviceName}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{dev.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenManual(dev.deviceId)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    title="Transmit custom reading for this device"
                  >
                    <Send size={11} />
                    <span>Inject</span>
                  </button>
                  <span className={`badge badge-${dev.currentState.toLowerCase()}`}>
                    {dev.currentState}
                  </span>
                </div>
              </div>

              {/* Decorative Sensor Gauges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {/* Temperature */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    padding: '1rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 0 12px rgba(56, 189, 248, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#38bdf8', marginBottom: '0.25rem' }}>
                    <Thermometer size={22} style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TEMPERATURE</span>
                  <p
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      marginTop: '0.25rem',
                      color: temp > 40 || temp < 5 ? 'var(--state-faulty)' : temp > 30 || temp < 18 ? 'var(--state-warning)' : '#fff'
                    }}
                  >
                    {temp !== null ? `${temp}°C` : '--'}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Normal: 18-30°C</span>
                </div>

                {/* Humidity */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '1rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 0 12px rgba(16, 185, 129, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: '0.25rem' }}>
                    <Droplets size={22} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HUMIDITY</span>
                  <p
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      marginTop: '0.25rem',
                      color: hum > 80 || hum < 15 ? 'var(--state-faulty)' : hum > 60 || hum < 30 ? 'var(--state-warning)' : '#fff'
                    }}
                  >
                    {hum !== null ? `${hum}%` : '--'}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Normal: 30-60%</span>
                </div>

                {/* Pressure */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    padding: '1rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 0 12px rgba(245, 158, 11, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '0.25rem' }}>
                    <Gauge size={22} style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRESSURE</span>
                  <p
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      marginTop: '0.25rem',
                      color: press > 1050 || press < 950 ? 'var(--state-faulty)' : press > 1030 || press < 980 ? 'var(--state-warning)' : '#fff'
                    }}
                  >
                    {press !== null ? `${press}` : '--'}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Normal: 980-1030 hPa</span>
                </div>
              </div>

              {/* Raw Frame Wire Banner */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-dim)',
                  overflowX: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span className="pulse-dot pulse-dot-green" />
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>WIRE FRAME:</span>
                <span style={{ color: '#cbd5e1' }}>{tel ? tel.rawMessage : 'Awaiting sensor frame transmission...'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Telemetry Dispatcher Modal */}
      {isManualModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', backgroundColor: '#0d1322', border: '1px solid rgba(56, 189, 248, 0.35)', boxShadow: '0 0 35px rgba(56, 189, 248, 0.2)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--accent-cyan)' }}>
                <Send size={18} />
                Manual Telemetry Dispatcher
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Target IoT Device:</label>
                <select
                  className="form-select"
                  value={manualData.deviceId}
                  onChange={(e) => setManualData({ ...manualData, deviceId: e.target.value })}
                  required
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.deviceId} - {d.deviceName} (Currently: {d.currentState})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Presets */}
              <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  DEMONSTRATION QUICK PRESETS:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('NORMAL')}
                    className="btn btn-sm"
                    style={{ background: 'var(--state-normal-bg)', color: 'var(--state-normal)', border: '1px solid rgba(16, 185, 129, 0.4)' }}
                  >
                    Nominal (24°C)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('WARNING')}
                    className="btn btn-sm"
                    style={{ background: 'var(--state-warning-bg)', color: 'var(--state-warning)', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                  >
                    Warning (35.5°C)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('FAULTY')}
                    className="btn btn-sm"
                    style={{ background: 'var(--state-faulty-bg)', color: 'var(--state-faulty)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                  >
                    Critical Fault (48°C)
                  </button>
                </div>
              </div>

              {/* Parameters Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Temp (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={manualData.temperature}
                    onChange={(e) => setManualData({ ...manualData, temperature: parseFloat(e.target.value) })}
                    required
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Fault: &lt;5 or &gt;40</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Humidity (%):</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={manualData.humidity}
                    onChange={(e) => setManualData({ ...manualData, humidity: parseFloat(e.target.value) })}
                    required
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Fault: &lt;15 or &gt;80</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Pressure (hPa):</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={manualData.pressure}
                    onChange={(e) => setManualData({ ...manualData, pressure: parseFloat(e.target.value) })}
                    required
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Fault: &lt;950 or &gt;1050</span>
                </div>
              </div>

              {/* Live Preview of Frame */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '1rem', wordBreak: 'break-all' }}>
                Frame to Dispatch: {manualData.deviceId}|TEMP={manualData.temperature}|HUM={manualData.humidity}|PRESS={manualData.pressure}|TS={new Date().toISOString()}
              </div>

              {/* Last Dispatch Feedback */}
              {lastDispatchResult && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ color: 'var(--state-normal)', fontWeight: 600 }}>✓ Persisted into MongoDB Atlas!</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    DFA Alphabet: Symbol <strong>'{lastDispatchResult.classification?.symbol}'</strong> ──► Resulting State: <strong>{lastDispatchResult.currentState}</strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="btn btn-secondary">
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={transmitting}>
                  <Send size={15} />
                  <span>{transmitting ? 'Transmitting...' : 'Transmit Frame to Atlas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitoring;
