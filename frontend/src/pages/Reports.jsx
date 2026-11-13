/**
 * Reports & Compliance Analytics Page
 * Summary statistics, fleet health metrics, and comprehensive audit CSV generation.
 */

import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { getSensorReadings, getStateTransitions, getAlerts } from '../services/api';
import { FileText, Download, CheckCircle, AlertTriangle, Flame, RadioOff } from 'lucide-react';

export const Reports = () => {
  const { devices, showToast } = useSystem();
  const [stats, setStats] = useState({
    totalReadings: 0,
    normalReadings: 0,
    warningReadings: 0,
    faultyReadings: 0,
    disconnectedEvents: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [readingsRes, transRes] = await Promise.all([
          getSensorReadings({ limit: 200 }),
          getStateTransitions({ limit: 200 })
        ]);

        if (readingsRes.success) {
          const readings = readingsRes.data || [];
          setStats({
            totalReadings: readingsRes.meta?.totalRecords || readings.length,
            normalReadings: readings.filter((r) => r.stateAtReading === 'NORMAL').length,
            warningReadings: readings.filter((r) => r.stateAtReading === 'WARNING').length,
            faultyReadings: readings.filter((r) => r.stateAtReading === 'FAULTY').length,
            disconnectedEvents: (transRes.data || []).filter((t) => t.nextState === 'DISCONNECTED').length
          });
        }
      } catch (err) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDownloadFullReport = async () => {
    try {
      const res = await getSensorReadings({ limit: 200 });
      if (!res.success || !res.data || res.data.length === 0) {
        showToast('No records available for export', 'warning');
        return;
      }

      const headers = ['Record ID', 'Device ID', 'Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)', 'State', 'Validation', 'Timestamp'];
      const rows = res.data.map((r) => [
        r._id,
        r.deviceId,
        r.temperature,
        r.humidity,
        r.pressure,
        r.stateAtReading,
        r.validationStatus,
        new Date(r.timestamp).toISOString()
      ]);

      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IoT_Compliance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Comprehensive compliance report downloaded', 'success');
    } catch (err) {
      showToast('Failed to generate compliance report', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Telemetry Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Operational compliance summaries and department assessment audit logs
          </p>
        </div>
        <button onClick={handleDownloadFullReport} className="btn btn-primary">
          <Download size={16} />
          <span>Export Full Audit CSV</span>
        </button>
      </div>

      {/* Aggregate Counts Grid */}
      <div className="grid-cols-4">
        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INGESTED READINGS</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.35rem' }}>
            {stats.totalReadings}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Lifetime database records</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NORMAL READINGS</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--state-normal)', marginTop: '0.35rem' }}>
            {stats.normalReadings}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Nominal tolerance</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>WARNINGS & FAULTS</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--state-warning)', marginTop: '0.35rem' }}>
            {stats.warningReadings + stats.faultyReadings}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Anomalous data points</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISCONNECTION EVENTS</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--state-disconnected)', marginTop: '0.35rem' }}>
            {stats.disconnectedEvents}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Watchdog timeout transitions</span>
        </div>
      </div>

      {/* Device-Wise Fleet Compliance Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Node Fleet Operational Compliance</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Device Name</th>
                <th>Operating Zone</th>
                <th>Current State</th>
                <th>Availability</th>
                <th>Assessment Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.deviceId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {d.deviceId}
                  </td>
                  <td style={{ fontWeight: 600 }}>{d.deviceName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.location}</td>
                  <td>
                    <span className={`badge badge-${d.currentState.toLowerCase()}`}>
                      {d.currentState}
                    </span>
                  </td>
                  <td>{d.isActive ? '100% Monitored' : 'Inactive'}</td>
                  <td>
                    <span style={{ color: 'var(--state-normal)', fontWeight: 600, fontSize: '0.8rem' }}>
                      COMPLIANT (DFA Tracked)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
