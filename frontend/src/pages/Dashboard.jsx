/**
 * Main Industrial Monitoring Dashboard
 * Real-time KPI summaries, multi-parameter time-series charts, and fleet telemetry.
 */

import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RadioOff,
  Bell,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getSensorReadings, getStateTransitions } from '../services/api';

const STATE_COLORS = {
  NORMAL: '#10b981',
  WARNING: '#f59e0b',
  FAULTY: '#ef4444',
  DISCONNECTED: '#64748b'
};

export const Dashboard = () => {
  const {
    devices,
    alerts,
    alertSummary,
    simulationStatus,
    triggerAnomaly,
    disconnectDevice,
    restoreDevice
  } = useSystem();

  const [historyReadings, setHistoryReadings] = useState([]);
  const [recentTransitions, setRecentTransitions] = useState([]);

  // Fetch recent historical readings for time-series charts
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [readingsRes, transRes] = await Promise.all([
          getSensorReadings({ limit: 40 }),
          getStateTransitions({ limit: 8 })
        ]);
        if (readingsRes.success) {
          // Reverse so oldest is on left, newest on right
          const formatted = (readingsRes.data || [])
            .map((r) => ({
              time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              temp: r.temperature,
              hum: r.humidity,
              press: r.pressure,
              deviceId: r.deviceId,
              state: r.stateAtReading
            }))
            .reverse();
          setHistoryReadings(formatted);
        }
        if (transRes.success) {
          setRecentTransitions(transRes.data || []);
        }
      } catch (err) {
        // Handled silently
      }
    };

    fetchChartData();
    const interval = setInterval(fetchChartData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute status counts
  const counts = {
    total: devices.length,
    normal: devices.filter((d) => d.currentState === 'NORMAL').length,
    warning: devices.filter((d) => d.currentState === 'WARNING').length,
    faulty: devices.filter((d) => d.currentState === 'FAULTY').length,
    disconnected: devices.filter((d) => d.currentState === 'DISCONNECTED').length
  };

  const pieData = [
    { name: 'NORMAL', value: counts.normal, color: STATE_COLORS.NORMAL },
    { name: 'WARNING', value: counts.warning, color: STATE_COLORS.WARNING },
    { name: 'FAULTY', value: counts.faulty, color: STATE_COLORS.FAULTY },
    { name: 'DISCONNECTED', value: counts.disconnected, color: STATE_COLORS.DISCONNECTED }
  ].filter((d) => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Telemetry Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Multi-device simulated IoT anomaly classification and real-time DFA monitoring
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
            <Activity size={12} />
            {simulationStatus.isRunning ? 'Simulator Active' : 'Simulator Idle'}
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-cols-4">
        {/* Total Devices */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL NODES</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
              <Cpu size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.5rem' }}>{counts.total}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Managed IOT-001 to IOT-005</span>
        </div>

        {/* Normal Devices */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>NORMAL</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--state-normal-bg)', color: 'var(--state-normal)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--state-normal)' }}>{counts.normal}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>All metrics within bounds</span>
        </div>

        {/* Warning & Faulty Devices */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ANOMALIES</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--state-faulty-bg)', color: 'var(--state-faulty)' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--state-faulty)' }}>{counts.faulty}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--state-warning)' }}>+{counts.warning} warning</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>DFA State S1 & S2</span>
        </div>

        {/* Disconnected Devices */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>DISCONNECTED</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--state-disconnected-bg)', color: 'var(--state-disconnected)' }}>
              <RadioOff size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--state-disconnected)' }}>{counts.disconnected}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Watchdog timeout (&gt;15s)</span>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid-cols-3">
        {/* Temperature History Chart */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
              Live Telemetry Stream (Temperature & Humidity)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated dynamically</span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            {historyReadings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#38bdf8" fillOpacity={1} fill="url(#tempGradient)" name="Temperature (°C)" />
                  <Area type="monotone" dataKey="hum" stroke="#10b981" fillOpacity={1} fill="url(#humGradient)" name="Humidity (%)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                No telemetry streamed yet. Click "Start Sim" in the top bar.
              </div>
            )}
          </div>
        </div>

        {/* State Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">DFA State Distribution</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.75rem' }}>
                  {pieData.map((d) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }} />
                      <span style={{ color: 'var(--text-muted)' }}>{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>No active devices</p>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Live Table & Quick Controls */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">IoT Fleet Nodes & Telemetry</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interactive demonstration controls</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Device Name & Location</th>
                <th>Current State</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Pressure</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => {
                const tel = dev.latestTelemetry;
                return (
                  <tr key={dev.deviceId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {dev.deviceId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{dev.deviceName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{dev.location}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${dev.currentState.toLowerCase()}`}>
                        {dev.currentState}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {tel ? `${tel.temperature}°C` : '--'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {tel ? `${tel.humidity}%` : '--'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {tel ? `${tel.pressure} hPa` : '--'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {dev.lastSeen ? new Date(dev.lastSeen).toLocaleTimeString() : '--'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => triggerAnomaly(dev.deviceId, 'WARNING')}
                          className="btn btn-secondary btn-sm"
                          title="Inject Warning Anomaly"
                        >
                          Warn
                        </button>
                        <button
                          onClick={() => triggerAnomaly(dev.deviceId, 'FAULTY')}
                          className="btn btn-danger btn-sm"
                          title="Inject Critical Fault Anomaly"
                        >
                          Fault
                        </button>
                        {dev.currentState !== 'DISCONNECTED' ? (
                          <button
                            onClick={() => disconnectDevice(dev.deviceId)}
                            className="btn btn-secondary btn-sm"
                            title="Disconnect Device"
                          >
                            Halt
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreDevice(dev.deviceId)}
                            className="btn btn-primary btn-sm"
                            title="Restore Device"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts & State Transitions */}
      <div className="grid-cols-2">
        {/* Recent Anomaly Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bell size={16} style={{ color: 'var(--state-warning)' }} />
              Recent Anomaly Alerts
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `4px solid ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'var(--state-faulty)' : 'var(--state-warning)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.deviceId}</span>
                    <span className={`badge badge-${alert.alertType.toLowerCase()}`}>
                      {alert.alertType}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {alert.message}
                  </p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No active anomaly alerts detected
              </p>
            )}
          </div>
        </div>

        {/* Recent DFA State Transitions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
              Recent Automata Transitions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTransitions.slice(0, 5).map((trans) => (
              <div
                key={trans._id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                    {trans.deviceId}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <span className={`badge badge-${trans.previousState.toLowerCase()}`}>{trans.previousState}</span>
                    <span>──[{trans.inputSymbol}]──►</span>
                    <span className={`badge badge-${trans.nextState.toLowerCase()}`}>{trans.nextState}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {new Date(trans.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {recentTransitions.length === 0 && (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No state transitions logged yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
