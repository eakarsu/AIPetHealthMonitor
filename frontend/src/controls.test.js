import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import AIFeaturePage from './pages/AIFeaturePage';
import AIReport from './components/AIReport';
import AIWorkspace from './components/AIWorkspace';
import BacklogToolsPage from './pages/BacklogToolsPage';
import FeaturePage from './pages/FeaturePage';
import { login, aiSymptomCheck, getPets } from './services/api';

jest.mock('./services/api', () => ({
  login: jest.fn(), register: jest.fn(), getPets: jest.fn(() => Promise.resolve({ data: [{ id: 17, name: 'Milo', species: 'Dog', breed: 'Beagle', age: 4, weight: 30 }] })),
  aiSymptomCheck: jest.fn(), aiSymptomCheckPhoto: jest.fn(),
  aiVetCostNegotiate: jest.fn(), aiAgenticWellness: jest.fn(), aiEmergencyTriage: jest.fn(), aiPhotoRegression: jest.fn(),
  healthReportsApi: { getAll: jest.fn() }, labResultsApi: { getAll: jest.fn() },
}));

let host, root;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; getPets.mockImplementation(() => Promise.resolve({ data: [{ id: 17, name: 'Milo', species: 'Dog', breed: 'Beagle', age: 4, weight: 30 }] })); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); jest.clearAllMocks(); });
const click = async (button) => act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));

test('demo button fills configured fields without submitting', async () => {
  process.env.REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL = 'true';
  process.env.REACT_APP_DEMO_EMAIL = 'fixture@example.test';
  process.env.REACT_APP_DEMO_PASSWORD = 'fixture-only';
  await act(async () => root.render(<Login onLogin={jest.fn()} />));
  await click([...host.querySelectorAll('button')].find(button => button.textContent.includes('Fill Demo')));
  expect(host.querySelector('input[type=email]').value).toBe('fixture@example.test');
  expect(host.querySelector('input[type=password]').value).toBe('fixture-only');
  expect(login).not.toHaveBeenCalled();
});

test('demo button explains missing configuration without submitting', async () => {
  process.env.REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL = 'false';
  await act(async () => root.render(<Login onLogin={jest.fn()} />));
  await click([...host.querySelectorAll('button')].find(button => button.textContent.includes('Fill Demo')));
  expect(host.textContent).toContain('Demo credentials are not configured');
  expect(login).not.toHaveBeenCalled();
});

test('native symptom presets fill required and optional inputs without generating', async () => {
  await act(async () => root.render(<AIFeaturePage type="symptom-check" title="Symptom Check" icon="🐕" />));
  const choices = [...host.querySelectorAll('button')].filter(button => button.textContent.includes('Fill all fields'));
  expect(choices).toHaveLength(3);
  await click(choices[0]);
  const fields = [...host.querySelectorAll('form textarea, form select, form input[type=text]')];
  expect(fields.map(field => field.value).every(Boolean)).toBe(true);
  expect(fields[0].value).toMatch(/Limping/);
  expect(aiSymptomCheck).not.toHaveBeenCalled();
});

test.each(['diet-recommendation', 'behavior-analysis', 'emergency-advice', 'insurance-advice', 'find-specialists'])(
  '%s presets fill every editable prompt field', async type => {
    await act(async () => root.render(<AIFeaturePage type={type} title={type} icon="🐕" />));
    const choices = [...host.querySelectorAll('button')].filter(button => button.textContent.includes('Fill all fields'));
    expect(choices).toHaveLength(3);
    await click(choices[1]);
    expect([...host.querySelectorAll('form textarea, form select, form input[type=text]')].map(field => field.value).every(Boolean)).toBe(true);
  }
);

test('backlog cost and photo presets fill inputs while keeping file selection explicit', async () => {
  await act(async () => root.render(<BacklogToolsPage />));
  await click([...host.querySelectorAll('button')].find(button => button.textContent === 'Follow-up case'));
  expect([...host.querySelectorAll('input')].map(input => input.value).every(Boolean)).toBe(true);
  await click([...host.querySelectorAll('button')].find(button => button.textContent === 'Photo Regression'));
  await click([...host.querySelectorAll('button')].find(button => button.textContent === 'Detailed review'));
  expect(host.querySelector('input[placeholder="Body part"]').value).toBe('lower abdomen');
  expect(host.querySelector('input[type=file]').files).toHaveLength(0);
  expect(host.textContent).toContain('Choose a real photo');
});

test('structured returned report preserves false, zero, blank field and table', async () => {
  await act(async () => root.render(<AIReport title="Fixture" response={{ parsed: { safe: false, score: 0, note: '', findings: [{ name: 'A', count: 0 }, { name: 'B', count: 2 }] } }} />));
  expect(host.textContent).toContain('No');
  expect(host.textContent).toContain('0');
  expect(host.textContent).toContain('Note');
  expect(host.textContent).toContain('Empty string');
  expect(host.querySelector('table')).not.toBeNull();
  expect(host.querySelector('pre')).toBeNull();
});

test('saved report detail renders structured fixture', async () => {
  const item = { id: 9, model: 'fixture', created_at: '2026-01-01T00:00:00Z', input: { goal: 'Review case' }, result_json: { safe: false, score: 0, note: '', actions: ['Follow up'] } };
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [item] }) }));
  const feature = { id: 'fixture', title: 'Fixture report', description: 'Fixture' };
  await act(async () => root.render(<AIWorkspace feature={feature} token="fixture-token" />));
  await click([...host.querySelectorAll('button')].find(button => button.textContent.includes('Open report')));
  const dialog = document.querySelector('[role=dialog]');
  expect(dialog.textContent).toContain('Follow up');
  expect(dialog.textContent).toContain('No');
  expect(dialog.textContent).toContain('Score');
  expect(dialog.querySelector('pre')).toBeNull();
});

test('workspace presets fill all required and optional inputs without requesting generation', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) }));
  const feature = { id: 'fixture', title: 'Fixture report', description: 'Fixture' };
  await act(async () => root.render(<AIWorkspace feature={feature} token="fixture-token" />));
  await click([...host.querySelectorAll('button')].find(button => button.textContent === 'Data sample'));
  expect([...host.querySelectorAll('.ai-form-grid input, .ai-form-grid select, .ai-form-grid textarea')].map(field => field.value).every(Boolean)).toBe(true);
  expect(global.fetch.mock.calls.some(([url, options]) => String(url).endsWith('/run') || options?.method === 'POST')).toBe(false);
});

test.each([
  ['health-reports', 'details', 'Health report details'],
  ['lab-results', 'aiInterpretation', 'AI interpretation'],
])('saved %s detail renders structured JSON', async (feature, field, heading) => {
  const api = require('./services/api')[feature === 'health-reports' ? 'healthReportsApi' : 'labResultsApi'];
  api.getAll.mockResolvedValue({ data: [{ id: 3, reportType: 'Routine', testName: 'Panel', generatedDate: '2026-01-01', date: '2026-01-01', [field]: JSON.stringify({ reviewed: false, score: 0, note: '' }) }] });
  await act(async () => root.render(<FeaturePage feature={feature} title="Fixture records" icon="🐕" />));
  await click(host.querySelector('.data-table tbody tr'));
  expect(host.textContent).toContain(heading);
  expect(host.textContent).toContain('No');
  expect(host.textContent).toContain('Empty string');
  expect(host.querySelector('.detail-panel pre')).toBeNull();
});
