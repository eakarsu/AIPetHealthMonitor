import React, { useState, useEffect } from 'react';
import { getPets, createPet, updatePet, deletePet } from '../services/api';
import Toast from '../components/Toast';

const emptyPet = { name: '', species: 'Dog', breed: '', age: '', weight: '', gender: 'Male', color: '', microchipId: '', notes: '' };

function PetsPage() {
  const [pets, setPets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyPet);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => getPets().then(r => setPets(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updatePet(editId, formData);
        setToast({ type: 'success', msg: 'Pet updated successfully' });
      } else {
        await createPet(formData);
        setToast({ type: 'success', msg: 'Pet created successfully' });
      }
      setShowForm(false);
      setEditId(null);
      setFormData(emptyPet);
      setSelected(null);
      load();
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Error saving pet' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pet? All associated records will remain.')) return;
    try {
      await deletePet(id);
      setToast({ type: 'success', msg: 'Pet deleted' });
      setSelected(null);
      load();
    } catch (err) {
      setToast({ type: 'error', msg: 'Error deleting pet' });
    }
  };

  const openEdit = (pet) => {
    setFormData({ name: pet.name, species: pet.species, breed: pet.breed || '', age: pet.age || '', weight: pet.weight || '', gender: pet.gender || '', color: pet.color || '', microchipId: pet.microchipId || '', notes: pet.notes || '' });
    setEditId(pet.id);
    setShowForm(true);
    setSelected(null);
  };

  const openNew = () => {
    setFormData(emptyPet);
    setEditId(null);
    setShowForm(true);
  };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <h1>🐾 My Pets</h1>
          <p>Manage your pet profiles</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add New Pet</button>
      </div>

      <div className="data-section">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Species</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Weight</th>
              <th>Gender</th>
              <th>Microchip</th>
            </tr>
          </thead>
          <tbody>
            {pets.map(pet => (
              <tr key={pet.id} onClick={() => setSelected(pet)}>
                <td><strong>{pet.name}</strong></td>
                <td>{pet.species}</td>
                <td>{pet.breed}</td>
                <td>{pet.age} yrs</td>
                <td>{pet.weight} lbs</td>
                <td>{pet.gender}</td>
                <td>{pet.microchipId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🐾</div>
            <p>No pets yet. Add your first pet!</p>
            <button className="btn btn-primary" onClick={openNew}>+ Add Pet</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{selected.name}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-body">
              {Object.entries({ Species: selected.species, Breed: selected.breed, Age: `${selected.age} years`, Weight: `${selected.weight} lbs`, Gender: selected.gender, Color: selected.color, 'Microchip ID': selected.microchipId, Notes: selected.notes }).map(([k, v]) => (
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
        <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{editId ? 'Edit Pet' : 'Add New Pet'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="detail-body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Species *</label>
                    <select value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})}>
                      <option>Dog</option><option>Cat</option><option>Bird</option><option>Fish</option><option>Rabbit</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Breed</label>
                    <input value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option>Male</option><option>Female</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Age (years)</label>
                    <input type="number" step="0.5" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Weight (lbs)</label>
                    <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Microchip ID</label>
                    <input value={formData.microchipId} onChange={e => setFormData({...formData, microchipId: e.target.value})} />
                  </div>
                </div>
                <div className="form-row full">
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
                <div className="detail-actions" style={{ padding: 0, borderTop: 'none', marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update Pet' : 'Add Pet'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetsPage;
