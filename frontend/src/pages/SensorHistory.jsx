/**
 * Sensor Telemetry History Page
 * Tabular historical records, multi-parameter filtering, pagination, and CSV export.
 */

import React, { useState, useEffect } from 'react';
import { getSensorReadings } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export const SensorHistory = () => {
  const { devices, showToast } = useSystem();
  const [readings, setReadings] = useState([]);
  const [meta, setMeta] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1, limit: 20 });
  const [deviceId, setDeviceId] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getSensorReadings({
        deviceId: deviceId || undefined,
        state: state || undefined,
        page,
        limit: 20
      });
      if (res.success) {
        setReadings(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      showToast('Failed to load sensor history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, deviceId, state]);

  // CSV Export Routine
  const handleExportCSV = () => {
    if (readings.length === 0) {
      showToast('No records available to export', 'warning');
      return;
    }

    const headers = ['Record ID', 'Device ID', 'Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)', 'State', 'Validation', 'Timestamp', 'Raw Frame'];
    const rows = readings.map((r) => [
      r._id,
      r.deviceId,
      r.temperature,
      r.humidity,
      r.pressure,
      r.stateAtReading,
      r.validationStatus,
      new Date(r.timestamp).toISOString(),
      `"${r.rawMessage.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `iot_sensor_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported sensor telemetry CSV', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Sensor Reading History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Historical time-series telemetry records persisted in MongoDB Atlas
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary">
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters:</span>
        </div>

        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={deviceId}
          onChange={(e) => { setDeviceId(e.target.value); setPage(1); }}
        >
          <option value="">All Devices</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.deviceId} - {d.deviceName}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={state}
          onChange={(e) => { setState(e.target.value); setPage(1); }}
        >
          <option value="">All States</option>
          <option value="NORMAL">NORMAL</option>
          <option value="WARNING">WARNING</option>
          <option value="FAULTY">FAULTY</option>
          <option value="DISCONNECTED">DISCONNECTED</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Total Logged: {meta.totalRecords} records
        </span>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Device ID</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Pressure (hPa)</th>
                <th>State at Reading</th>
                <th>Validation</th>
                <th>Raw Message Wire Frame</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(r.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {r.deviceId}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.temperature}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.humidity}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.pressure}</td>
                  <td>
                    <span className={`badge badge-${r.stateAtReading.toLowerCase()}`}>
                      {r.stateAtReading}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--state-normal)', fontSize: '0.75rem', fontWeight: 600 }}>
                      ACCEPTED
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {r.rawMessage}
                  </td>
                </tr>
              ))}
              {readings.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    {loading ? 'Fetching telemetry history...' : 'No sensor records match the current criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page {meta.currentPage} of {meta.totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.currentPage <= 1}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.currentPage >= meta.totalPages}
              className="btn btn-secondary btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorHistory;
