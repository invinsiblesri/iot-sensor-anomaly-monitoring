/**
 * Anomaly Alerts Page
 * Feed of active and acknowledged alerts with one-click acknowledgement.
 */

import React, { useState, useEffect } from 'react';
import { getAlerts, acknowledgeAlert } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { AlertTriangle, CheckCircle, Flame, RadioOff, ShieldAlert } from 'lucide-react';

export const AnomalyAlerts = () => {
  const { alertSummary, refreshAll, showToast } = useSystem();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await getAlerts({
        severity: severityFilter || undefined,
        acknowledged: showAcknowledged ? undefined : false,
        limit: 50
      });
      if (res.success) {
        setAlerts(res.data || []);
      }
    } catch (err) {
      showToast('Failed to fetch alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, showAcknowledged]);

  const handleAcknowledge = async (id) => {
    try {
      const res = await acknowledgeAlert(id);
      if (res.success) {
        showToast('Alert acknowledged', 'success');
        fetchAlerts();
        refreshAll();
      }
    } catch (err) {
      showToast('Failed to acknowledge alert', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Anomaly Alerts</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time incident management for telemetry entering Warning or Faulty states
        </p>
      </div>

      {/* Severity Breakdown Cards */}
      <div className="grid-cols-4">
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CRITICAL / FAULTY</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444', marginTop: '0.35rem' }}>
            {(alertSummary.severityBreakdown?.CRITICAL || 0) + (alertSummary.severityBreakdown?.HIGH || 0)}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Requires immediate intervention</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEDIUM / WARNING</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.35rem' }}>
            {alertSummary.severityBreakdown?.MEDIUM || 0}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Degradation from normal tolerance</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE UNACKNOWLEDGED</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.35rem' }}>
            {alertSummary.unacknowledgedTotal || 0}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Pending operator action</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONITORED INCIDENTS</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem' }}>
            {alerts.length}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Current query count</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Severity:</span>
        <button
          onClick={() => setSeverityFilter('')}
          className={`btn btn-sm ${severityFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Severities
        </button>
        {['HIGH', 'MEDIUM', 'LOW'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`btn btn-sm ${severityFilter === sev ? 'btn-primary' : 'btn-secondary'}`}
          >
            {sev}
          </button>
        ))}

        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
          />
          <span>Include Acknowledged Alerts</span>
        </label>
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {alerts.map((a) => (
          <div
            key={a._id}
            className="card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: `5px solid ${a.alertType === 'FAULTY' ? 'var(--state-faulty)' : a.alertType === 'WARNING' ? 'var(--state-warning)' : 'var(--state-disconnected)'}`,
              opacity: a.acknowledged ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {a.deviceId}
                </span>
                <span className={`badge badge-${a.alertType.toLowerCase()}`}>
                  {a.alertType}
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  SEV: {a.severity}
                </span>
                {a.acknowledged && (
                  <span style={{ color: 'var(--state-normal)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={12} /> Acknowledged
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {a.message}
              </p>

              {a.sensorValues && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {a.sensorValues.temperature !== null && <span>Temp: {a.sensorValues.temperature}°C</span>}
                  {a.sensorValues.humidity !== null && <span>Hum: {a.sensorValues.humidity}%</span>}
                  {a.sensorValues.pressure !== null && <span>Press: {a.sensorValues.pressure} hPa</span>}
                </div>
              )}

              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Triggered: {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>

            <div>
              {!a.acknowledged ? (
                <button onClick={() => handleAcknowledge(a._id)} className="btn btn-secondary btn-sm">
                  <CheckCircle size={14} />
                  <span>Acknowledge</span>
                </button>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Resolved</span>
              )}
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p>No alerts found matching the active criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAlerts;
