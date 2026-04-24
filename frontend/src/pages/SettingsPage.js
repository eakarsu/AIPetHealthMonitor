import React, { useState, useEffect } from 'react';
import { updateProfile, changePassword, getPets, exportData } from '../services/api';
import Toast from '../components/Toast';

function SettingsPage() {
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pets, setPets] = useState([]);
  const [exportPet, setExportPet] = useState('');
  const [exportResource, setExportResource] = useState('health-records');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser({ name: u.name || '', email: u.email || '' });
    }
    getPets().then(r => {
      setPets(r.data);
      if (r.data.length > 0) setExportPet(r.data[0].id);
    }).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(user);
      localStorage.setItem('user', JSON.stringify(res.data));
      setToast({ type: 'success', msg: 'Profile updated successfully' });
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Error updating profile' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ type: 'error', msg: 'Passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setToast({ type: 'error', msg: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setToast({ type: 'success', msg: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Error changing password' });
    }
  };

  const handleExport = async () => {
    if (!exportPet) return;
    setExporting(true);
    try {
      const res = await exportData(exportResource, exportPet);
      const { csv, filename } = res.data;
      if (!csv) {
        setToast({ type: 'error', msg: 'No data to export' });
        setExporting(false);
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ type: 'success', msg: `Exported ${filename}` });
    } catch (err) {
      setToast({ type: 'error', msg: 'Export failed' });
    }
    setExporting(false);
  };

  const exportResources = [
    { value: 'health-records', label: 'Health Records' },
    { value: 'vaccinations', label: 'Vaccinations' },
    { value: 'medications', label: 'Medications' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'weight', label: 'Weight Logs' },
    { value: 'activities', label: 'Activities' },
    { value: 'behaviors', label: 'Behaviors' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'symptoms', label: 'Symptoms' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'allergies', label: 'Allergies' },
    { value: 'training', label: 'Training' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'dental', label: 'Dental Care' },
    { value: 'parasite-prevention', label: 'Parasite Prevention' },
    { value: 'travel', label: 'Travel/Boarding' },
    { value: 'milestones', label: 'Milestones' },
    { value: 'feeding', label: 'Feeding' },
    { value: 'lab-results', label: 'Lab Results' },
    { value: 'socialization', label: 'Socialization' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'documents', label: 'Documents' },
    { value: 'insurance', label: 'Insurance' },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔒' },
    { id: 'export', label: 'Export Data', icon: '📥' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <h1>⚙️ Settings</h1>
          <p>Manage your profile, security, and data</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.id} className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="data-section">
          <div className="data-header"><h2>Profile Information</h2></div>
          <div style={{ padding: 24, maxWidth: 500 }}>
            <form onSubmit={handleProfileSave} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="data-section">
          <div className="data-header"><h2>Change Password</h2></div>
          <div style={{ padding: 24, maxWidth: 500 }}>
            <form onSubmit={handlePasswordChange} className="modal-form">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary">Change Password</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="data-section">
          <div className="data-header"><h2>Export Data</h2></div>
          <div style={{ padding: 24, maxWidth: 500 }}>
            <p style={{ marginBottom: 16, color: 'var(--gray-500)' }}>Export your pet's data as CSV files for backup or sharing with your vet.</p>
            <div className="modal-form">
              <div className="form-group">
                <label>Select Pet</label>
                <select value={exportPet} onChange={e => setExportPet(e.target.value)}>
                  {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Data Type</label>
                <select value={exportResource} onChange={e => setExportResource(e.target.value)}>
                  {exportResources.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleExport} disabled={exporting || !exportPet}>
                {exporting ? 'Exporting...' : '📥 Export CSV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="data-section">
          <div className="data-header"><h2>About PetHealth AI</h2></div>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
              <div className="detail-row">
                <div className="detail-label">App Name</div>
                <div className="detail-value">PetHealth AI</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Version</div>
                <div className="detail-value">2.0.0</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Features</div>
                <div className="detail-value">28 Data Features + 6 AI Features</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Platform</div>
                <div className="detail-value">React + Node.js + PostgreSQL</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">AI Provider</div>
                <div className="detail-value">Anthropic Claude via OpenRouter</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
