/**
 * Main Application Layout Wrapper
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSystem } from '../context/SystemContext';

export const MainLayout = () => {
  const { toast } = useSystem();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <Header />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor:
              toast.type === 'error'
                ? '#ef4444'
                : toast.type === 'warning'
                ? '#f59e0b'
                : toast.type === 'success'
                ? '#10b981'
                : '#38bdf8',
            color: toast.type === 'warning' ? '#000' : '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
