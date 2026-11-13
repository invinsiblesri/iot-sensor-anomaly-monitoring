/**
 * Automata Theory & DFA Visualization Page
 * Interactive 4-State Deterministic Finite Automaton (DFA) diagram,
 * formal 5-tuple mathematical definition, and manual testbench.
 */

import React, { useState, useEffect } from 'react';
import {
  getAutomataDefinition,
  simulateAutomataTransition,
  getAutomataHistory
} from '../services/api';
import { useSystem } from '../context/SystemContext';
import { GitBranch, Play, BookOpen, CheckCircle, Zap } from 'lucide-react';

export const AutomataTheory = () => {
  const { showToast } = useSystem();
  const [definition, setDefinition] = useState(null);
  const [history, setHistory] = useState([]);

  // Sandbox Testbench State
  const [testState, setTestState] = useState('NORMAL');
  const [testSymbol, setTestSymbol] = useState('b');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [defRes, histRes] = await Promise.all([
          getAutomataDefinition(),
          getAutomataHistory({ limit: 10 })
        ]);
        if (defRes.success) setDefinition(defRes.data);
        if (histRes.success) setHistory(histRes.data || []);
      } catch (err) {
        showToast('Failed loading automata definition', 'error');
      }
    };
    fetchData();
  }, []);

  const handleExecuteTransition = async () => {
    try {
      const res = await simulateAutomataTransition(testState, testSymbol);
      if (res.success) {
        setLastResult(res.data);
        setTestState(res.data.nextState);
        showToast(`Transition executed: ${res.data.previousState} ──[${res.data.inputSymbol}]──► ${res.data.nextState}`, 'success');
      }
    } catch (err) {
      showToast(err.error || 'Transition failed', 'error');
    }
  };

  const states = ['NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Formal Languages & Automata Theory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          4-State Deterministic Finite Automaton (DFA) governing IoT anomaly classification
        </p>
      </div>

      {/* Visual DFA Interactive Graph */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <GitBranch size={18} style={{ color: 'var(--accent-cyan)' }} />
            Operational State Machine Topology (DFA)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Active Sandbox State: <strong style={{ color: 'var(--accent-cyan)' }}>{testState}</strong>
          </span>
        </div>

        {/* State Node Visualizer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', margin: '1rem 0' }}>
          {states.map((s, idx) => {
            const isActive = testState === s;
            const color =
              s === 'NORMAL'
                ? '#10b981'
                : s === 'WARNING'
                ? '#f59e0b'
                : s === 'FAULTY'
                ? '#ef4444'
                : '#64748b';

            return (
              <div
                key={s}
                style={{
                  border: `2px solid ${isActive ? color : 'var(--border-color)'}`,
                  backgroundColor: isActive ? `${color}18` : 'var(--bg-primary)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  boxShadow: isActive ? `0 0 20px ${color}40` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  STATE S{idx} {s === 'NORMAL' && '(q₀)'}
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color, marginTop: '0.25rem' }}>
                  {s}
                </h4>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {s === 'NORMAL' && 'Nominal tolerance'}
                  {s === 'WARNING' && 'Warning band entered'}
                  {s === 'FAULTY' && 'Critical bounds violated'}
                  {s === 'DISCONNECTED' && 'Heartbeat timeout'}
                </div>
                {isActive && (
                  <span className="badge badge-normal" style={{ marginTop: '0.5rem', backgroundColor: `${color}30`, color }}>
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Transition Simulator Testbench */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '10px', marginTop: '1rem', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
            Interactive Automaton Step-by-Step Testbench
          </h4>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label className="form-label">Current State (q ∈ Q):</label>
              <select className="form-select" value={testState} onChange={(e) => setTestState(e.target.value)}>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="form-label">Input Symbol (σ ∈ Σ):</label>
              <select className="form-select" value={testSymbol} onChange={(e) => setTestSymbol(e.target.value)}>
                <option value="a">a = Normal telemetry reading</option>
                <option value="b">b = Warning tolerance violation</option>
                <option value="c">c = Critical faulty limit reached</option>
                <option value="d">d = Connection heartbeat timeout</option>
              </select>
            </div>

            <button onClick={handleExecuteTransition} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
              <Play size={16} />
              <span>Execute Transition δ(q, σ)</span>
            </button>
          </div>

          {lastResult && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: 'var(--accent-cyan)' }}>Transition Result: </strong>
                <span>δ({lastResult.previousState}, '{lastResult.inputSymbol}') ──► </span>
                <span className={`badge badge-${lastResult.nextState.toLowerCase()}`}>{lastResult.nextState}</span>
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{lastResult.inputDescription}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mathematical 5-Tuple & Formal Theory */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BookOpen size={18} style={{ color: 'var(--accent-cyan)' }} />
              Formal 5-Tuple Definition
            </h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
              M = (Q, Σ, δ, q₀, F)
            </p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>Q = </strong>
                {'{ NORMAL, WARNING, FAULTY, DISCONNECTED }'} (Finite set of states)
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>Σ = </strong>
                {'{ a, b, c, d }'} (Input alphabet derived from sensor threshold mapping)
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>δ : Q × Σ → Q</strong>
                (Deterministic transition function with 16 explicit mappings)
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>q₀ = </strong>
                NORMAL (Initial startup state upon deployment)
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>F = Q</strong>
                (All 4 operational states are accepting assessment states)
              </li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Viva Key Points</h3>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>1. Why is this automaton strictly deterministic?</strong>
              <p>For every state q ∈ Q and every symbol σ ∈ Σ, exactly one transition is defined. There are no ε-moves or branching ambiguities.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>2. How is the Alphabet derived?</strong>
              <p>Physical parameters (Temperature, Humidity, Pressure) are evaluated through a hierarchical threshold classifier into symbols a, b, c, or watchdog timeout d.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>3. How does state recovery occur?</strong>
              <p>When in FAULTY or DISCONNECTED states, receiving symbol 'a' returns the machine directly to NORMAL via δ(DISCONNECTED, a) = NORMAL.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transition History Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transition Audit Trail</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Device ID</th>
                <th>Previous State (q)</th>
                <th>Input Symbol (σ)</th>
                <th>Next State δ(q, σ)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{h.deviceId}</td>
                  <td><span className={`badge badge-${h.previousState.toLowerCase()}`}>{h.previousState}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{h.inputSymbol}</td>
                  <td><span className={`badge badge-${h.nextState.toLowerCase()}`}>{h.nextState}</span></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)' }}>
                    No transitions logged yet. Run simulation or execute testbench transitions above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AutomataTheory;
