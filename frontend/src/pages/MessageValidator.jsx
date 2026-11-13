/**
 * Message Validator Sandbox Page
 * Interactive testing terminal for formal Regular Expression syntax validation.
 */

import React, { useState, useEffect } from 'react';
import { testMessageValidation, getValidatorSamples } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { CheckCircle2, XCircle, Code, Play, ArrowRight, Info } from 'lucide-react';

export const MessageValidator = () => {
  const { showToast } = useSystem();
  const [inputMessage, setInputMessage] = useState(
    'IOT-001|TEMP=25.4|HUM=48.2|PRESS=1013.2|TS=2026-11-13T10:30:00Z'
  );
  const [result, setResult] = useState(null);
  const [samples, setSamples] = useState({ validSamples: [], invalidSamples: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getValidatorSamples()
      .then((res) => {
        if (res.success) setSamples(res.data);
      })
      .catch(() => {});
  }, []);

  const handleValidate = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    try {
      const res = await testMessageValidation(inputMessage);
      if (res.success) {
        setResult(res.data);
        if (res.data.isValid) {
          showToast('Message ACCEPTED by formal grammar', 'success');
        } else {
          showToast('Message REJECTED by formal grammar', 'warning');
        }
      }
    } catch (err) {
      showToast(err.error || 'Validation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Regular Expression Message Validator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Syntactic verification of IoT protocol wire frames using Chomsky Level-3 Regular Grammars
        </p>
      </div>

      {/* Interactive Input Terminal */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Code size={18} style={{ color: 'var(--accent-cyan)' }} />
            Sensor Wire Frame Input Terminal
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full-string match</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', padding: '0.75rem' }}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="e.g. IOT-001|TEMP=25.4|HUM=48.2|PRESS=1013.2|TS=2026-11-13T10:30:00Z"
          />
          <button
            onClick={handleValidate}
            className="btn btn-primary"
            style={{ minWidth: '140px', padding: '0.75rem 1rem' }}
            disabled={loading}
          >
            <Play size={16} />
            <span>Validate</span>
          </button>
        </div>

        {/* Validation Result Box */}
        {result && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              borderRadius: '8px',
              backgroundColor: result.isValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${result.isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {result.isValid ? (
                  <CheckCircle2 size={24} style={{ color: 'var(--state-normal)' }} />
                ) : (
                  <XCircle size={24} style={{ color: 'var(--state-faulty)' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: result.isValid ? 'var(--state-normal)' : 'var(--state-faulty)' }}>
                    STATUS: {result.status}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {result.isValid
                      ? 'The frame fully complies with the defined IoT protocol regular grammar.'
                      : result.errorReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Parsed Tokens on Acceptance */}
            {result.isValid && result.parsedData && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  EXTRACTED PROTOCOL TOKENS:
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>DEVICE_ID</span>
                    <strong>{result.parsedData.deviceId}</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>TEMP</span>
                    <strong>{result.parsedData.temperature}°C</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>HUM</span>
                    <strong>{result.parsedData.humidity}%</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>PRESS</span>
                    <strong>{result.parsedData.pressure} hPa</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>TIMESTAMP</span>
                    <strong>{result.parsedData.timestampString}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Test Scenarios */}
      <div className="grid-cols-2">
        {/* Valid Presets */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--state-normal)' }}>
              <CheckCircle2 size={16} /> Valid Sample Frames
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {samples.validSamples.map((s, idx) => (
              <div
                key={idx}
                style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                onClick={() => setInputMessage(s.message)}
                title="Click to load into terminal"
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{s.description}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--accent-cyan)', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                  {s.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invalid Presets */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--state-faulty)' }}>
              <XCircle size={16} /> Rejection Sample Frames
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {samples.invalidSamples.map((s, idx) => (
              <div
                key={idx}
                style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                onClick={() => setInputMessage(s.message)}
                title="Click to load into terminal"
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--state-faulty)' }}>{s.description}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                  {s.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  Rejection Cause: {s.expectedError}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageValidator;
