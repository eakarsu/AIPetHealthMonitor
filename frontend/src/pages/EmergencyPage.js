import React, { useState, useEffect } from 'react';
import { getEmergencyContacts, createEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../services/api';
import Toast from '../components/Toast';

const emptyContact = { name: '', type: 'Primary Vet', phone: '', address: '', hours: '', isEmergency24h: false, distance: '', rating: '', notes: '' };

function EmergencyPage() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyContact);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => getEmergencyContacts().then(r => setContacts(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateEmergencyContact(editId, formData);
        setToast({ type: 'success', msg: 'Contact updated' });
      } else {
        await createEmergencyContact(formData);
        setToast({ type: 'success', msg: 'Contact added' });
      }
      setShowForm(false);
      setEditId(null);
      setFormData(emptyContact);
      setSelected(null);
      load();
    } catch (err) {
      setToast({ type: 'error', msg: 'Error saving contact' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await deleteEmergencyContact(id);
      setToast({ type: 'success', msg: 'Contact deleted' });
      setSelected(null);
      load();
    } catch (err) {
      setToast({ type: 'error', msg: 'Error deleting' });
    }
  };

  const openEdit = (contact) => {
    setFormData({ name: contact.name, type: contact.type || '', phone: contact.phone || '', address: contact.address || '', hours: contact.hours || '', isEmergency24h: contact.isEmergency24h || false, distance: contact.distance || '', rating: contact.rating || '', notes: contact.notes || '' });
    setEditId(contact.id);
    setShowForm(true);
    setSelected(null);
  };

  const openNew = () => { setFormData(emptyContact); setEditId(null); setShowForm(true); };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <h1>📞 Emergency Contacts</h1>
          <p>Vets, emergency hospitals, and important numbers</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Contact</button>
      </div>

      <div className="data-section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Hours</th>
              <th>24h Emergency</th>
              <th>Distance</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)}>
                <td><strong>{c.name}</strong></td>
                <td><span className="badge badge-low">{c.type}</span></td>
                <td>{c.phone}</td>
                <td>{c.hours}</td>
                <td>{c.isEmergency24h ? '✅ Yes' : '❌ No'}</td>
                <td>{c.distance ? `${c.distance} mi` : '-'}</td>
                <td>{c.rating ? `⭐ ${c.rating}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📞</div>
            <p>No emergency contacts yet.</p>
            <button className="btn btn-primary" onClick={openNew}>+ Add Contact</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="detail-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{selected.name}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-body">
              {[['Type', selected.type], ['Phone', selected.phone], ['Address', selected.address], ['Hours', selected.hours], ['24h Emergency', selected.isEmergency24h ? 'Yes' : 'No'], ['Distance', selected.distance ? `${selected.distance} miles` : '-'], ['Rating', selected.rating ? `${selected.rating}/5.0` : '-'], ['Notes', selected.notes]].map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <div className="detail-label">{k}</div>
                  <div className="detail-value">{v || '-'}</div>
                </div>
              ))}
            </div>
            <div className="detail-actions">
              <button className="btn btn-primary btn-sm" onClick={() => openEdit(selected)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="detail-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{editId ? 'Edit' : 'Add'} Emergency Contact</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="detail-body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Primary Vet</option><option>Specialist</option><option>Emergency</option><option>Exotic Specialist</option>
                    <option>Aquatic Vet</option><option>Poison Control</option><option>Transport</option><option>Pet Sitter</option>
                    <option>Boarding</option><option>Mobile Vet</option><option>Retail Vet</option><option>Rehabilitation</option>
                    <option>Insurance</option><option>Emergency Contact</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Hours</label>
                  <input value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={formData.isEmergency24h} onChange={e => setFormData({...formData, isEmergency24h: e.target.checked})} style={{ width: 'auto' }} />
                    24-Hour Emergency Service
                  </label>
                </div>
                <div className="form-group">
                  <label>Distance (miles)</label>
                  <input type="number" step="0.1" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="detail-actions" style={{ padding: 0, borderTop: 'none', marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'} Contact</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyPage;
