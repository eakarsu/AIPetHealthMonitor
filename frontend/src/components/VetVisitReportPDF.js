import React, { useEffect, useState } from 'react';
import api from '../services/api';

function VetVisitReportPDF() {
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/pets').then(r => {
      setPets(r.data || []);
      if (r.data?.[0]) setPetId(String(r.data[0].id));
    }).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true); setErr('');
    try {
      const r = await api.get('/custom-views/vet-visit-report', { params: petId ? { petId } : {} });
      setReport(r.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  const print = () => {
    if (!report?.html) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(report.html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const download = () => {
    if (!report?.html) return;
    const blob = new Blob([report.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = report.filename || 'vet-visit.html';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Pet:</label>
        <select value={petId} onChange={e => setPetId(e.target.value)} className="form-control" style={{ width: 200 }}>
          <option value="">— Most recent —</option>
          {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={generate} className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {report && <>
          <button onClick={print} className="btn">🖨️ Print / Save as PDF</button>
          <button onClick={download} className="btn">⬇️ Download HTML</button>
        </>}
      </div>
      {err && <div className="error-msg">Error: {err}</div>}
      {report && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fff' }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
            Preview · file: <code>{report.filename}</code>
          </div>
          <iframe
            title="Vet visit report"
            srcDoc={report.html}
            style={{ width: '100%', height: 520, border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
        </div>
      )}
      {!report && !loading && !err && (
        <div className="empty-state"><p>Select a pet (or use most recent) and click <strong>Generate Report</strong>.</p></div>
      )}
    </div>
  );
}

export default VetVisitReportPDF;
