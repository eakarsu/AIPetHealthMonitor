import React, { useState, useEffect } from 'react';
import { getPets, aiSymptomCheck, aiDietRecommendation, aiBehaviorAnalysis,
  aiHealthReport, aiEmergencyAdvice, aiInsuranceAdvice } from '../services/api';
import Toast from '../components/Toast';

const aiApis = {
  'symptom-check': aiSymptomCheck,
  'diet-recommendation': aiDietRecommendation,
  'behavior-analysis': aiBehaviorAnalysis,
  'health-report': aiHealthReport,
  'emergency-advice': aiEmergencyAdvice,
  'insurance-advice': aiInsuranceAdvice,
};

const formConfigs = {
  'symptom-check': [
    { name: 'symptoms', label: 'Describe Symptoms', type: 'textarea', required: true, placeholder: 'e.g., Limping on right front paw, not eating well...' },
    { name: 'severity', label: 'Severity', type: 'select', options: ['mild', 'moderate', 'severe'] },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 3 days' },
  ],
  'diet-recommendation': [
    { name: 'currentDiet', label: 'Current Diet', type: 'textarea', placeholder: 'What does your pet currently eat?' },
    { name: 'concerns', label: 'Health Concerns', type: 'textarea', placeholder: 'e.g., Weight gain, allergies, picky eater...' },
    { name: 'allergies', label: 'Known Allergies', type: 'text', placeholder: 'e.g., Chicken, grains...' },
  ],
  'behavior-analysis': [
    { name: 'behavior', label: 'Describe Behavior', type: 'textarea', required: true, placeholder: 'e.g., Excessive barking when left alone...' },
    { name: 'context', label: 'Context / When It Happens', type: 'textarea', placeholder: 'e.g., Every time I leave the house...' },
    { name: 'frequency', label: 'Frequency', type: 'text', placeholder: 'e.g., Daily, 3 times per week...' },
  ],
  'health-report': [],
  'emergency-advice': [
    { name: 'situation', label: 'Emergency Situation', type: 'textarea', required: true, placeholder: 'Describe what happened...' },
    { name: 'severity', label: 'Severity', type: 'select', options: ['mild', 'moderate', 'severe', 'life-threatening'] },
  ],
  'insurance-advice': [
    { name: 'budget', label: 'Monthly Budget ($)', type: 'text', placeholder: 'e.g., $30-50' },
    { name: 'concerns', label: 'Main Concerns', type: 'textarea', placeholder: 'e.g., Breed-specific conditions, comprehensive coverage...' },
  ],
};

function formatAIContent(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h3 style="color:#4f46e5;margin:20px 0 8px;font-size:16px;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="color:#4f46e5;margin:24px 0 10px;font-size:18px;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="color:#4f46e5;margin:28px 0 12px;font-size:20px;">$1</h1>')
    .replace(/^\d+\.\s(.*$)/gm, '<div style="padding:8px 0 8px 16px;border-left:3px solid #e2e8f0;margin:6px 0;">$1</div>')
    .replace(/^[-•]\s(.*$)/gm, '<div style="padding:4px 0 4px 16px;position:relative;margin:3px 0;"><span style="position:absolute;left:0;color:#6366f1;">&#8226;</span>$1</div>')
    .replace(/⚠️/g, '<span style="color:#ef4444;font-weight:600;">⚠️</span>')
    .replace(/\n\n/g, '<div style="margin:12px 0;"></div>')
    .replace(/\n/g, '<br/>');
  return html;
}

function AIFeaturePage({ type, title, icon }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const formFields = formConfigs[type];
  const apiCall = aiApis[type];

  useEffect(() => {
    getPets().then(r => {
      setPets(r.data);
      if (r.data.length > 0) setSelectedPet(r.data[0]);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      setToast({ type: 'error', msg: 'Please select a pet first' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await apiCall({ ...formData, petId: selectedPet.id });
      setResult(res.data);
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
          <h1>{icon} {title}</h1>
          <p>AI-powered analysis using Claude Haiku 4.5 via OpenRouter</p>
        </div>
      </div>

      {/* Pet Selector */}
      <div className="pet-selector">
        {pets.map(pet => (
          <button key={pet.id} className={`pet-chip ${selectedPet?.id === pet.id ? 'active' : ''}`}
            onClick={() => setSelectedPet(pet)}>
            {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : pet.species === 'Bird' ? '🦜' : pet.species === 'Fish' ? '🐟' : pet.species === 'Rabbit' ? '🐰' : '🐾'} {pet.name}
          </button>
        ))}
      </div>

      {selectedPet && (
        <div style={{ display: 'grid', gridTemplateColumns: formFields.length > 0 ? '400px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
          {/* Input Form */}
          <div className="data-section" style={{ position: 'sticky', top: 32 }}>
            <div className="data-header">
              <h2>{icon} Input</h2>
            </div>
            <div style={{ padding: 24 }}>
              {/* Pet Info Summary */}
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                  {selectedPet.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
                  {selectedPet.species} &bull; {selectedPet.breed}<br />
                  Age: {selectedPet.age} years &bull; Weight: {selectedPet.weight} lbs
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {formFields.map(f => (
                  <div className="form-group" key={f.name}>
                    <label>{f.label} {f.required && '*'}</label>
                    {f.type === 'textarea' ? (
                      <textarea
                        value={formData[f.name] || ''}
                        onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        placeholder={f.placeholder}
                        required={f.required}
                        rows={3}
                      />
                    ) : f.type === 'select' ? (
                      <select value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}>
                        <option value="">Select...</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[f.name] || ''}
                        onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        placeholder={f.placeholder}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}

                <button type="submit" className="btn btn-info btn-full btn-lg" disabled={loading}>
                  {loading ? '🔄 Analyzing...' : `🤖 ${type === 'health-report' ? 'Generate Report' : 'Analyze with AI'}`}
                </button>
              </form>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {loading && (
              <div className="data-section">
                <div className="ai-loading" style={{ padding: 60 }}>
                  <div className="spinner"></div>
                  <p style={{ fontWeight: 600 }}>AI is analyzing...</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Using Claude Haiku 4.5 via OpenRouter</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="data-section">
                <div className="data-header">
                  <h2>🤖 AI Analysis Results</h2>
                  {result.model && (
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Model: {result.model}</span>
                  )}
                </div>

                {result.error ? (
                  <div style={{ padding: 24 }}>
                    <div className="error-msg">{result.error}</div>
                  </div>
                ) : (
                  <div style={{ padding: 24 }}>
                    <div className="ai-response">
                      <div className="ai-response-content" dangerouslySetInnerHTML={{ __html: formatAIContent(result.content) }} />
                      {result.usage && (
                        <div className="ai-response-meta">
                          <span>Tokens: {result.usage.total_tokens?.toLocaleString()}</span>
                          <span>Prompt: {result.usage.prompt_tokens?.toLocaleString()}</span>
                          <span>Response: {result.usage.completion_tokens?.toLocaleString()}</span>
                          {result.model && <span>Model: {result.model}</span>}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
                      ⚠️ <strong>Disclaimer:</strong> This AI analysis is for informational purposes only. Always consult with a licensed veterinarian for medical decisions regarding your pet's health.
                    </div>
                  </div>
                )}
              </div>
            )}

            {!result && !loading && (
              <div className="data-section">
                <div className="empty-state">
                  <div className="empty-icon">{icon}</div>
                  <p>{formFields.length > 0 ? 'Fill in the form and click analyze to get AI-powered insights' : 'Click the button to generate an AI report'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIFeaturePage;
