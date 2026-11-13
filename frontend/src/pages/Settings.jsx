/**
 * System Settings Configuration Page
 * Configures threshold limits for DFA classification, watchdog timeouts, and simulation intervals.
 */

import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';

export const Settings = () => {
  const { showToast } = useSystem();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    temperatureThresholds: { normalMin: 18, normalMax: 30, warningMin: 5, warningMax: 40 },
    humidityThresholds: { normalMin: 30, normalMax: 60, warningMin: 15, warningMax: 80 },
    pressureThresholds: { normalMin: 980, normalMax: 1030, warningMin: 950, warningMax: 1050 },
    disconnectTimeout: 15,
    simulationInterval: 3
  });

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSettings(settings);
      if (res.success) {
        showToast('System configuration saved successfully', 'success');
      }
    } catch (err) {
      showToast(err.error || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      temperatureThresholds: { normalMin: 18, normalMax: 30, warningMin: 5, warningMax: 40 },
      humidityThresholds: { normalMin: 30, normalMax: 60, warningMin: 15, warningMax: 80 },
      pressureThresholds: { normalMin: 980, normalMax: 1030, warningMin: 950, warningMax: 1050 },
      disconnectTimeout: 15,
      simulationInterval: 3
    });
    showToast('Reset fields to initial demonstration standards', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>System Settings & Thresholds</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configures mathematical boundary parameters for DFA input alphabet classification
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Temperature Thresholds */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Temperature Thresholds (°C)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Critical Min (Fault &lt;):</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={settings.temperatureThresholds.warningMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperatureThresholds: { ...settings.temperatureThresholds, warningMin: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Min (≥):</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={settings.temperatureThresholds.normalMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperatureThresholds: { ...settings.temperatureThresholds, normalMin: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Max (≤):</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={settings.temperatureThresholds.normalMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperatureThresholds: { ...settings.temperatureThresholds, normalMax: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Critical Max (Fault &gt;):</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={settings.temperatureThresholds.warningMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperatureThresholds: { ...settings.temperatureThresholds, warningMax: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Humidity Thresholds */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Humidity Thresholds (%)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Critical Min (Fault &lt;):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.humidityThresholds.warningMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    humidityThresholds: { ...settings.humidityThresholds, warningMin: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Min (≥):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.humidityThresholds.normalMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    humidityThresholds: { ...settings.humidityThresholds, normalMin: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Max (≤):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.humidityThresholds.normalMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    humidityThresholds: { ...settings.humidityThresholds, normalMax: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Critical Max (Fault &gt;):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.humidityThresholds.warningMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    humidityThresholds: { ...settings.humidityThresholds, warningMax: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Atmospheric Pressure Thresholds */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Atmospheric Pressure Thresholds (hPa)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Critical Min (Fault &lt;):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.pressureThresholds.warningMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pressureThresholds: { ...settings.pressureThresholds, warningMin: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Min (≥):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.pressureThresholds.normalMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pressureThresholds: { ...settings.pressureThresholds, normalMin: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Normal Max (≤):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.pressureThresholds.normalMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pressureThresholds: { ...settings.pressureThresholds, normalMax: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Critical Max (Fault &gt;):</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={settings.pressureThresholds.warningMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pressureThresholds: { ...settings.pressureThresholds, warningMax: parseFloat(e.target.value) }
                  })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Operational Timeouts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Watchdog & Simulation Tuning</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Disconnection Watchdog Timeout (seconds):</label>
              <input
                type="number"
                className="form-input"
                min="5"
                max="300"
                value={settings.disconnectTimeout}
                onChange={(e) => setSettings({ ...settings, disconnectTimeout: parseInt(e.target.value, 10) })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Default: 15 seconds</span>
            </div>

            <div className="form-group">
              <label className="form-label">Simulation Generation Tick (seconds):</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="60"
                value={settings.simulationInterval}
                onChange={(e) => setSettings({ ...settings, simulationInterval: parseInt(e.target.value, 10) })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Default: 3 seconds</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={handleResetDefaults} className="btn btn-secondary">
            <RotateCcw size={16} />
            <span>Reset Demo Defaults</span>
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
