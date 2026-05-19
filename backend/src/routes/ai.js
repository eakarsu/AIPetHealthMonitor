const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { askAI } = require('../services/aiService');
const fetch = require('node-fetch');
const { Pet, Symptom, HealthRecord, BehaviorLog, NutritionPlan, WeightLog, Activity, HealthReport, LabResult } = require('../models');
const router = express.Router();

// Multer setup for photo uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(auth);

// Helper to parse risk level from AI text
function parseRiskLevel(text) {
  if (!text) return 'low';
  const lower = text.toLowerCase();
  if (lower.includes('critical')) return 'high';
  if (lower.includes('high risk') || lower.includes('high-risk') || /\brisk[:\s]+high\b/.test(lower)) return 'high';
  if (lower.includes('medium risk') || lower.includes('moderate risk') || /\brisk[:\s]+(medium|moderate)\b/.test(lower)) return 'moderate';
  // Look for standalone High/Medium/Low near "risk"
  const match = lower.match(/(?:risk\s*(?:level|factor)?[:\s]+)(low|moderate|medium|high|critical)/i)
    || lower.match(/\b(critical|high)\s+risk\b/i)
    || lower.match(/\b(moderate|medium)\s+risk\b/i);
  if (match) {
    const level = match[1].toLowerCase();
    if (level === 'critical' || level === 'high') return 'high';
    if (level === 'moderate' || level === 'medium') return 'moderate';
    return 'low';
  }
  return 'low';
}

// AI Symptom Checker
router.post('/symptom-check', aiRateLimiter, async (req, res) => {
  try {
    const { petId, symptoms, severity, duration } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Analyze these symptoms for a ${pet.age || 'unknown'} year old ${pet.breed || 'unknown'} ${pet.species} named ${pet.name} (weight: ${pet.weight || 'unknown'} lbs):

Symptoms: ${symptoms}
Severity: ${severity}
Duration: ${duration}

Please provide:
1. **Possible Conditions** - List 3-5 possible conditions with likelihood
2. **Urgency Level** - Rate from 1-10 how urgent this is
3. **Immediate Care Steps** - What the owner should do now
4. **When to See a Vet** - Clear guidance on timing
5. **Home Remedies** - Safe home care options if applicable
6. **Warning Signs** - What to watch for that would require emergency care`;

    const aiResponse = await askAI(prompt);

    if (!aiResponse.error) {
      await Symptom.create({
        petId, symptom: symptoms, severity: severity || 'moderate',
        date: new Date().toISOString().split('T')[0],
        duration, aiDiagnosis: aiResponse.content,
        aiRecommendation: 'See AI analysis above'
      });
    }

    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Symptom Checker with Photo (Vision AI)
router.post('/symptom-check-photo', aiRateLimiter, upload.single('photo'), async (req, res) => {
  try {
    const { petId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const imageBuffer = fs.readFileSync(req.file.path);
    const b64 = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Pet Health Monitor'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${b64}` } },
              { type: 'text', text: 'Analyze this pet photo for visible health symptoms. Identify: skin conditions, eye issues, ear problems, wound/injury, dental issues, body condition. Urgency 1-10. Return JSON: {symptoms_observed: [], urgency_score: 1-10, possible_conditions: [], immediate_actions: [], see_vet_urgency: string}' }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || 'AI service error' });

    const rawContent = data.choices?.[0]?.message?.content || '{}';
    let parsed = {};
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { symptoms_observed: [], urgency_score: 0, possible_conditions: [], immediate_actions: [], see_vet_urgency: 'Unknown' };
    } catch (e) {
      parsed = { raw: rawContent };
    }

    // Create Symptom record with image
    const symptomRecord = await Symptom.create({
      petId,
      symptom: (parsed.symptoms_observed || []).join(', ') || 'Photo analysis',
      severity: parsed.urgency_score >= 7 ? 'severe' : parsed.urgency_score >= 4 ? 'moderate' : 'mild',
      date: new Date().toISOString().split('T')[0],
      aiDiagnosis: JSON.stringify(parsed),
      aiRecommendation: parsed.see_vet_urgency || 'See full analysis'
    });

    res.json({ content: rawContent, parsed, symptomId: symptomRecord.id, model: data.model, usage: data.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Diet Recommendations
router.post('/diet-recommendation', aiRateLimiter, async (req, res) => {
  try {
    const { petId, concerns, currentDiet, allergies } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Create a detailed nutrition plan for a ${pet.age || 'unknown'} year old ${pet.breed || 'unknown'} ${pet.species} named ${pet.name} (weight: ${pet.weight || 'unknown'} lbs):

Current Diet: ${currentDiet || 'Not specified'}
Health Concerns: ${concerns || 'None specified'}
Known Allergies: ${allergies || 'None known'}

Please provide:
1. **Recommended Daily Calories** - Based on age, weight, breed
2. **Meal Plan** - Detailed daily feeding schedule
3. **Recommended Foods** - Specific brands and types
4. **Foods to Avoid** - Based on species, breed, allergies
5. **Supplements** - Any recommended vitamins or supplements
6. **Treats** - Healthy treat options and limits
7. **Hydration** - Water intake recommendations
8. **Special Considerations** - Breed-specific nutritional needs`;

    const aiResponse = await askAI(prompt);
    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Behavior Analysis
router.post('/behavior-analysis', aiRateLimiter, async (req, res) => {
  try {
    const { petId, behavior, context, frequency } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const recentBehaviors = await BehaviorLog.findAll({
      where: { petId }, limit: 10, order: [['date', 'DESC']]
    });

    const prompt = `Analyze this behavior for a ${pet.age || 'unknown'} year old ${pet.breed || 'unknown'} ${pet.species} named ${pet.name}:

Current Behavior: ${behavior}
Context: ${context || 'Not specified'}
Frequency: ${frequency || 'Not specified'}
Recent Behavior History: ${recentBehaviors.map(b => `${b.behavior} (${b.severity}) on ${b.date}`).join(', ') || 'No history'}

Please provide:
1. **Behavior Assessment** - What this behavior likely means
2. **Possible Causes** - Why the pet might be doing this
3. **Is This Normal?** - Whether this is typical for the breed/age
4. **Training Tips** - How to address or modify the behavior
5. **Environmental Changes** - Suggested adjustments to the pet's environment
6. **When to Worry** - Signs that indicate a medical or serious issue
7. **Positive Reinforcement** - Reward-based training approaches`;

    const aiResponse = await askAI(prompt);
    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Health Report Generation
router.post('/health-report', aiRateLimiter, async (req, res) => {
  try {
    const { petId } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const [healthRecords, weightLogs, activities, symptoms] = await Promise.all([
      HealthRecord.findAll({ where: { petId }, limit: 10, order: [['date', 'DESC']] }),
      WeightLog.findAll({ where: { petId }, limit: 10, order: [['date', 'DESC']] }),
      Activity.findAll({ where: { petId }, limit: 10, order: [['date', 'DESC']] }),
      Symptom.findAll({ where: { petId }, limit: 10, order: [['date', 'DESC']] })
    ]);

    const prompt = `Generate a comprehensive health report for ${pet.name}, a ${pet.age || 'unknown'} year old ${pet.breed || 'unknown'} ${pet.species} (weight: ${pet.weight || 'unknown'} lbs):

Recent Health Records: ${healthRecords.map(h => `${h.type}: ${h.description} (${h.date})`).join('; ') || 'None'}
Weight History: ${weightLogs.map(w => `${w.weight} ${w.unit} (${w.date})`).join(', ') || 'None'}
Recent Activities: ${activities.map(a => `${a.type}: ${a.duration}min ${a.intensity} (${a.date})`).join('; ') || 'None'}
Recent Symptoms: ${symptoms.map(s => `${s.symptom} (${s.severity}) on ${s.date}`).join('; ') || 'None'}

Please provide:
1. **Overall Health Score** - Rate 1-100
2. **Health Summary** - Overall assessment
3. **Weight Analysis** - Weight trend and recommendations
4. **Activity Assessment** - Exercise levels and suggestions
5. **Risk Factors** - Any health risks based on breed, age, history. Include Risk Level: Low/Medium/High/Critical
6. **Preventive Care** - Recommended screenings and checkups
7. **Wellness Goals** - Specific health goals for the next 3 months
8. **Action Items** - Priority items for the pet owner`;

    const aiResponse = await askAI(prompt);

    if (!aiResponse.error) {
      const riskLevel = parseRiskLevel(aiResponse.content);
      await HealthReport.create({
        petId, reportType: 'Comprehensive Health Report',
        generatedDate: new Date().toISOString().split('T')[0],
        summary: aiResponse.content?.substring(0, 500),
        details: aiResponse.content,
        recommendations: 'See full report',
        riskLevel,
        aiGenerated: true
      });
    }

    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Emergency Advice
router.post('/emergency-advice', aiRateLimiter, async (req, res) => {
  try {
    const { petId, situation, severity } = req.body;
    const pet = await Pet.findByPk(petId);

    const prompt = `URGENT PET EMERGENCY ADVICE:

Pet: ${pet ? `${pet.name}, ${pet.age || 'unknown'} year old ${pet.breed || 'unknown'} ${pet.species}, ${pet.weight || 'unknown'} lbs` : 'Unknown pet'}
Emergency Situation: ${situation}
Severity: ${severity || 'Unknown'}

Please provide IMMEDIATE guidance:
1. **IMMEDIATE FIRST AID** - Step-by-step emergency care
2. **DO NOT** - Critical things to avoid doing
3. **Urgency Assessment** - How quickly to get to a vet (scale 1-10)
4. **Transport Safety** - How to safely move/transport the pet
5. **What to Tell the Vet** - Key information to relay
6. **Monitoring** - Vital signs to watch

⚠️ DISCLAIMER: This is AI-generated emergency guidance. Always seek immediate veterinary care for emergencies.`;

    const aiResponse = await askAI(prompt, 'You are an emergency veterinary AI assistant. Provide clear, urgent, and potentially life-saving guidance. Always emphasize seeking professional veterinary care immediately.');
    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Insurance Recommendation
router.post('/insurance-advice', aiRateLimiter, async (req, res) => {
  try {
    const { petId, budget, concerns } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Recommend pet insurance for ${pet.name}, a ${pet.age || 'unknown'} year old ${pet.breed || 'unknown'} ${pet.species} (weight: ${pet.weight || 'unknown'} lbs):

Monthly Budget: ${budget || 'Flexible'}
Main Concerns: ${concerns || 'General coverage'}

Please provide:
1. **Recommended Coverage Level** - Basic, Standard, or Premium
2. **Key Coverage Areas** - What should be covered
3. **Estimated Monthly Cost** - Based on breed and age
4. **Breed-Specific Risks** - Known health issues for this breed
5. **Deductible Advice** - Recommended deductible level
6. **What to Look For** - Key policy features
7. **What to Avoid** - Common policy pitfalls
8. **Top Provider Suggestions** - General recommendations`;

    const aiResponse = await askAI(prompt);
    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Lab Result Interpreter
router.post('/interpret-lab-result', aiRateLimiter, async (req, res) => {
  try {
    const { labResultId } = req.body;
    if (!labResultId) return res.status(400).json({ error: 'labResultId is required' });

    const labResult = await LabResult.findByPk(labResultId);
    if (!labResult) return res.status(404).json({ error: 'Lab result not found' });

    const pet = await Pet.findByPk(labResult.petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Interpret this pet lab result for a ${pet.species} (${pet.breed || 'unknown breed'}):

Test Name: ${labResult.testName}
Date: ${labResult.date}
Result: ${labResult.result || 'Not provided'}
Normal Range: ${labResult.normalRange || 'Not specified'}
Status: ${labResult.status || 'Not specified'}
Follow-up Notes: ${labResult.followUp || 'None'}

Compare values to normal ranges for this species. Return JSON: {abnormal_values: [{test, value, normal_range, interpretation}], overall_assessment, follow_up_recommended: bool, urgency: "low"|"medium"|"high"}`;

    const aiResponse = await askAI(prompt);

    if (!aiResponse.error) {
      // Parse AI interpretation and update LabResult record
      let parsed = {};
      try {
        const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (e) {
        parsed = { raw: aiResponse.content };
      }
      await labResult.update({ aiInterpretation: JSON.stringify(parsed) });
      res.json({ ...aiResponse, parsed, labResultId });
    } else {
      res.json(aiResponse);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Emergency Specialist Finder
router.post('/find-specialists', aiRateLimiter, async (req, res) => {
  try {
    const { petId, condition, location, urgency } = req.body;
    const pet = petId ? await Pet.findByPk(petId) : null;

    const prompt = `You are a veterinary specialist finder AI. Provide guidance on finding the right specialist.

Pet: ${pet ? `${pet.name}, ${pet.age || '?'} year old ${pet.breed || ''} ${pet.species}` : 'Unknown pet'}
Condition/Symptoms: ${condition}
Owner's Location: ${location || 'Not specified'}
Urgency: ${urgency || 'moderate'}

Return JSON: {
  specialist_types: [{type, reason, urgency_needed}],
  how_to_find: [string],
  questions_to_ask: [string],
  red_flags_requiring_er: [string],
  estimated_cost_range: string,
  telehealth_options: string,
  emergency_resources: [{name, phone, description}]
}`;

    const aiResponse = await askAI(prompt);
    let parsed = {};
    if (!aiResponse.error) {
      try {
        const m = aiResponse.content.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      } catch {}
    }
    res.json({ ...aiResponse, parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Vaccination Scheduler
router.post('/vaccination-schedule', aiRateLimiter, async (req, res) => {
  try {
    const { petId } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const { Vaccination } = require('../models');
    const vaccinations = await Vaccination.findAll({ where: { petId }, order: [['dateGiven', 'DESC']] });

    const prompt = `Create a complete vaccination schedule for ${pet.name}, a ${pet.age || '?'} year old ${pet.breed || ''} ${pet.species}.

Past vaccinations: ${vaccinations.map(v => `${v.vaccineName} given ${v.dateGiven}, next due ${v.nextDueDate || 'unknown'}`).join('; ') || 'None on record'}

Return JSON: {
  recommended_vaccines: [{
    name,
    type: "core|non-core|lifestyle",
    frequency,
    next_due_date,
    importance: "critical|recommended|optional",
    reason
  }],
  overdue_vaccines: [name],
  schedule_summary: string,
  vet_visit_frequency: string
}`;

    const aiResponse = await askAI(prompt);
    let parsed = {};
    if (!aiResponse.error) {
      try {
        const m = aiResponse.content.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      } catch {}
    }
    res.json({ ...aiResponse, parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Genetic Disease Risk — breed predisposition analysis
router.post('/genetic-disease-risk', aiRateLimiter, async (req, res) => {
  try {
    const { petId } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `You are a veterinary genetics AI. Assess breed-predisposed disease risk for ${pet.name}, a ${pet.age || '?'} year old ${pet.breed || 'mixed-breed'} ${pet.species} (weight: ${pet.weight || 'unknown'} lbs, sex: ${pet.sex || 'unknown'}).

Return JSON: {
  breed_risk_summary: string,
  predisposed_conditions: [{
    condition,
    likelihood: "low|moderate|high",
    typical_onset_age: string,
    early_signs: [string],
    screening_recommended: string
  }],
  genetic_tests_recommended: [{test_name, why}],
  preventive_actions: [string],
  overall_risk_level: "low|moderate|high"
}`;

    const aiResponse = await askAI(prompt);
    let parsed = {};
    if (!aiResponse.error) {
      try {
        const m = aiResponse.content.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      } catch {}
    }
    res.json({ ...aiResponse, parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Health Trend Detection — flag chronic issues developing from medical history
router.post('/health-trend-detect', aiRateLimiter, async (req, res) => {
  try {
    const { petId } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const [healthRecords, weightLogs, symptoms, labs] = await Promise.all([
      HealthRecord.findAll({ where: { petId }, limit: 30, order: [['date', 'DESC']] }),
      WeightLog.findAll({ where: { petId }, limit: 30, order: [['date', 'DESC']] }),
      Symptom.findAll({ where: { petId }, limit: 30, order: [['date', 'DESC']] }),
      LabResult.findAll({ where: { petId }, limit: 30, order: [['date', 'DESC']] })
    ]);

    const prompt = `You are a longitudinal pet-health analyst AI. Detect emerging chronic-disease trends.

Pet: ${pet.name}, ${pet.age || '?'} year old ${pet.breed || ''} ${pet.species}.

Health Records (recent): ${healthRecords.map(h => `${h.date}: ${h.type} - ${h.description}`).join('; ') || 'None'}
Weight Logs (recent): ${weightLogs.map(w => `${w.date}: ${w.weight} ${w.unit}`).join('; ') || 'None'}
Symptoms (recent): ${symptoms.map(s => `${s.date}: ${s.symptom} (${s.severity})`).join('; ') || 'None'}
Lab Results (recent): ${labs.map(l => `${l.date}: ${l.testName}=${l.result || '?'} (normal: ${l.normalRange || '?'})`).join('; ') || 'None'}

Return JSON: {
  emerging_trends: [{
    trend,
    supporting_evidence: [string],
    likely_condition,
    confidence: "low|moderate|high",
    timeline_estimate: string
  }],
  weight_trajectory: "stable|gaining|losing|fluctuating",
  recurring_symptoms: [{symptom, occurrences, pattern}],
  recommendations: [string],
  follow_up_tests_suggested: [string],
  vet_consult_priority: "routine|soon|urgent"
}`;

    const aiResponse = await askAI(prompt);
    let parsed = {};
    if (!aiResponse.error) {
      try {
        const m = aiResponse.content.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      } catch {}
    }
    res.json({ ...aiResponse, parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Analysis History
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    // Return recent symptom checks and health reports as history
    const [symptoms, reports] = await Promise.all([
      Symptom.findAll({ limit, offset, order: [['createdAt', 'DESC']] }),
      HealthReport.findAll({ limit, offset, order: [['createdAt', 'DESC']] })
    ]);
    res.json({ symptoms, reports, page, limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =====================================================================
// Apply pass 5 — backlog endpoints
//
// ENV VARS (read at request time):
//   OPENROUTER_API_KEY     — AI features 503 if absent
//   VETCOVE_API_KEY        — Vet clinic / EHR integration; 503 if absent
//   CHEWY_API_KEY          — Pharmacy integration; 503 if absent
//   FITBARK_API_TOKEN      — Wearable integration; 503 if absent
//
// PRODUCT-DECISIONS:
//   * Community / peer support: minimal additive table + per-user moderation
//     flag; no real-time feed, no upload, no photos. Topics + posts only.
//   * Emergency decision support: returns a triage tier (1-5) with mandatory
//     "consult a vet" disclaimer; never auto-routes to ER (liability).
//   * Vet cost negotiation: AI-generated negotiation script; no pricing data
//     fetched from external sources (no credentials required).
//   * Photo regression: stores only the analysis text + a photo file path
//     reference; no embedding/vision-pipeline code in this pass.
// =====================================================================

function gateEnv(name, res) {
  if (!process.env[name]) {
    res.status(503).json({
      error: `${name} is not configured`,
      missing: name,
    });
    return false;
  }
  return true;
}

function gateOpenRouter(res) {
  return gateEnv('OPENROUTER_API_KEY', res);
}

// ---------- Community: tables + endpoints ---------------------------------
async function ensureCommunityTables() {
  try {
    const qi = require('../models').sequelize.getQueryInterface();
    await qi.sequelize.query(`
      CREATE TABLE IF NOT EXISTS community_topics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(64),
        created_by INTEGER,
        moderated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await qi.sequelize.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
        user_id INTEGER,
        body TEXT NOT NULL,
        flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    console.error('ensureCommunityTables:', e.message);
  }
}
ensureCommunityTables();

router.get('/community/topics', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const [rows] = await sequelize.query(
      'SELECT * FROM community_topics WHERE moderated = FALSE ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/community/topics', async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const userId = req.user?.id || null;
    const { sequelize } = require('../models');
    const [rows] = await sequelize.query(
      'INSERT INTO community_topics (title, category, created_by) VALUES ($1, $2, $3) RETURNING *',
      { bind: [title, category || null, userId] }
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/community/topics/:id/posts', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const [rows] = await sequelize.query(
      'SELECT * FROM community_posts WHERE topic_id = $1 AND flagged = FALSE ORDER BY created_at ASC LIMIT 200',
      { bind: [req.params.id] }
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/community/topics/:id/posts', async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || body.length < 2) return res.status(400).json({ error: 'body required' });
    if (body.length > 5000) return res.status(400).json({ error: 'body too long (5000 max)' });
    const userId = req.user?.id || null;
    const { sequelize } = require('../models');
    const [rows] = await sequelize.query(
      'INSERT INTO community_posts (topic_id, user_id, body) VALUES ($1, $2, $3) RETURNING *',
      { bind: [req.params.id, userId, body] }
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Vet cost negotiation script (AI) ----------------------------
router.post('/vet-cost-negotiate', aiRateLimiter, async (req, res) => {
  if (!gateOpenRouter(res)) return;
  try {
    const { quoted_price, procedure, symptoms, region } = req.body;
    if (!quoted_price || !procedure) {
      return res.status(400).json({ error: 'quoted_price and procedure are required' });
    }
    const prompt = `Help a pet owner negotiate a veterinary procedure cost. Provide an empathetic, professional negotiation script.

PROCEDURE: ${procedure}
QUOTED PRICE: $${quoted_price}
PET SYMPTOMS: ${symptoms || 'not specified'}
REGION: ${region || 'not specified'}

Provide:
1. A typical price range for this procedure with caveats
2. Polite questions to ask the vet (about line items, alternatives, generics)
3. A negotiation script to use on the phone or in person
4. When NOT to negotiate (true emergencies)
5. Disclaimer about the importance of quality care over price`;
    const ai = await askAI(prompt);
    res.json(ai);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Agentic wellness monitor (analyze recent multi-source data) -
router.post('/agentic-wellness', aiRateLimiter, async (req, res) => {
  if (!gateOpenRouter(res)) return;
  try {
    const { petId, days = 14 } = req.body;
    if (!petId) return res.status(400).json({ error: 'petId required' });
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { Op } = require('sequelize');
    const [weights, activities, symptoms, sleeps] = await Promise.all([
      WeightLog.findAll({ where: { petId, createdAt: { [Op.gte]: since } }, order: [['createdAt', 'DESC']] }).catch(() => []),
      Activity.findAll({ where: { petId, createdAt: { [Op.gte]: since } }, order: [['createdAt', 'DESC']] }).catch(() => []),
      Symptom.findAll({ where: { petId, createdAt: { [Op.gte]: since } }, order: [['createdAt', 'DESC']] }).catch(() => []),
      // SleepLog may or may not have petId in some schemas.
      Promise.resolve([]),
    ]);

    const prompt = `You are an agentic pet wellness monitor. Synthesize multi-source data for the past ${days} days and produce an action-oriented summary.

PET: ${pet.name} (${pet.species}, ${pet.breed || 'unknown'}, age ${pet.age || 'unknown'}, weight ${pet.weight || 'unknown'} lbs)

WEIGHTS: ${JSON.stringify(weights.slice(0, 30))}
ACTIVITIES: ${JSON.stringify(activities.slice(0, 30))}
SYMPTOMS: ${JSON.stringify(symptoms.slice(0, 20))}

Return:
1. **Wellness Score** (0-100) with reasoning
2. **Trends** (stable/improving/declining for weight, activity, symptoms)
3. **Alerts** (if any pattern requires attention)
4. **Recommended Actions** (next 7 days)
5. **Vet Visit Threshold** (signs that should trigger a vet visit)`;
    const ai = await askAI(prompt);
    res.json({ ...ai, pet_id: petId, window_days: days });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Emergency decision support -------------------------------
// PRODUCT-DECISION: Always returns a triage tier 1-5; never auto-dispatches.
router.post('/emergency-triage', aiRateLimiter, async (req, res) => {
  if (!gateOpenRouter(res)) return;
  try {
    const { petId, situation, vital_signs } = req.body;
    if (!situation) return res.status(400).json({ error: 'situation description required' });

    let petInfo = '';
    if (petId) {
      const pet = await Pet.findByPk(petId);
      if (pet) petInfo = `${pet.species}, ${pet.breed || 'unknown'}, age ${pet.age || 'unknown'}, weight ${pet.weight || 'unknown'} lbs`;
    }

    const prompt = `You are an emergency veterinary triage assistant. CRITICAL: Always include a disclaimer that this is NOT a substitute for professional veterinary care.

PET: ${petInfo || 'unknown'}
SITUATION: ${situation}
VITAL SIGNS: ${vital_signs ? JSON.stringify(vital_signs) : 'not provided'}

Return:
1. **Triage Tier** (1=critical/ER NOW, 2=urgent <2hr, 3=same-day, 4=24-48hr, 5=monitor)
2. **Reasoning** (brief)
3. **Immediate Steps** the owner should take RIGHT NOW
4. **Warning Signs to Escalate**
5. **Items to Bring to ER** (if tier 1-2)
6. **Mandatory Disclaimer**: Reiterate that this AI tool does not replace a veterinarian.`;
    const ai = await askAI(prompt);
    res.json({
      ...ai,
      ai_triage: true,
      disclaimer: 'This is an AI-assisted triage suggestion and does NOT replace professional veterinary care. When in doubt, contact a vet immediately.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Photo regression series (additive, AI-only) -----------------
router.post('/photo-regression', aiRateLimiter, upload.single('photo'), async (req, res) => {
  if (!gateOpenRouter(res)) return;
  try {
    const { petId, body_part, prior_findings } = req.body;
    if (!req.file) return res.status(400).json({ error: 'photo required' });
    const pet = petId ? await Pet.findByPk(petId) : null;

    const imageBuffer = fs.readFileSync(req.file.path);
    const b64 = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Pet Health Monitor',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `Compare this photo (today) of body part "${body_part || 'not specified'}" to the prior findings: "${prior_findings || 'no prior findings'}". Pet: ${pet?.species || 'unknown'} ${pet?.breed || ''}. Provide: progression assessment (improved/stable/worsened), specific observed changes, and whether vet follow-up is recommended. Always include a "consult a veterinarian" disclaimer.` },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${b64}` } },
          ],
        }],
        max_tokens: 1500,
      }),
    });
    const data = await response.json();
    res.json({
      content: data.choices?.[0]?.message?.content || 'No response',
      photo_path: req.file.path,
      pet_id: petId || null,
      body_part: body_part || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Vet clinic integration (NEEDS-CREDS) ------------------------
router.get('/integrations/vet-clinic/status', async (req, res) => {
  if (!gateEnv('VETCOVE_API_KEY', res)) return;
  res.json({
    enabled: true,
    provider: 'vetcove',
    note: 'Stub: credential check only. Full EHR/EMR sync (HL7/DICOM) not implemented.',
  });
});

// ---------- Pharmacy integration (NEEDS-CREDS) --------------------------
router.get('/integrations/pharmacy/status', async (req, res) => {
  if (!gateEnv('CHEWY_API_KEY', res)) return;
  res.json({
    enabled: true,
    provider: 'chewy',
    note: 'Stub: credential check only. Order placement / refills not implemented.',
  });
});

// ---------- Wearable integration (NEEDS-CREDS) --------------------------
router.get('/integrations/wearable/status', async (req, res) => {
  if (!gateEnv('FITBARK_API_TOKEN', res)) return;
  res.json({
    enabled: true,
    provider: 'fitbark',
    note: 'Stub: credential check only. Live activity sync not implemented.',
  });
});

module.exports = router;
