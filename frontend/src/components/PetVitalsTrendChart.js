import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

function PetVitalsTrendChart() {
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState('weight');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/custom-views/vitals-trend')
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="spinner"></div><p>Loading vitals trend...</p></div>;
  if (err) return <div className="error-msg">Error: {err}</div>;
  if (!data || !data.series?.length) {
    return <div className="empty-state"><p>No vitals data yet. Log weight, activities, or sleep for your pets.</p></div>;
  }

  // Flatten series to: [{ date, [petName]: value }]
  const chartData = data.series.map(s => {
    const row = { date: s.date };
    Object.entries(s.points || {}).forEach(([petName, vals]) => {
      if (vals[metric] != null) row[petName] = Number(vals[metric].toFixed ? vals[metric].toFixed(2) : vals[metric]);
    });
    return row;
  });

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Metric:</label>
        <select value={metric} onChange={e => setMetric(e.target.value)} className="form-control" style={{ width: 200 }}>
          <option value="weight">Weight (lbs)</option>
          <option value="activityMinutes">Activity (minutes)</option>
          <option value="sleepHours">Sleep (hours)</option>
        </select>
        <span style={{ color: '#6b7280', fontSize: 13 }}>
          {data.summary.weightRecords} weight • {data.summary.activityRecords} activity • {data.summary.sleepRecords} sleep records
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {(data.pets || []).map((pet, i) => (
            <Line key={pet} type="monotone" dataKey={pet} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PetVitalsTrendChart;
