import React, { useEffect, useState } from 'react';
import api from '../services/api';

function colorFor(score) {
  // Heat scale: low (cool blue) -> high (red)
  const s = Math.max(0, Math.min(100, score));
  if (s === 0) return '#f1f5f9';
  if (s < 20) return '#e0e7ff';
  if (s < 40) return '#a5b4fc';
  if (s < 60) return '#facc15';
  if (s < 80) return '#fb923c';
  return '#ef4444';
}

function PetMetricHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/custom-views/pet-metric-heatmap')
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="spinner"></div><p>Loading heatmap...</p></div>;
  if (err) return <div className="error-msg">Error: {err}</div>;
  if (!data || !data.matrix?.length) {
    return <div className="empty-state"><p>Add pets and records to populate the heatmap.</p></div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, color: '#6b7280', fontSize: 12 }}>Pet \\ Metric</th>
            {data.metrics.map(m => (
              <th key={m} style={{ padding: 8, color: '#6b7280', fontSize: 12, textAlign: 'center' }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.matrix.map(row => (
            <tr key={row.petId}>
              <td style={{ padding: 8, fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap' }}>{row.pet}</td>
              {row.cells.map(cell => (
                <td
                  key={cell.metric}
                  title={`${cell.metric}: raw=${cell.raw}, score=${cell.score}/100`}
                  style={{
                    background: colorFor(cell.score),
                    color: cell.score > 50 ? '#fff' : '#1f2937',
                    padding: '14px 10px',
                    borderRadius: 6,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    minWidth: 80,
                  }}
                >
                  {cell.score}
                  <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.85 }}>{cell.raw}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, color: '#6b7280' }}>
        <span>Heat scale:</span>
        {[0, 20, 40, 60, 80, 100].map(s => (
          <span key={s} style={{ background: colorFor(s), color: s > 50 ? '#fff' : '#1f2937', padding: '2px 8px', borderRadius: 4 }}>{s}</span>
        ))}
        <span>(score normalized per metric)</span>
      </div>
    </div>
  );
}

export default PetMetricHeatmap;
