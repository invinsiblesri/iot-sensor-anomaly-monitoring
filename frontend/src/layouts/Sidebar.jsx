/**
 * Sidebar Navigation Component
 * Provides clean access to all 10 core pages with active indicators and Lucide icons.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  History,
  AlertTriangle,
  GitBranch,
  CheckCircle,
  Network,
  FileText,
  Settings,
  Radio
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Device Management', icon: Cpu },
  { path: '/live', label: 'Live Monitoring', icon: Activity },
  { path: '/history', label: 'Sensor History', icon: History },
  { path: '/alerts', label: 'Anomaly Alerts', icon: AlertTriangle },
  { path: '/automata', label: 'DFA Automaton', icon: GitBranch },
  { path: '/validator', label: 'Message Validator', icon: CheckCircle },
  { path: '/network', label: 'Network Monitor', icon: Network },
  { path: '/reports', label: 'Reports & CSV', icon: FileText },
  { path: '/settings', label: 'System Settings', icon: Settings }
];

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Radio size={24} />
        </div>
        <div className="sidebar-brand">
          IoT Anomaly <span>DFA</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Academic Project 26-27</p>
        <p>IT Department Assessment</p>
      </div>
    </aside>
  );
};

export default Sidebar;
