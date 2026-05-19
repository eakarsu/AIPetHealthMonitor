import React, { useState, useEffect } from 'react';
import { getPets, aiSymptomCheck, aiSymptomCheckPhoto, aiDietRecommendation, aiBehaviorAnalysis,
  aiHealthReport, aiEmergencyAdvice, aiInsuranceAdvice, aiFindSpecialists, aiVaccinationSchedule } from '../services/api';
import Toast from '../components/Toast';

const aiApis = {
  'symptom-check': aiSymptomCheck,
  'diet-recommendation': aiDietRecommendation,
  'behavior-analysis': aiBehaviorAnalysis,
  'health-report': aiHealthReport,
  'emergency-advice': aiEmergencyAdvice,
  'insurance-advice': aiInsuranceAdvice,
  'find-specialists': aiFindSpecialists,
  'vaccination-schedule': aiVaccinationSchedule,
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
  'find-specialists': [
    { name: 'condition', label: 'Condition or Concern', type: 'textarea', required: true, placeholder: 'e.g., Heart murmur, skin allergies, orthopedic issues...' },
    { name: 'location', label: 'Your Location', type: 'text', required: true, placeholder: 'e.g., Austin, TX' },
    { name: 'urgency', label: 'Urgency', type: 'select', options: ['routine', 'soon', 'urgent', 'emergency'] },
  ],
  'vaccination-schedule': [],
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

function renderSpecialistResult(parsed) {
  if (!parsed || parsed.raw) return null;
  return (
    <div>
      {parsed.specialist_types?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: '#4f46e5', marginBottom: 8 }}>Specialist Types Needed</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {parsed.specialist_types.map((s, i) => (
              <span key={i} style={{ background: '#ede9fe', color: '#5b21b6', padding: '4px 10px', borderRadius: 20, fontSize: 13 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {parsed.how_to_find?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: '#4f46e5', marginBottom: 8 }}>How to Find One</h3>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {parsed.how_to_find.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}
      {parsed.questions_to_ask?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: '#4f46e5', marginBottom: 8 }}>Questions to Ask</h3>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {parsed.questions_to_ask.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
      {parsed.red_flags_requiring_er?.length > 0 && (
        <div style={{ marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 14 }}>
          <h3 style={{ color: '#b91c1c', marginBottom: 8 }}>Red Flags - Go to ER Now</h3>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {parsed.red_flags_requiring_er.map((r, i) => <li key={i} style={{ color: '#991b1b' }}>{r}</li>)}
          </ul>
        </div>
      )}
      {parsed.estimated_cost_range && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8 }}>
          <strong>Estimated Cost Range: </strong>{parsed.estimated_cost_range}
        </div>
      )}
      {parsed.telehealth_options?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: '#4f46e5', marginBottom: 8 }}>Telehealth Options</h3>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {parsed.telehealth_options.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
      {parsed.emergency_resources && (
        <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
          <strong>Emergency Resources: </strong>{parsed.emergency_resources}
        </div>
      )}
    </div>
  );
}

function renderVaccinationScheduleResult(parsed) {
  if (!parsed || parsed.raw) return null;
  return (
    <div>
      {parsed.schedule_summary && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8 }}>
          <strong>Summary: </strong>{parsed.schedule_summary}
        </div>
      )}
      {parsed.overdue_vaccines?.length > 0 && (
        <div style={{ marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 14 }}>
          <h3 style={{ color: '#b91c1c', marginBottom: 8 }}>Overdue Vaccines</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {parsed.overdue_vaccines.map((v, i) => (
              <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 20, fontSize: 13 }}>{v}</span>
            ))}
          </div>
        </div>
      )}
      {parsed.recommended_vaccines?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: '#4f46e5', marginBottom: 10 }}>Recommended Vaccines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {parsed.recommended_vaccines.map((v, i) => (
              <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{v.name}</strong>
                  <span style={{ fontSize: 12, background: v.importance === 'core' ? '#dcfce7' : '#fef9c3', color: v.importance === 'core' ? '#166534' : '#854d0e', padding: '2px 8px', borderRadius: 12 }}>{v.type || v.importance}</span>
                </div>
                {v.next_due_date && <div style={{ fontSize: 13, color: '#6b7280' }}>Next due: {v.next_due_date} &bull; {v.frequency}</div>}
                {v.reason && <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>{v.reason}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {parsed.vet_visit_frequency && (
        <div style={{ padding: '10px 14px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8 }}>
          <strong>Recommended Vet Visit Frequency: </strong>{parsed.vet_visit_frequency}
        </div>
      )}
    </div>
  );
}

function AIFeaturePage({ type, title, icon }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState(null);

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
          <p>AI-powered analysis using Claude 3.5 Sonnet via OpenRouter</p>
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

              {/* Photo Upload for Symptom Check */}
              {type === 'symptom-check' && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>📷 Photo Symptom Check (Vision AI)</div>
                  <div className="form-group">
                    <label>Upload Pet Photo</label>
                    <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ fontSize: 13 }} />
                  </div>
                  {photoFile && (
                    <div style={{ marginBottom: 12 }}>
                      <img src={URL.createObjectURL(photoFile)} alt="Preview" style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
                    </div>
                  )}
                  <button className="btn btn-info btn-full" disabled={!photoFile || photoLoading}
                    onClick={async () => {
                      if (!selectedPet || !photoFile) return;
                      setPhotoLoading(true);
                      setPhotoResult(null);
                      const fd = new FormData();
                      fd.append('photo', photoFile);
                      fd.append('petId', selectedPet.id);
                      try {
                        const r = await aiSymptomCheckPhoto(fd);
                        setPhotoResult(r.data);
                      } catch (err) {
                        setToast({ type: 'error', msg: err.response?.data?.error || 'Photo analysis failed' });
                      }
                      setPhotoLoading(false);
                    }}>
                    {photoLoading ? '🔄 Analyzing Photo...' : '📷 Analyze Photo with Vision AI'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {loading && (
              <div className="data-section">
                <div className="ai-loading" style={{ padding: 60 }}>
                  <div className="spinner"></div>
                  <p style={{ fontWeight: 600 }}>AI is analyzing...</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Using Claude 3.5 Sonnet via OpenRouter</p>
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
                      {type === 'find-specialists' && result.parsed ? renderSpecialistResult(result.parsed) :
                       type === 'vaccination-schedule' && result.parsed ? renderVaccinationScheduleResult(result.parsed) :
                      <div className="ai-response-content" dangerouslySetInnerHTML={{ __html: formatAIContent(result.content) }} />}
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

            {/* Photo Analysis Result */}
            {photoResult && type === 'symptom-check' && (
              <div className="data-section" style={{ marginTop: 16 }}>
                <div className="data-header">
                  <h2>📷 Photo Analysis Results</h2>
                </div>
                <div style={{ padding: 24 }}>
                  {photoResult.parsed && !photoResult.parsed.raw ? (
                    <div>
                      {photoResult.parsed.urgency_score !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <span style={{ fontWeight: 700 }}>Urgency:</span>
                          <span className={`badge badge-${photoResult.parsed.urgency_score >= 7 ? 'severe' : photoResult.parsed.urgency_score >= 4 ? 'moderate' : 'low'}`}>
                            {photoResult.parsed.urgency_score}/10
                          </span>
                          <span>{photoResult.parsed.see_vet_urgency}</span>
                        </div>
                      )}
                      {photoResult.parsed.symptoms_observed?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <strong>Symptoms Observed:</strong>
                          <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                            {photoResult.parsed.symptoms_observed.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      {photoResult.parsed.possible_conditions?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <strong>Possible Conditions:</strong>
                          <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                            {photoResult.parsed.possible_conditions.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                      {photoResult.parsed.immediate_actions?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <strong>Immediate Actions:</strong>
                          <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                            {photoResult.parsed.immediate_actions.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="ai-response-content" dangerouslySetInnerHTML={{ __html: formatAIContent(photoResult.content) }} />
                  )}
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
