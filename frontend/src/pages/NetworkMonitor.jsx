/**
 * Computer Networks Telemetry & Diagnostics Page
 * Live RTT latency, HTTP traffic statistics, database health, and OSI/TCP-IP educational section.
 */

import React, { useState, useEffect } from 'react';
import { getNetworkStats } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { Network, Server, Database, Globe, Layers, ArrowUpRight, Clock, Activity } from 'lucide-react';

export const NetworkMonitor = () => {
  const { isBackendOnline, lastLatencyMs, showToast } = useSystem();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await getNetworkStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      // Ignored silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const http = stats ? stats.httpMetrics : null;
  const db = stats ? stats.database : null;
  const server = stats ? stats.server : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Computer Networks Diagnostics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time HTTP traffic monitoring, RTT latency tracking, and OSI layer mapping
        </p>
      </div>

      {/* Connection Status KPI Cards */}
      <div className="grid-cols-4">
        {/* Frontend Connection */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FRONTEND CLIENT</span>
            <Globe size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--state-normal)', marginTop: '0.35rem' }}>
            ONLINE
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>React 19 SPA (Vite)</span>
        </div>

        {/* Backend Connection */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>BACKEND API</span>
            <Server size={18} style={{ color: isBackendOnline ? 'var(--state-normal)' : 'var(--state-faulty)' }} />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: isBackendOnline ? 'var(--state-normal)' : 'var(--state-faulty)', marginTop: '0.35rem' }}>
            {isBackendOnline ? 'HEALTHY' : 'DOWN'}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Node.js & Express REST</span>
        </div>

        {/* Database Connection */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DATABASE CLUSTER</span>
            <Database size={18} style={{ color: db?.isConnected ? 'var(--state-normal)' : 'var(--state-warning)' }} />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: db?.isConnected ? 'var(--state-normal)' : 'var(--state-warning)', marginTop: '0.35rem' }}>
            {db?.status || 'CONNECTING'}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {db?.host ? `${db.host}` : 'MongoDB Cluster'}
          </span>
        </div>

        {/* Round Trip Time */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>BROWSER RTT LATENCY</span>
            <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            {lastLatencyMs} ms
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Client-side measured RTT</span>
        </div>
      </div>

      {/* HTTP Traffic & Methods Metrics */}
      <div className="grid-cols-2">
        {/* HTTP Methods & Status Codes */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              HTTP Request & Response Telemetry
            </h3>
          </div>
          {http ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>TOTAL REQUESTS</span>
                  <strong style={{ fontSize: '1.25rem' }}>{http.totalRequests}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>SUCCESS (2xx)</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--state-normal)' }}>{http.statusCodes['2xx']}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>ERRORS (4xx/5xx)</span>
                  <strong style={{ fontSize: '1.25rem', color: http.failedRequests > 0 ? 'var(--state-faulty)' : 'var(--text-muted)' }}>
                    {http.failedRequests}
                  </strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  HTTP METHOD BREAKDOWN:
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {Object.entries(http.methods).map(([method, count]) => (
                    <div key={method} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{method}:</strong> {count}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>Loading network telemetry...</p>
          )}
        </div>

        {/* Server Memory & Environment */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Runtime Environment Telemetry</h3>
          </div>
          {server ? (
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Node.js Version:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{server.nodeVersion}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operating System:</span>
                <span>{server.platform}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Process Uptime:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{server.uptimeSeconds} seconds</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Heap Memory:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{server.memoryUsageMB.heapUsed} MB / {server.memoryUsageMB.heapTotal} MB</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>Querying runtime telemetry...</p>
          )}
        </div>
      </div>

      {/* Live Recent HTTP Requests Rolling Buffer */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Live HTTP Traffic Log (Last 30 Requests)</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Real-time server duration logging</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Request Path</th>
                <th>Status</th>
                <th>Server Duration (ms)</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentRequests?.slice(0, 10).map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{r.method}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{r.path}</td>
                  <td>
                    <span className={`badge ${r.statusCode < 400 ? 'badge-normal' : 'badge-faulty'}`}>
                      {r.statusCode}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{r.durationMs} ms</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational OSI & TCP/IP Layer Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
            OSI 7-Layer & TCP/IP Architectural Mapping
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', fontSize: '0.825rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.5rem' }}>OSI 7-Layer Model:</h4>
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-muted)' }}>
              <li><strong>Layer 7 (Application):</strong> HTTP/REST endpoints (/api/sensors, /api/devices, /api/alerts).</li>
              <li><strong>Layer 6 (Presentation):</strong> JSON serialization, ASCII text encoding of pipe-delimited frames.</li>
              <li><strong>Layer 5 (Session):</strong> HTTP Keep-Alive, TCP connection session management.</li>
              <li><strong>Layer 4 (Transport):</strong> TCP reliability, port multiplexing (Port 5000 / 10000).</li>
              <li><strong>Layer 3 (Network):</strong> IP packet routing across local and cloud hosting subnets.</li>
              <li><strong>Layer 2 (Data Link):</strong> Ethernet / Wi-Fi frame transmission between gateways.</li>
              <li><strong>Layer 1 (Physical):</strong> Physical hardware cables, RF signals, and optical links.</li>
            </ol>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.5rem' }}>Corresponding TCP/IP 4-Layer Stack:</h4>
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <li><strong>Application Layer:</strong> HTTP/1.1 REST APIs, JSON data serialization.</li>
              <li><strong>Transport Layer:</strong> Transmission Control Protocol (TCP) with TLS encryption.</li>
              <li><strong>Internet Layer:</strong> Internet Protocol (IPv4/IPv6) address routing.</li>
              <li><strong>Network Access Layer:</strong> Physical link and network interface controllers (NIC).</li>
            </ol>
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              Note: The application implements Layers 6 & 7 (HTTP REST and JSON serialization) while relying on underlying operating system network stacks for Layers 1-5.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMonitor;
