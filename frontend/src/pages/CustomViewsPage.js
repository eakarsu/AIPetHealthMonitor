import React, { useState } from 'react';
import PetVitalsTrendChart from '../components/PetVitalsTrendChart';
import PetMetricHeatmap from '../components/PetMetricHeatmap';
import VetVisitReportPDF from '../components/VetVisitReportPDF';
import CareReminderRulesEditor from '../components/CareReminderRulesEditor';

const tabs = [
  { key: 'vitals', label: '📈 Vitals Trend', component: PetVitalsTrendChart, desc: 'Weight, activity, and sleep over time for every pet.' },
  { key: 'heatmap', label: '🔥 Pet × Metric Heatmap', component: PetMetricHeatmap, desc: 'Compare pets across health & activity dimensions at a glance.' },
  { key: 'vet-pdf', label: '📄 Vet Visit Report', component: VetVisitReportPDF, desc: 'Generate a printable PDF report for the next vet visit.' },
  { key: 'rules', label: '🔔 Care Reminder Rules', component: CareReminderRulesEditor, desc: 'Edit vaccination and medication reminder rules in one place.' },
];

function CustomViewsPage() {
  const [active, setActive] = useState('vitals');
  const Tab = tabs.find(t => t.key === active) || tabs[0];
  const ActiveComponent = Tab.component;

  return (
    <div data-testid="custom-views-page">
      <div className="page-header">
        <div>
          <h1>🐾 Pet Views</h1>
          <p>Custom dashboards, exports, and rule editors for your pets.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn ${active === t.key ? 'btn-primary' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="data-section" style={{ padding: 16 }}>
        <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 14 }}>{Tab.desc}</div>
        <ActiveComponent />
      </div>
    </div>
  );
}

export default CustomViewsPage;
