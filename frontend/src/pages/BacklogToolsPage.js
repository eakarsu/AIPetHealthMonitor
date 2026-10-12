import React, { useState, useEffect } from 'react';
import AIReport from '../components/AIReport';
import {
  aiVetCostNegotiate, aiAgenticWellness, aiEmergencyTriage, aiPhotoRegression,
  aiVetClinicStatus, aiPharmacyStatus, aiWearableStatus,
  communityListTopics, communityCreateTopic, communityListPosts, communityCreatePost,
  getPets,
} from '../services/api';

const TABS = [
  ['cost', 'Cost Negotiation'],
  ['wellness', 'Agentic Wellness'],
  ['triage', 'Emergency Triage'],
  ['photo', 'Photo Regression'],
  ['integrations', 'Integrations'],
  ['community', 'Community'],
];

function Pre({ data }) {
  if (data === null || data === undefined) return null;
  return <AIReport response={data} title="Analysis details" />;
}

function Presets({ apply, disabled, needsPhoto = false }) {
  return <div className="ai-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
    {['Routine review', 'Follow-up case', 'Detailed review'].map((label, index) =>
      <button key={label} type="button" style={btnSecondary} disabled={disabled} onClick={() => apply(index)}>{label}</button>)}
    {needsPhoto && <small>Choose a real photo before analysis; presets keep any selected file and pet.</small>}
  </div>;
}

function Err({ msg, payload }) {
  if (!msg && !payload) return null;
  return (
    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 10, borderRadius: 6, marginTop: 8 }}>
      {msg}
      {payload && <Pre data={payload} />}
    </div>
  );
}

const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 16 };
const btn = { padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
const btnSecondary = { ...btn, background: '#6b7280' };

function CostNegotiate() {
  const [procedure, setProcedure] = useState('Dental cleaning with extractions');
  const [price, setPrice] = useState('850');
  const [symptoms, setSymptoms] = useState('Bad breath, mild gum redness');
  const [region, setRegion] = useState('San Francisco, CA');
  const [out, setOut] = useState(null); const [err, setErr] = useState(null); const [errPayload, setErrPayload] = useState(null); const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true); setErr(null); setOut(null); setErrPayload(null);
    try { const r = await aiVetCostNegotiate({ procedure, quoted_price: Number(price), symptoms, region }); setOut(r.data); }
    catch (e) { setErr(e.response?.data?.error || e.message); setErrPayload(e.response?.data); }
    setLoading(false);
  };
  return (
    <div style={card}>
      <h3>Vet Cost Negotiation</h3>
      <Presets disabled={loading} apply={index => {
        const samples = [
          ['Dental cleaning with possible extractions', '850', 'Bad breath and mild gum redness', 'San Francisco, CA'],
          ['Routine spay estimate', '620', 'Healthy young dog; preoperative blood work requested', 'Austin, TX'],
          ['Senior cat ultrasound', '1100', 'Reduced appetite and intermittent vomiting', 'Denver, CO'],
        ];
        [setProcedure, setPrice, setSymptoms, setRegion].forEach((set, field) => set(samples[index][field]));
      }} />
      <input style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="Procedure" value={procedure} onChange={(e) => setProcedure(e.target.value)} />
      <input style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="Quoted price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="Symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
      <input style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
      <button style={btn} onClick={run} disabled={loading}>{loading ? 'Generating...' : 'Get Negotiation Script'}</button>
      <Err msg={err} payload={errPayload} />
      <Pre data={out} />
    </div>
  );
}

function AgenticWellness() {
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [days, setDays] = useState('14');
  const [out, setOut] = useState(null); const [err, setErr] = useState(null); const [errPayload, setErrPayload] = useState(null); const [loading, setLoading] = useState(false);
  useEffect(() => { getPets().then(r => { setPets(r.data || []); if ((r.data || []).length) setPetId(r.data[0].id); }).catch(() => {}); }, []);
  const run = async () => {
    setLoading(true); setErr(null); setOut(null); setErrPayload(null);
    try { const r = await aiAgenticWellness({ petId: Number(petId), days: Number(days) }); setOut(r.data); }
    catch (e) { setErr(e.response?.data?.error || e.message); setErrPayload(e.response?.data); }
    setLoading(false);
  };
  return (
    <div style={card}>
      <h3>Agentic Wellness Monitor</h3>
      <Presets disabled={loading} apply={index => setDays(['7', '14', '30'][index])} />
      {!petId && <p>Select an existing pet before analysis.</p>}
      <select style={{ width: '100%', padding: 8, marginBottom: 8 }} value={petId} onChange={(e) => setPetId(e.target.value)}>
        <option value="">Select pet…</option>
        {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="Window (days)" value={days} onChange={(e) => setDays(e.target.value)} />
      <button style={btn} onClick={run} disabled={loading || !petId}>{loading ? 'Analyzing...' : 'Analyze Wellness'}</button>
      <Err msg={err} payload={errPayload} />
      <Pre data={out} />
    </div>
  );
}

function EmergencyTriage() {
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [situation, setSituation] = useState('Dog is lethargic, vomited 3 times in last hour, no diarrhea, ate something off the floor an hour ago.');
  const [vitals, setVitals] = useState('{"temperature_F": 102.5, "heart_rate_bpm": 130}');
  const [out, setOut] = useState(null); const [err, setErr] = useState(null); const [errPayload, setErrPayload] = useState(null); const [loading, setLoading] = useState(false);
  useEffect(() => { getPets().then(r => { setPets(r.data || []); if ((r.data || []).length) setPetId(r.data[0].id); }).catch(() => {}); }, []);
  const run = async () => {
    setLoading(true); setErr(null); setOut(null); setErrPayload(null);
    try {
      let parsed = null; try { parsed = JSON.parse(vitals); } catch {}
      const r = await aiEmergencyTriage({ petId: Number(petId), situation, vital_signs: parsed });
      setOut(r.data);
    } catch (e) { setErr(e.response?.data?.error || e.message); setErrPayload(e.response?.data); }
    setLoading(false);
  };
  return (
    <div style={card}>
      <h3>Emergency Triage (advisory only)</h3>
      <Presets disabled={loading} apply={index => {
        setSituation([
          'Dog vomited twice this morning but remains alert and drinking water.',
          'Cat has been hiding and has eaten very little since yesterday.',
          'Dog is panting heavily after resting indoors for 20 minutes.',
        ][index]);
        setVitals([
          '{"temperature_F":102.1,"heart_rate_bpm":110}',
          '{"temperature_F":101.5,"heart_rate_bpm":160}',
          '{"temperature_F":103.0,"heart_rate_bpm":145}',
        ][index]);
      }} />
      {!petId && <p>Select an existing pet before analysis.</p>}
      <select style={{ width: '100%', padding: 8, marginBottom: 8 }} value={petId} onChange={(e) => setPetId(e.target.value)}>
        <option value="">Select pet…</option>
        {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <textarea style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 80 }} placeholder="Situation" value={situation} onChange={(e) => setSituation(e.target.value)} />
      <textarea style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 60, fontFamily: 'monospace' }} placeholder="Vitals JSON" value={vitals} onChange={(e) => setVitals(e.target.value)} />
      <button style={btn} onClick={run} disabled={loading || !petId}>{loading ? 'Triaging...' : 'Get Triage'}</button>
      <Err msg={err} payload={errPayload} />
      <Pre data={out} />
    </div>
  );
}

function PhotoRegression() {
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [bodyPart, setBodyPart] = useState('left ear');
  const [prior, setPrior] = useState('Mild redness, slight swelling 2 weeks ago.');
  const [file, setFile] = useState(null);
  const [out, setOut] = useState(null); const [err, setErr] = useState(null); const [errPayload, setErrPayload] = useState(null); const [loading, setLoading] = useState(false);
  useEffect(() => { getPets().then(r => { setPets(r.data || []); if ((r.data || []).length) setPetId(r.data[0].id); }).catch(() => {}); }, []);
  const run = async () => {
    setLoading(true); setErr(null); setOut(null); setErrPayload(null);
    try {
      if (!file) throw new Error('Photo required');
      const fd = new FormData();
      fd.append('photo', file);
      if (petId) fd.append('petId', petId);
      fd.append('body_part', bodyPart);
      fd.append('prior_findings', prior);
      const r = await aiPhotoRegression(fd);
      setOut(r.data);
    } catch (e) { setErr(e.response?.data?.error || e.message); setErrPayload(e.response?.data); }
    setLoading(false);
  };
  return (
    <div style={card}>
      <h3>Photo Regression Analysis</h3>
      <Presets disabled={loading} needsPhoto apply={index => {
        setBodyPart(['left ear', 'right front paw', 'lower abdomen'][index]);
        setPrior([
          'Mild redness noticed two weeks ago; no prior photo comparison available.',
          'Slight swelling after a walk last week; monitor visible changes.',
          'Small patch of irritated skin seen three days ago; compare with current photo.',
        ][index]);
      }} />
      <select style={{ width: '100%', padding: 8, marginBottom: 8 }} value={petId} onChange={(e) => setPetId(e.target.value)}>
        <option value="">Select pet (optional)…</option>
        {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input style={{ width: '100%', padding: 8, marginBottom: 8 }} placeholder="Body part" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} />
      <textarea style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 60 }} placeholder="Prior findings" value={prior} onChange={(e) => setPrior(e.target.value)} />
      <input type="file" accept="image/*" style={{ marginBottom: 8 }} onChange={(e) => setFile(e.target.files?.[0])} />
      <br />
      <button style={btn} onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Photo'}</button>
      <Err msg={err} payload={errPayload} />
      <Pre data={out} />
    </div>
  );
}

function Integrations() {
  const [vet, setVet] = useState(null); const [pharm, setPharm] = useState(null); const [wear, setWear] = useState(null);
  const checkVet = async () => { try { const r = await aiVetClinicStatus(); setVet(r.data); } catch (e) { setVet(e.response?.data || { error: e.message }); } };
  const checkPharm = async () => { try { const r = await aiPharmacyStatus(); setPharm(r.data); } catch (e) { setPharm(e.response?.data || { error: e.message }); } };
  const checkWear = async () => { try { const r = await aiWearableStatus(); setWear(r.data); } catch (e) { setWear(e.response?.data || { error: e.message }); } };
  return (
    <div style={card}>
      <h3>Integrations (NEEDS-CREDS)</h3>
      <p style={{ color: '#6b7280' }}>503 with `missing: ENV_NAME` if env var unset.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button style={btn} onClick={checkVet}>Vet Clinic (VETCOVE_API_KEY)</button>
        <button style={btn} onClick={checkPharm}>Pharmacy (CHEWY_API_KEY)</button>
        <button style={btn} onClick={checkWear}>Wearable (FITBARK_API_TOKEN)</button>
      </div>
      <h4>Vet Clinic</h4><Pre data={vet} />
      <h4>Pharmacy</h4><Pre data={pharm} />
      <h4>Wearable</h4><Pre data={wear} />
    </div>
  );
}

function Community() {
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newPost, setNewPost] = useState('');
  const [err, setErr] = useState(null);

  const refresh = async () => {
    try { const r = await communityListTopics(); setTopics(r.data || []); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  useEffect(() => { refresh(); }, []);

  const openTopic = async (id) => {
    setActiveTopic(id);
    try { const r = await communityListPosts(id); setPosts(r.data || []); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  const createTopic = async () => {
    try { await communityCreateTopic({ title: newTitle, category: newCategory }); setNewTitle(''); refresh(); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  const createPost = async () => {
    try { await communityCreatePost(activeTopic, { body: newPost }); setNewPost(''); openTopic(activeTopic); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  return (
    <div style={card}>
      <h3>Community / Peer Support</h3>
      <Err msg={err} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input style={{ flex: 1, padding: 8 }} placeholder="New topic title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <input style={{ flex: 0.4, padding: 8 }} placeholder="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <button style={btn} onClick={createTopic}>Create</button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
          <h4>Topics</h4>
          {topics.map(t => (
            <div key={t.id} onClick={() => openTopic(t.id)} style={{ padding: 8, cursor: 'pointer', background: activeTopic === t.id ? '#eef2ff' : 'transparent', borderRadius: 4 }}>
              <strong>{t.title}</strong>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{t.category}</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 2 }}>
          <h4>Posts</h4>
          {posts.map(p => (
            <div key={p.id} style={{ padding: 8, marginBottom: 8, background: '#f9fafb', borderRadius: 4 }}>
              <div>{p.body}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.created_at}</div>
            </div>
          ))}
          {activeTopic && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <textarea style={{ flex: 1, padding: 8, minHeight: 60 }} value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Add a post" />
              <button style={btn} onClick={createPost}>Post</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BacklogToolsPage() {
  const [tab, setTab] = useState('cost');
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Backlog Tools</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={tab === k ? btn : btnSecondary}>{l}</button>
        ))}
      </div>
      {tab === 'cost' && <CostNegotiate />}
      {tab === 'wellness' && <AgenticWellness />}
      {tab === 'triage' && <EmergencyTriage />}
      {tab === 'photo' && <PhotoRegression />}
      {tab === 'integrations' && <Integrations />}
      {tab === 'community' && <Community />}
    </div>
  );
}
