import React, { useEffect, useState } from 'react';
import api from '../services/api';

const blank = { kind: 'vaccination', petId: '', name: '', nextDate: '', notes: '', details: {} };

function CareReminderRulesEditor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null); // { kind, id }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const r = await api.get('/custom-views/care-reminders');
      setData(r.data);
      if (r.data?.pets?.[0] && !form.petId) {
        setForm(f => ({ ...f, petId: String(r.data.pets[0].id) }));
      }
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const reset = () => { setForm({ ...blank, petId: data?.pets?.[0]?.id ? String(data.pets[0].id) : '' }); setEditing(null); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      if (editing) {
        await api.put(`/custom-views/care-reminders/${editing.kind}/${editing.id}`, form);
      } else {
        await api.post('/custom-views/care-reminders', form);
      }
      reset();
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    setSaving(false);
  };

  const startEdit = (rule) => {
    setEditing({ kind: rule.kind, id: rule.id });
    setForm({
      kind: rule.kind,
      petId: String(rule.petId),
      name: rule.name || '',
      nextDate: rule.nextDate || '',
      notes: rule.notes || '',
      details: rule.details || {},
    });
  };

  const remove = async (rule) => {
    if (!window.confirm(`Delete "${rule.name}"?`)) return;
    try {
      await api.delete(`/custom-views/care-reminders/${rule.kind}/${rule.id}`);
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  if (loading) return <div className="empty-state"><div className="spinner"></div><p>Loading reminder rules...</p></div>;

  return (
    <div>
      {err && <div className="error-msg" style={{ marginBottom: 12 }}>Error: {err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 16 }}>
        <form onSubmit={save} className="data-section" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{editing ? `Edit ${editing.kind}` : 'New care reminder'}</h3>
          <div className="form-group">
            <label>Type</label>
            <select value={form.kind} disabled={!!editing} onChange={e => setForm({ ...form, kind: e.target.value })} className="form-control">
              <option value="vaccination">💉 Vaccination</option>
              <option value="medication">💊 Medication</option>
            </select>
          </div>
          <div className="form-group">
            <label>Pet</label>
            <select value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })} className="form-control" required>
              <option value="">— Select —</option>
              {(data?.pets || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={form.kind === 'vaccination' ? 'Rabies booster' : 'Heartworm preventative'} required />
          </div>
          <div className="form-group">
            <label>Next due / refill date</label>
            <input type="date" className="form-control" value={form.nextDate || ''} onChange={e => setForm({ ...form, nextDate: e.target.value })} />
          </div>
          {form.kind === 'vaccination' ? (
            <>
              <div className="form-group">
                <label>Vet</label>
                <input className="form-control" value={form.details.vetName || ''} onChange={e => setForm({ ...form, details: { ...form.details, vetName: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input className="form-control" value={form.details.manufacturer || ''} onChange={e => setForm({ ...form, details: { ...form.details, manufacturer: e.target.value } })} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Dosage</label>
                <input className="form-control" value={form.details.dosage || ''} onChange={e => setForm({ ...form, details: { ...form.details, dosage: e.target.value } })} placeholder="10mg" />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <input className="form-control" value={form.details.frequency || ''} onChange={e => setForm({ ...form, details: { ...form.details, frequency: e.target.value } })} placeholder="Twice daily" />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update Rule' : 'Add Rule')}</button>
            {editing && <button type="button" className="btn" onClick={reset}>Cancel</button>}
          </div>
        </form>

        <div className="data-section">
          <div className="data-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Care reminder rules</h3>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{data?.total || 0} total • {data?.overdueCount || 0} overdue</span>
          </div>
          <div style={{ padding: 8, maxHeight: 520, overflowY: 'auto' }}>
            {(data?.rules || []).length === 0 ? (
              <div className="empty-state"><p>No reminder rules yet.</p></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: 8, fontSize: 12, color: '#6b7280' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: 8, fontSize: 12, color: '#6b7280' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8, fontSize: 12, color: '#6b7280' }}>Pet</th>
                    <th style={{ textAlign: 'left', padding: 8, fontSize: 12, color: '#6b7280' }}>Next</th>
                    <th style={{ textAlign: 'right', padding: 8, fontSize: 12, color: '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rules.map(rule => (
                    <tr key={`${rule.kind}-${rule.id}`} style={{ borderBottom: '1px solid #f1f5f9', background: rule.overdue ? '#fef2f2' : 'transparent' }}>
                      <td style={{ padding: 8 }}>{rule.kind === 'vaccination' ? '💉' : '💊'} <span style={{ fontSize: 12, color: '#6b7280' }}>{rule.kind}</span></td>
                      <td style={{ padding: 8, fontWeight: 500 }}>{rule.name}</td>
                      <td style={{ padding: 8 }}>{rule.petName}</td>
                      <td style={{ padding: 8, color: rule.overdue ? '#b91c1c' : '#1f2937', fontWeight: rule.overdue ? 600 : 400 }}>{rule.nextDate || '—'}{rule.overdue && ' ⚠️'}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>
                        <button className="btn" style={{ marginRight: 4, padding: '4px 10px' }} onClick={() => startEdit(rule)}>Edit</button>
                        <button className="btn" style={{ padding: '4px 10px', background: '#fee2e2', color: '#b91c1c' }} onClick={() => remove(rule)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareReminderRulesEditor;
