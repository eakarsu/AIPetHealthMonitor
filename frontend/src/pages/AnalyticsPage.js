import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalyticsSummary, getPets } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getPets()])
      .then(([analyticsRes, petsRes]) => {
        setData(analyticsRes.data);
        setPets(petsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="ai-loading"><div className="spinner"></div><p>Loading analytics...</p></div></div>;
  if (!data) return <div className="empty-state"><p>Unable to load analytics data.</p></div>;

  const petMap = {};
  pets.forEach(p => { petMap[p.id] = p.name; });

  // Build weight chart data - combine all pets' weight data into chart format
  const weightData = [];
  Object.entries(data.weightTrends || {}).forEach(([petId, entries]) => {
    entries.forEach(e => {
      const existing = weightData.find(d => d.date === e.date);
      if (existing) {
        existing[petMap[petId] || `Pet ${petId}`] = e.weight;
      } else {
        weightData.push({ date: e.date, [petMap[petId] || `Pet ${petId}`]: e.weight });
      }
    });
  });
  weightData.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📈 Analytics & Insights</h1>
          <p>Track trends and statistics across all your pets</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🐾</div>
          <div className="stat-value">{data.pets}</div>
          <div className="stat-label">Total Pets</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${Number(data.totalExpenses || 0).toLocaleString()}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{data.upcomingAppointments}</div>
          <div className="stat-label">Upcoming Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-value">{data.activeMedications}</div>
          <div className="stat-label">Active Medications</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Monthly Expenses */}
        <div className="data-section">
          <div className="data-header"><h2>Monthly Expenses</h2></div>
          <div style={{ padding: 16 }}>
            {(data.monthlyExpenses || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Expenses']} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No expense data yet. Add expenses to see trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense by Category */}
        <div className="data-section">
          <div className="data-header"><h2>Expenses by Category</h2></div>
          <div style={{ padding: 16 }}>
            {(data.expenseByCategory || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.expenseByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                    {data.expenseByCategory.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No expense categories to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weight Trends */}
      <div className="data-section" style={{ marginBottom: 24 }}>
        <div className="data-header"><h2>Weight Trends</h2></div>
        <div style={{ padding: 16 }}>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {pets.map((pet, i) => (
                  <Line key={pet.id} type="monotone" dataKey={pet.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No weight data yet. Log weights to see trends.</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary per Pet */}
      <div className="data-section">
        <div className="data-header"><h2>Activity Summary</h2></div>
        <div style={{ padding: 16 }}>
          {Object.keys(data.activityStats || {}).length > 0 ? (
            <div className="stats-grid">
              {Object.entries(data.activityStats).map(([petId, stats]) => (
                <div className="stat-card" key={petId}>
                  <div className="stat-icon">🏃</div>
                  <div className="stat-value">{stats.count}</div>
                  <div className="stat-label">{petMap[petId] || 'Pet'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                    {stats.totalDuration} min · {stats.totalDistance.toFixed(1)} mi
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No activity data yet. Log activities to see summaries.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
