// Custom Views: pet vitals trends, pet x metric heatmap, vet visit PDF report, and CRUD-style care reminder rules
// 4 endpoints:
//   GET  /vitals-trend         -> aggregated weight/activity/sleep timeseries per pet
//   GET  /pet-metric-heatmap   -> normalized metric scores per pet (heatmap matrix)
//   GET  /vet-visit-report     -> HTML/PDF-ready report for vet visit
//   GET/POST/PUT/DELETE /care-reminders -> CRUD over care reminder rules (vaccinations & medications union)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  Pet, WeightLog, Activity, SleepLog, Vaccination, Medication, Appointment,
  HealthRecord, FeedingLog
} = require('../models');

router.use(auth);

// ---------- VIZ 1: Pet vitals trend chart ----------
// Returns: { series: [{ date, pets: { [petName]: { weight, activityMinutes, sleepHours } } }], pets: [...names] }
router.get('/vitals-trend', async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { userId: req.user.id } });
    const petIds = pets.map(p => p.id);
    const petMap = {};
    pets.forEach(p => { petMap[p.id] = p.name; });

    const [weights, activities, sleeps] = await Promise.all([
      WeightLog.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
      Activity.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
      SleepLog.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
    ]);

    // Index by date
    const byDate = {};
    const addPoint = (date, petName, key, value) => {
      if (!date || value == null) return;
      if (!byDate[date]) byDate[date] = { date, points: {} };
      if (!byDate[date].points[petName]) byDate[date].points[petName] = {};
      const cur = byDate[date].points[petName][key];
      // average if multiple records same day
      byDate[date].points[petName][key] = cur == null ? Number(value) : (cur + Number(value)) / 2;
    };

    weights.forEach(w => addPoint(w.date, petMap[w.petId], 'weight', w.weight));
    activities.forEach(a => addPoint(a.date, petMap[a.petId], 'activityMinutes', a.duration));
    sleeps.forEach(s => addPoint(s.date, petMap[s.petId], 'sleepHours', s.duration));

    const series = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    res.json({
      ok: true,
      pets: pets.map(p => p.name),
      petCount: pets.length,
      series,
      summary: {
        weightRecords: weights.length,
        activityRecords: activities.length,
        sleepRecords: sleeps.length,
      },
    });
  } catch (err) {
    console.error('vitals-trend error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- VIZ 2: Activity/health heatmap (pet x metric) ----------
// Returns: matrix of normalized scores (0-100) for each pet vs metric
router.get('/pet-metric-heatmap', async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { userId: req.user.id } });
    const petIds = pets.map(p => p.id);
    if (petIds.length === 0) {
      return res.json({ ok: true, metrics: [], pets: [], matrix: [] });
    }

    const [weights, activities, sleeps, vacs, meds, appts, feeds, hr] = await Promise.all([
      WeightLog.findAll({ where: { petId: petIds } }),
      Activity.findAll({ where: { petId: petIds } }),
      SleepLog.findAll({ where: { petId: petIds } }),
      Vaccination.findAll({ where: { petId: petIds } }),
      Medication.findAll({ where: { petId: petIds } }),
      Appointment.findAll({ where: { petId: petIds } }),
      FeedingLog.findAll({ where: { petId: petIds } }),
      HealthRecord.findAll({ where: { petId: petIds } }),
    ]);

    const metrics = ['Activity', 'Sleep', 'Weight Logs', 'Vaccinations', 'Medications', 'Vet Visits', 'Feeding', 'Health Records'];

    // Compute raw count/avg per pet
    const raw = {};
    pets.forEach(p => {
      raw[p.id] = {
        'Activity': activities.filter(a => a.petId === p.id).reduce((s, a) => s + (a.duration || 0), 0),
        'Sleep': sleeps.filter(s => s.petId === p.id).reduce((sum, s) => sum + (s.duration || 0), 0),
        'Weight Logs': weights.filter(w => w.petId === p.id).length,
        'Vaccinations': vacs.filter(v => v.petId === p.id).length,
        'Medications': meds.filter(m => m.petId === p.id).length,
        'Vet Visits': appts.filter(a => a.petId === p.id).length,
        'Feeding': feeds.filter(f => f.petId === p.id).length,
        'Health Records': hr.filter(h => h.petId === p.id).length,
      };
    });

    // Normalize per metric -> 0-100 scale (max value -> 100)
    const maxByMetric = {};
    metrics.forEach(m => {
      maxByMetric[m] = Math.max(1, ...pets.map(p => raw[p.id][m] || 0));
    });

    const matrix = pets.map(p => ({
      petId: p.id,
      pet: p.name,
      cells: metrics.map(m => ({
        metric: m,
        raw: raw[p.id][m] || 0,
        score: Math.round(((raw[p.id][m] || 0) / maxByMetric[m]) * 100),
      })),
    }));

    res.json({
      ok: true,
      metrics,
      pets: pets.map(p => p.name),
      matrix,
    });
  } catch (err) {
    console.error('pet-metric-heatmap error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- NON-VIZ 1: Vet visit report (PDF-ready HTML) ----------
// GET /vet-visit-report?petId=...&appointmentId=...   (both optional; uses most recent if missing)
router.get('/vet-visit-report', async (req, res) => {
  try {
    const { petId, appointmentId } = req.query;
    const pets = await Pet.findAll({ where: { userId: req.user.id } });
    if (pets.length === 0) return res.json({ ok: true, html: '<p>No pets found.</p>', filename: 'vet-visit.html' });

    let pet;
    if (petId) {
      pet = pets.find(p => String(p.id) === String(petId));
    }
    if (!pet) pet = pets[0];
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    let appointment = null;
    const appts = await Appointment.findAll({ where: { petId: pet.id }, order: [['date', 'DESC']] });
    if (appointmentId) appointment = appts.find(a => String(a.id) === String(appointmentId)) || null;
    if (!appointment && appts.length > 0) appointment = appts[0];

    const [vacs, meds, weights, hrs] = await Promise.all([
      Vaccination.findAll({ where: { petId: pet.id }, order: [['dateAdministered', 'DESC']] }),
      Medication.findAll({ where: { petId: pet.id }, order: [['startDate', 'DESC']] }),
      WeightLog.findAll({ where: { petId: pet.id }, order: [['date', 'DESC']], limit: 5 }),
      HealthRecord.findAll({ where: { petId: pet.id }, order: [['date', 'DESC']], limit: 5 }),
    ]);

    const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Vet Visit Report — ${esc(pet.name)}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; color: #1f2937; padding: 32px; max-width: 800px; margin: 0 auto; }
  h1 { color: #6366f1; margin-bottom: 4px; }
  h2 { color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 4px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  th { background: #f3f4f6; }
  .meta { color: #6b7280; font-size: 13px; }
  .pill { display: inline-block; background: #eef2ff; color: #4338ca; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
</style></head>
<body>
  <h1>🐾 Vet Visit Report</h1>
  <p class="meta">Generated ${new Date().toLocaleString()} • Pet: <strong>${esc(pet.name)}</strong>
    <span class="pill">${esc(pet.species)}${pet.breed ? ' • ' + esc(pet.breed) : ''}</span>
  </p>

  <h2>Patient Profile</h2>
  <table>
    <tr><th>Name</th><td>${esc(pet.name)}</td><th>Species</th><td>${esc(pet.species)}</td></tr>
    <tr><th>Breed</th><td>${esc(pet.breed || '-')}</td><th>Age</th><td>${esc(pet.age || '-')}</td></tr>
    <tr><th>Weight</th><td>${esc(pet.weight || '-')} lbs</td><th>Microchip</th><td>${esc(pet.microchipId || '-')}</td></tr>
  </table>

  <h2>Visit Details</h2>
  ${appointment ? `
  <table>
    <tr><th>Vet</th><td>${esc(appointment.vetName)}</td><th>Clinic</th><td>${esc(appointment.clinicName || '-')}</td></tr>
    <tr><th>Date</th><td>${esc(appointment.date)}</td><th>Time</th><td>${esc(appointment.time || '-')}</td></tr>
    <tr><th>Reason</th><td colspan="3">${esc(appointment.reason || '-')}</td></tr>
    <tr><th>Status</th><td>${esc(appointment.status)}</td><th>Cost</th><td>$${esc(appointment.cost || '0')}</td></tr>
  </table>` : '<p>No appointments on record.</p>'}

  <h2>Recent Weight History</h2>
  ${weights.length ? `<table><tr><th>Date</th><th>Weight</th><th>Notes</th></tr>${weights.map(w => `<tr><td>${esc(w.date)}</td><td>${esc(w.weight)} ${esc(w.unit)}</td><td>${esc(w.notes || '-')}</td></tr>`).join('')}</table>` : '<p>No weight records.</p>'}

  <h2>Vaccinations (${vacs.length})</h2>
  ${vacs.length ? `<table><tr><th>Vaccine</th><th>Administered</th><th>Next Due</th></tr>${vacs.slice(0,8).map(v => `<tr><td>${esc(v.vaccineName)}</td><td>${esc(v.dateAdministered)}</td><td>${esc(v.nextDueDate || '-')}</td></tr>`).join('')}</table>` : '<p>None recorded.</p>'}

  <h2>Active Medications (${meds.length})</h2>
  ${meds.length ? `<table><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Start</th></tr>${meds.slice(0,8).map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.dosage || '-')}</td><td>${esc(m.frequency || '-')}</td><td>${esc(m.startDate || '-')}</td></tr>`).join('')}</table>` : '<p>None recorded.</p>'}

  <h2>Recent Health Records</h2>
  ${hrs.length ? `<table><tr><th>Date</th><th>Type</th><th>Diagnosis</th></tr>${hrs.map(h => `<tr><td>${esc(h.date)}</td><td>${esc(h.type)}</td><td>${esc(h.diagnosis || '-')}</td></tr>`).join('')}</table>` : '<p>No records.</p>'}

  <p class="meta" style="margin-top:32px;">Print to PDF via your browser. Confidential — for veterinary use.</p>
</body></html>`;

    res.json({
      ok: true,
      petId: pet.id,
      petName: pet.name,
      appointmentId: appointment?.id || null,
      filename: `vet-visit-${pet.name.replace(/\s+/g, '_')}-${(appointment?.date || new Date().toISOString().slice(0, 10))}.html`,
      html,
    });
  } catch (err) {
    console.error('vet-visit-report error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- NON-VIZ 2: Care reminder rules editor (CRUD union of vaccinations + medications) ----------
// GET    /care-reminders            -> list all (vaccinations + medications) for user's pets
// POST   /care-reminders            -> create (kind: 'vaccination'|'medication')
// PUT    /care-reminders/:kind/:id  -> update
// DELETE /care-reminders/:kind/:id  -> delete

router.get('/care-reminders', async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { userId: req.user.id } });
    const petIds = pets.map(p => p.id);
    const petMap = {};
    pets.forEach(p => { petMap[p.id] = p.name; });

    const [vacs, meds] = await Promise.all([
      Vaccination.findAll({ where: { petId: petIds }, order: [['nextDueDate', 'ASC']] }),
      Medication.findAll({ where: { petId: petIds }, order: [['refillDate', 'ASC']] }),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const rules = [
      ...vacs.map(v => ({
        kind: 'vaccination',
        id: v.id,
        petId: v.petId,
        petName: petMap[v.petId] || `Pet ${v.petId}`,
        name: v.vaccineName,
        nextDate: v.nextDueDate,
        overdue: v.nextDueDate && v.nextDueDate < today,
        details: { batchNumber: v.batchNumber, manufacturer: v.manufacturer, vetName: v.vetName, cost: v.cost },
        notes: v.notes,
      })),
      ...meds.map(m => ({
        kind: 'medication',
        id: m.id,
        petId: m.petId,
        petName: petMap[m.petId] || `Pet ${m.petId}`,
        name: m.name,
        nextDate: m.refillDate,
        overdue: m.refillDate && m.refillDate < today,
        details: { dosage: m.dosage, frequency: m.frequency, prescribedBy: m.prescribedBy, cost: m.cost },
        notes: m.notes,
      })),
    ];

    res.json({
      ok: true,
      total: rules.length,
      overdueCount: rules.filter(r => r.overdue).length,
      rules,
      pets: pets.map(p => ({ id: p.id, name: p.name })),
    });
  } catch (err) {
    console.error('care-reminders list error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/care-reminders', async (req, res) => {
  try {
    const { kind, petId, name, nextDate, details = {}, notes } = req.body || {};
    if (!kind || !petId || !name) return res.status(400).json({ error: 'kind, petId, name required' });
    const pet = await Pet.findOne({ where: { id: petId, userId: req.user.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    let created;
    if (kind === 'vaccination') {
      created = await Vaccination.create({
        petId,
        vaccineName: name,
        dateAdministered: details.dateAdministered || new Date().toISOString().slice(0, 10),
        nextDueDate: nextDate || null,
        vetName: details.vetName,
        batchNumber: details.batchNumber,
        manufacturer: details.manufacturer,
        cost: details.cost,
        notes,
      });
    } else if (kind === 'medication') {
      created = await Medication.create({
        petId,
        name,
        dosage: details.dosage,
        frequency: details.frequency,
        startDate: details.startDate || new Date().toISOString().slice(0, 10),
        endDate: details.endDate,
        prescribedBy: details.prescribedBy,
        refillDate: nextDate || null,
        cost: details.cost,
        notes,
      });
    } else {
      return res.status(400).json({ error: 'kind must be vaccination or medication' });
    }
    res.status(201).json({ ok: true, kind, id: created.id, record: created });
  } catch (err) {
    console.error('care-reminders create error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/care-reminders/:kind/:id', async (req, res) => {
  try {
    const { kind, id } = req.params;
    const { name, nextDate, details = {}, notes } = req.body || {};
    const Model = kind === 'vaccination' ? Vaccination : kind === 'medication' ? Medication : null;
    if (!Model) return res.status(400).json({ error: 'Invalid kind' });
    const record = await Model.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    // ensure record's pet is owned by user
    const pet = await Pet.findOne({ where: { id: record.petId, userId: req.user.id } });
    if (!pet) return res.status(403).json({ error: 'Forbidden' });

    if (kind === 'vaccination') {
      if (name != null) record.vaccineName = name;
      if (nextDate != null) record.nextDueDate = nextDate || null;
      if (details.vetName != null) record.vetName = details.vetName;
      if (details.batchNumber != null) record.batchNumber = details.batchNumber;
      if (details.manufacturer != null) record.manufacturer = details.manufacturer;
      if (details.cost != null) record.cost = details.cost;
    } else {
      if (name != null) record.name = name;
      if (nextDate != null) record.refillDate = nextDate || null;
      if (details.dosage != null) record.dosage = details.dosage;
      if (details.frequency != null) record.frequency = details.frequency;
      if (details.prescribedBy != null) record.prescribedBy = details.prescribedBy;
      if (details.cost != null) record.cost = details.cost;
    }
    if (notes != null) record.notes = notes;
    await record.save();
    res.json({ ok: true, kind, id: record.id, record });
  } catch (err) {
    console.error('care-reminders update error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/care-reminders/:kind/:id', async (req, res) => {
  try {
    const { kind, id } = req.params;
    const Model = kind === 'vaccination' ? Vaccination : kind === 'medication' ? Medication : null;
    if (!Model) return res.status(400).json({ error: 'Invalid kind' });
    const record = await Model.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    const pet = await Pet.findOne({ where: { id: record.petId, userId: req.user.id } });
    if (!pet) return res.status(403).json({ error: 'Forbidden' });
    await record.destroy();
    res.json({ ok: true, deleted: true, kind, id });
  } catch (err) {
    console.error('care-reminders delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
