import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getPets } from '../services/api';
import Toast from '../components/Toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function aiClient(path, body) {
  const token = localStorage.getItem('token');
  return axios.post(`${API_BASE}${path}`, body, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
}

const TYPES = [
  { id: 'genetic', title: 'Genetic Disease Risk', icon: '🧬', endpoint: '/ai/genetic-disease-risk' },
  { id: 'trends', title: 'Health Trend Detect', icon: '📈', endpoint: '/ai/health-trend-detect' },
];

function formatAIContent(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h3 style="color:#4f46e5;margin:20px 0 8px;font-size:16px;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="color:#4f46e5;margin:24px 0 10px;font-size:18px;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="color:#4f46e5;margin:28px 0 12px;font-size:20px;">$1</h1>')
    .replace(/^[-•]\s(.*$)/gm, '<div style="padding:4px 0 4px 16px;position:relative;margin:3px 0;"><span style="position:absolute;left:0;color:#6366f1;">&bull;</span>$1</div>')
    .replace(/\n\n/g, '<div style="margin:12px 0;"></div>')
    .replace(/\n/g, '<br/>');
}

function AIPredictivePage({ type }) {
  const cfg = TYPES.find(t => t.id === type) || TYPES[0];
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getPets().then(r => {
      setPets(r.data);
      if (r.data.length > 0) setSelectedPet(r.data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setResult(null);
  }, [type, selectedPet]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      setToast({ type: 'error', msg: 'Please select a pet first' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await aiClient(cfg.endpoint, { petId: selectedPet.id });
      setResult(r.data);
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'AI service error' });
    }
    setLoading(false);
  };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <h1>{cfg.icon} {cfg.title}</h1>
          <p>AI-powered predictive analysis using Claude via OpenRouter</p>
        </div>
      </div>

      <div className="pet-selector">
        {pets.map(pet => (
          <button key={pet.id} className={`pet-chip ${selectedPet?.id === pet.id ? 'active' : ''}`}
            onClick={() => setSelectedPet(pet)}>
            {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : '🐾'} {pet.name}
          </button>
        ))}
      </div>

      {selectedPet && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
          <div className="data-section" style={{ position: 'sticky', top: 32 }}>
            <div className="data-header">
              <h2>{cfg.icon} Input</h2>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{selectedPet.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
                  {selectedPet.species} &bull; {selectedPet.breed}<br />
                  Age: {selectedPet.age} years &bull; Weight: {selectedPet.weight} lbs
                </div>
              </div>
              <form onSubmit={handleAnalyze}>
                <button type="submit" className="btn btn-info btn-full btn-lg" disabled={loading}>
                  {loading ? '🔄 Analyzing...' : `🤖 Run ${cfg.title}`}
                </button>
              </form>
            </div>
          </div>

          <div>
            {loading && (
              <div className="data-section">
                <div className="ai-loading" style={{ padding: 60 }}>
                  <div className="spinner"></div>
                  <p style={{ fontWeight: 600 }}>AI is analyzing...</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="data-section">
                <div className="data-header">
                  <h2>🤖 AI Results</h2>
                </div>
                <div style={{ padding: 24 }}>
                  {result.error ? (
                    <div className="error-msg">{result.error}</div>
                  ) : (
                    <div className="ai-response">
                      <div className="ai-response-content" dangerouslySetInnerHTML={{ __html: formatAIContent(result.content || JSON.stringify(result.parsed || result, null, 2)) }} />
                      {result.usage && (
                        <div className="ai-response-meta">
                          <span>Tokens: {result.usage.total_tokens?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
                    ⚠️ <strong>Disclaimer:</strong> Informational only. Consult a licensed veterinarian.
                  </div>
                </div>
              </div>
            )}

            {!result && !loading && (
              <div className="data-section">
                <div className="empty-state">
                  <div className="empty-icon">{cfg.icon}</div>
                  <p>Click the button to run AI analysis on this pet's data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIPredictivePage;
