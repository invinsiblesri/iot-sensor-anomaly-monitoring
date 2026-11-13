/**
 * Root React Application Component
 * Sets up BrowserRouter, SystemProvider, and routes for all 10 operational pages.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SystemProvider } from './context/SystemContext';
import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import LiveMonitoring from './pages/LiveMonitoring';
import SensorHistory from './pages/SensorHistory';
import AnomalyAlerts from './pages/AnomalyAlerts';
import AutomataTheory from './pages/AutomataTheory';
import MessageValidator from './pages/MessageValidator';
import NetworkMonitor from './pages/NetworkMonitor';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export function App() {
  return (
    <SystemProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<Devices />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="history" element={<SensorHistory />} />
            <Route path="alerts" element={<AnomalyAlerts />} />
            <Route path="automata" element={<AutomataTheory />} />
            <Route path="validator" element={<MessageValidator />} />
            <Route path="network" element={<NetworkMonitor />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SystemProvider>
  );
}

export default App;
