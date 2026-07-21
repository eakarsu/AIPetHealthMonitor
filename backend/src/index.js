const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Exiting.');
  process.exit(1);
}

const { sequelize, HealthRecord, BehaviorLog, NutritionPlan, Vaccination,
  Medication, Appointment, WeightLog, Activity, Symptom, Insurance, Grooming, HealthReport,
  Allergy, TrainingLog, SleepLog, DentalCare, ParasitePrevention, TravelLog,
  Milestone, PetDocument, Expense, FeedingLog, LabResult, SocializationLog, PetSupply } = require('./models');
const createCrudRouter = require('./routes/crud');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/health-records', createCrudRouter(HealthRecord));
app.use('/api/behaviors', createCrudRouter(BehaviorLog));
app.use('/api/nutrition', createCrudRouter(NutritionPlan));
app.use('/api/vaccinations', createCrudRouter(Vaccination));
app.use('/api/medications', createCrudRouter(Medication));
app.use('/api/appointments', createCrudRouter(Appointment));
app.use('/api/weight', createCrudRouter(WeightLog));
app.use('/api/activities', createCrudRouter(Activity));
app.use('/api/symptoms', createCrudRouter(Symptom));
app.use('/api/insurance', createCrudRouter(Insurance));
app.use('/api/grooming', createCrudRouter(Grooming));
app.use('/api/health-reports', createCrudRouter(HealthReport));
app.use('/api/allergies', createCrudRouter(Allergy));
app.use('/api/training', createCrudRouter(TrainingLog));
app.use('/api/sleep', createCrudRouter(SleepLog));
app.use('/api/dental', createCrudRouter(DentalCare));
app.use('/api/parasite-prevention', createCrudRouter(ParasitePrevention));
app.use('/api/travel', createCrudRouter(TravelLog));
app.use('/api/milestones', createCrudRouter(Milestone));
app.use('/api/documents', createCrudRouter(PetDocument));
app.use('/api/expenses', createCrudRouter(Expense));
app.use('/api/feeding', createCrudRouter(FeedingLog));
app.use('/api/lab-results', createCrudRouter(LabResult));
app.use('/api/socialization', createCrudRouter(SocializationLog));
app.use('/api/supplies', createCrudRouter(PetSupply));
app.use('/api/emergency-contacts', require('./routes/emergency'));
app.use('/api/ai', require('./routes/ai'));
const auth = require('./middleware/auth');
app.use('/api/pet-care-workflows', auth, require('./routes/petCareWorkflow'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Analytics endpoint
const { Pet } = require('./models');

app.get('/api/analytics/summary', auth, async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { userId: req.user.id } });
    const petIds = pets.map(p => p.id);

    const [expenses, weights, activities, appointments, medications] = await Promise.all([
      Expense.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
      WeightLog.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
      Activity.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
      Appointment.findAll({ where: { petId: petIds }, order: [['date', 'ASC']] }),
      Medication.findAll({ where: { petId: petIds } })
    ]);

    // Monthly expense totals
    const monthlyExpenses = {};
    expenses.forEach(e => {
      const month = e.date ? e.date.substring(0, 7) : 'Unknown';
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Number(e.amount || 0);
    });

    // Weight trends per pet
    const weightTrends = {};
    weights.forEach(w => {
      if (!weightTrends[w.petId]) weightTrends[w.petId] = [];
      weightTrends[w.petId].push({ date: w.date, weight: w.weight, unit: w.unit });
    });

    // Activity stats per pet
    const activityStats = {};
    activities.forEach(a => {
      if (!activityStats[a.petId]) activityStats[a.petId] = { totalDuration: 0, totalDistance: 0, count: 0 };
      activityStats[a.petId].totalDuration += (a.duration || 0);
      activityStats[a.petId].totalDistance += (a.distance || 0);
      activityStats[a.petId].count++;
    });

    // Upcoming appointments
    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter(a => a.date >= today && a.status === 'scheduled');

    // Active medications
    const activeMeds = medications.filter(m => !m.endDate || m.endDate >= today);

    // Total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Expense by category
    const expenseByCategory = {};
    expenses.forEach(e => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount || 0);
    });

    res.json({
      pets: pets.length,
      totalExpenses,
      monthlyExpenses: Object.entries(monthlyExpenses).map(([month, total]) => ({ month, total })),
      expenseByCategory: Object.entries(expenseByCategory).map(([category, total]) => ({ category, total })),
      weightTrends,
      activityStats,
      upcomingAppointments: upcoming.length,
      activeMedications: activeMeds.length,
      totalActivities: activities.length,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Calendar events endpoint
app.get('/api/calendar/events', auth, async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { userId: req.user.id } });
    const petIds = pets.map(p => p.id);
    const petMap = {};
    pets.forEach(p => { petMap[p.id] = p.name; });

    const [appointments, vaccinations, medications, grooming, dental, parasite] = await Promise.all([
      Appointment.findAll({ where: { petId: petIds } }),
      Vaccination.findAll({ where: { petId: petIds } }),
      Medication.findAll({ where: { petId: petIds } }),
      Grooming.findAll({ where: { petId: petIds } }),
      DentalCare.findAll({ where: { petId: petIds } }),
      ParasitePrevention.findAll({ where: { petId: petIds } })
    ]);

    const events = [];

    appointments.forEach(a => {
      events.push({ id: `apt-${a.id}`, type: 'appointment', title: `Vet: ${a.reason || a.vetName}`, date: a.date, time: a.time, pet: petMap[a.petId], status: a.status, color: '#6366f1' });
    });

    vaccinations.forEach(v => {
      if (v.nextDueDate) events.push({ id: `vax-${v.id}`, type: 'vaccination', title: `Vaccine: ${v.vaccineName}`, date: v.nextDueDate, pet: petMap[v.petId], color: '#10b981' });
    });

    medications.forEach(m => {
      if (m.refillDate) events.push({ id: `med-${m.id}`, type: 'medication', title: `Refill: ${m.name}`, date: m.refillDate, pet: petMap[m.petId], color: '#f59e0b' });
    });

    grooming.forEach(g => {
      if (g.nextDate) events.push({ id: `groom-${g.id}`, type: 'grooming', title: `Grooming: ${g.service}`, date: g.nextDate, pet: petMap[g.petId], color: '#ec4899' });
    });

    dental.forEach(d => {
      if (d.nextDate) events.push({ id: `dental-${d.id}`, type: 'dental', title: `Dental: ${d.type}`, date: d.nextDate, pet: petMap[d.petId], color: '#8b5cf6' });
    });

    parasite.forEach(p => {
      if (p.nextDueDate) events.push({ id: `para-${p.id}`, type: 'parasite', title: `${p.type}: ${p.productName || 'Due'}`, date: p.nextDueDate, pet: petMap[p.petId], color: '#ef4444' });
    });

    events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Export data endpoint
app.get('/api/export/:resource/pet/:petId', auth, async (req, res) => {
  try {
    const { resource, petId } = req.params;
    const pet = await Pet.findOne({ where: { id: petId, userId: req.user.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const modelMap = {
      'health-records': HealthRecord, 'behaviors': BehaviorLog, 'nutrition': NutritionPlan,
      'vaccinations': Vaccination, 'medications': Medication, 'appointments': Appointment,
      'weight': WeightLog, 'activities': Activity, 'symptoms': Symptom, 'insurance': Insurance,
      'grooming': Grooming, 'allergies': Allergy, 'training': TrainingLog, 'sleep': SleepLog,
      'dental': DentalCare, 'parasite-prevention': ParasitePrevention, 'travel': TravelLog,
      'milestones': Milestone, 'documents': PetDocument, 'expenses': Expense,
      'feeding': FeedingLog, 'lab-results': LabResult, 'socialization': SocializationLog,
      'supplies': PetSupply
    };

    const Model = modelMap[resource];
    if (!Model) return res.status(400).json({ error: 'Invalid resource' });

    const records = await Model.findAll({ where: { petId }, order: [['createdAt', 'DESC']] });

    if (records.length === 0) return res.json({ csv: '', filename: `${pet.name}_${resource}.csv` });

    const data = records.map(r => r.toJSON());
    const headers = Object.keys(data[0]).filter(k => !['id', 'petId', 'createdAt', 'updatedAt'].includes(k));
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      csvRows.push(headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(','));
    });

    res.json({ csv: csvRows.join('\n'), filename: `${pet.name}_${resource}.csv` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// User profile update
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { User } = require('./models');
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, plan: user.plan });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Change password
app.put('/api/auth/password', auth, async (req, res) => {
  try {
    const { User } = require('./models');
    const bcrypt = require('bcryptjs');
    const user = await User.findByPk(req.user.id);
    const { currentPassword, newPassword } = req.body;
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use(/^\/api\/(?:cf-|gap-)/, auth, (req, res) => res.status(503).json({ error: 'Generated feature route is quarantined pending validated implementation' }));

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    const [schemaCheck] = await sequelize.query("SELECT to_regclass('public.pet_care_cases') AS relation");
    if (!schemaCheck[0]?.relation) throw new Error('database migrations are required; pet_care_cases is missing');

// === Custom Feature Mounts (batch_06) ===
app.use('/api/cf-agentic-wellness-monitoring', require('./routes/customFeat01_AgenticWellnessMonitoring'));
app.use('/api/cf-photo-based-health-screening', require('./routes/customFeat02_PhotoBasedHealthScreening'));
app.use('/api/cf-emergency-decision-support', require('./routes/customFeat03_EmergencyDecisionSupport'));
app.use('/api/cf-breedage-specific-care-automation', require('./routes/customFeat04_BreedageSpecificCareAutomation'));
app.use('/api/cf-veterinary-cost-negotiation', require('./routes/customFeat05_VeterinaryCostNegotiation'));


// === Batch 06 Gaps & Frontend Mounts ===
app.use('/api/gap-pets-without-genetic', require('./routes/gapFeat_pets_without_genetic'));
app.use('/api/gap-medical-history-without-health', require('./routes/gapFeat_medical_history_without_health'));
app.use('/api/gap-backend-collapses-everything-into-crud-js', require('./routes/gapFeat_backend_collapses_everything_into_crud_js'));
app.use('/api/gap-no-veterinary-clinic-integration-medical-records-i', require('./routes/gapFeat_no_veterinary_clinic_integration_medical_records_i'));
app.use('/api/gap-no-pharmacy-integration-medication-refills-cost-tr', require('./routes/gapFeat_no_pharmacy_integration_medication_refills_cost_tr'));
app.use('/api/gap-no-breed-database-breed', require('./routes/gapFeat_no_breed_database_breed'));
app.use('/api/gap-limited-community-features-peer-support-experience', require('./routes/gapFeat_limited_community_features_peer_support_experience'));
app.use('/api/gap-no-notifications-module-grep-0', require('./routes/gapFeat_no_notifications_module_grep_0'));
app.use('/api/gap-no-audit-logging-grep-0', require('./routes/gapFeat_no_audit_logging_grep_0'));
app.use('/api/gap-no-webhooks-for-clinic-events', require('./routes/gapFeat_no_webhooks_for_clinic_events'));

// === Custom Views (mounted before any 404 handler) ===
app.use('/api/custom-views', require('./routes/customViews'));

// 404 fallback for unknown /api routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
