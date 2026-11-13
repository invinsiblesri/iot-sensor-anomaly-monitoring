/**
 * Device Management Page
 * Complete CRUD interface for IoT devices.
 */

import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Plus, Edit, Trash2, Cpu, MapPin, Activity, Check, X } from 'lucide-react';
import { createDevice, updateDevice, deleteDevice } from '../services/api';

export const Devices = () => {
  const { devices, refreshAll, showToast } = useSystem();
  const [filterState, setFilterState] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    location: '',
    description: '',
    isActive: true
  });

  const filteredDevices = devices.filter((d) => {
    if (filterState === 'ALL') return true;
    return d.currentState === filterState;
  });

  const handleOpenAdd = () => {
    setEditingDevice(null);
    setFormData({
      deviceId: `IOT-00${devices.length + 1}`,
      deviceName: '',
      location: '',
      description: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dev) => {
    setEditingDevice(dev);
    setFormData({
      deviceId: dev.deviceId,
      deviceName: dev.deviceName,
      location: dev.location,
      description: dev.description || '',
      isActive: dev.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.deviceId, formData);
        showToast(`Device ${formData.deviceId} updated successfully`, 'success');
      } else {
        await createDevice(formData);
        showToast(`Device ${formData.deviceId} created successfully`, 'success');
      }
      setIsModalOpen(false);
      refreshAll();
    } catch (err) {
      showToast(err.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (deviceId) => {
    if (window.confirm(`Are you sure you want to decommission device ${deviceId}?`)) {
      try {
        await deleteDevice(deviceId);
        showToast(`Device ${deviceId} removed`, 'info');
        refreshAll();
      } catch (err) {
        showToast(err.error || 'Failed deleting device', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Device Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Provision, inspect, reconfigure, and decommission IoT monitoring nodes
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Register New Device</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Filter by State:</span>
        {['ALL', 'NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterState(s)}
            className={`btn btn-sm ${filterState === s ? 'btn-primary' : 'btn-secondary'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Device Cards Grid */}
      <div className="grid-cols-3">
        {filteredDevices.map((dev) => (
          <div key={dev.deviceId} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                  {dev.deviceId}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.15rem' }}>{dev.deviceName}</h3>
              </div>
              <span className={`badge badge-${dev.currentState.toLowerCase()}`}>
                {dev.currentState}
              </span>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} style={{ color: 'var(--text-dim)' }} />
                <span>{dev.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} style={{ color: 'var(--text-dim)' }} />
                <span>Status: {dev.isActive ? 'Active' : 'Disabled'}</span>
              </div>
              {dev.description && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                  {dev.description}
                </p>
              )}
            </div>

            {/* Latest Telemetry Snapshot */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-around', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', display: 'block' }}>TEMP</span>
                <span>{dev.latestTelemetry ? `${dev.latestTelemetry.temperature}°C` : '--'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', display: 'block' }}>HUM</span>
                <span>{dev.latestTelemetry ? `${dev.latestTelemetry.humidity}%` : '--'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', display: 'block' }}>PRESS</span>
                <span>{dev.latestTelemetry ? `${dev.latestTelemetry.pressure} hPa` : '--'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button onClick={() => handleOpenEdit(dev)} className="btn btn-secondary btn-sm">
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button onClick={() => handleDelete(dev.deviceId)} className="btn btn-danger btn-sm">
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-card)' }}>
            <div className="card-header">
              <h3 className="card-title">{editingDevice ? `Edit ${editingDevice.deviceId}` : 'Register New Device'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Device ID (e.g. IOT-006)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.deviceId}
                  disabled={!!editingDevice}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Device Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  placeholder="e.g. Server Room Cold Aisle Monitor"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Building B, Room 204"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Operational notes or sensor purpose"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDevice ? 'Save Changes' : 'Create Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
