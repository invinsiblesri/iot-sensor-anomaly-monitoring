/**
 * Live Monitoring Page
 * Real-time auto-refresh telemetry grid showing current sensor parameters per device.
 */

import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Activity, Thermometer, Droplets, Gauge, AlertCircle, RefreshCw } from 'lucide-react';

export const LiveMonitoring = () => {
  const { devices, lastPollTime, isPollingActive, refreshAll } = useSystem();
  const [selectedDevice, setSelectedDevice] = useState('ALL');

  const filteredDevices = devices.filter((d) => {
    if (selectedDevice === 'ALL') return true;
    return d.deviceId === selectedDevice;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Live Telemetry Monitor</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Synchronous REST polling stream (3-second refresh cycle)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Last received: {lastPollTime ? lastPollTime.toLocaleTimeString() : 'Connecting...'}
          </span>
          <button onClick={refreshAll} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Device Filter */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Filter Node:</span>
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
                <span className={`badge badge-${dev.currentState.toLowerCase()}`}>
                  {dev.currentState}
                </span>
              </div>

              {/* Gauges Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {/* Temperature */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#38bdf8', marginBottom: '0.25rem' }}>
                    <Thermometer size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TEMPERATURE</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.25rem', color: temp > 40 || temp < 5 ? 'var(--state-faulty)' : temp > 30 || temp < 18 ? 'var(--state-warning)' : '#fff' }}>
                    {temp !== null ? `${temp}°C` : '--'}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Normal: 18-30°C</span>
                </div>

                {/* Humidity */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: '0.25rem' }}>
                    <Droplets size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HUMIDITY</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.25rem', color: hum > 80 || hum < 15 ? 'var(--state-faulty)' : hum > 60 || hum < 30 ? 'var(--state-warning)' : '#fff' }}>
                    {hum !== null ? `${hum}%` : '--'}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Normal: 30-60%</span>
                </div>

                {/* Pressure */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '0.25rem' }}>
                    <Gauge size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRESSURE</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.25rem', color: press > 1050 || press < 950 ? 'var(--state-faulty)' : press > 1030 || press < 980 ? 'var(--state-warning)' : '#fff' }}>
                    {press !== null ? `${press}` : '--'}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Normal: 980-1030 hPa</span>
                </div>
              </div>

              {/* Raw Frame Wire Banner */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', overflowX: 'auto' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>WIRE FRAME: </span>
                {tel ? tel.rawMessage : 'Awaiting sensor frame transmission...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMonitoring;
