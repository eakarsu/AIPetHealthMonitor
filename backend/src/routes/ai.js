const express = require('express');
const auth = require('../middleware/auth');
const { askAI } = require('../services/aiService');
const { Pet, Symptom, HealthRecord, BehaviorLog, NutritionPlan, WeightLog, Activity, HealthReport } = require('../models');
const router = express.Router();

router.use(auth);

// AI Symptom Checker
router.post('/symptom-check', async (req, res) => {
  try {
    const { petId, symptoms, severity, duration } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Analyze these symptoms for a ${pet.age} year old ${pet.breed} ${pet.species} named ${pet.name} (weight: ${pet.weight} lbs):

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

    // Save symptom record
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

// AI Diet Recommendations
router.post('/diet-recommendation', async (req, res) => {
  try {
    const { petId, concerns, currentDiet, allergies } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Create a detailed nutrition plan for a ${pet.age} year old ${pet.breed} ${pet.species} named ${pet.name} (weight: ${pet.weight} lbs):

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
router.post('/behavior-analysis', async (req, res) => {
  try {
    const { petId, behavior, context, frequency } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const recentBehaviors = await BehaviorLog.findAll({
      where: { petId }, limit: 10, order: [['date', 'DESC']]
    });

    const prompt = `Analyze this behavior for a ${pet.age} year old ${pet.breed} ${pet.species} named ${pet.name}:

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
router.post('/health-report', async (req, res) => {
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

    const prompt = `Generate a comprehensive health report for ${pet.name}, a ${pet.age} year old ${pet.breed} ${pet.species} (weight: ${pet.weight} lbs):

Recent Health Records: ${healthRecords.map(h => `${h.type}: ${h.description} (${h.date})`).join('; ') || 'None'}
Weight History: ${weightLogs.map(w => `${w.weight} ${w.unit} (${w.date})`).join(', ') || 'None'}
Recent Activities: ${activities.map(a => `${a.type}: ${a.duration}min ${a.intensity} (${a.date})`).join('; ') || 'None'}
Recent Symptoms: ${symptoms.map(s => `${s.symptom} (${s.severity}) on ${s.date}`).join('; ') || 'None'}

Please provide:
1. **Overall Health Score** - Rate 1-100
2. **Health Summary** - Overall assessment
3. **Weight Analysis** - Weight trend and recommendations
4. **Activity Assessment** - Exercise levels and suggestions
5. **Risk Factors** - Any health risks based on breed, age, history
6. **Preventive Care** - Recommended screenings and checkups
7. **Wellness Goals** - Specific health goals for the next 3 months
8. **Action Items** - Priority items for the pet owner`;

    const aiResponse = await askAI(prompt);

    if (!aiResponse.error) {
      await HealthReport.create({
        petId, reportType: 'Comprehensive Health Report',
        generatedDate: new Date().toISOString().split('T')[0],
        summary: aiResponse.content?.substring(0, 500),
        details: aiResponse.content,
        recommendations: 'See full report',
        riskLevel: 'low', aiGenerated: true
      });
    }

    res.json(aiResponse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Emergency Advice
router.post('/emergency-advice', async (req, res) => {
  try {
    const { petId, situation, severity } = req.body;
    const pet = await Pet.findByPk(petId);

    const prompt = `URGENT PET EMERGENCY ADVICE:

Pet: ${pet ? `${pet.name}, ${pet.age} year old ${pet.breed} ${pet.species}, ${pet.weight} lbs` : 'Unknown pet'}
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
router.post('/insurance-advice', async (req, res) => {
  try {
    const { petId, budget, concerns } = req.body;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const prompt = `Recommend pet insurance for ${pet.name}, a ${pet.age} year old ${pet.breed} ${pet.species} (weight: ${pet.weight} lbs):

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

module.exports = router;
