const express = require('express');
const sequelize = require('../config/database');
const { Pet } = require('../models');
const { validateObservation, validateTransition } = require('../domain/petCarePolicy');

const router = express.Router();
const tenantFor = (user) => String(user.tenant_id || user.tenantId || user.id);
const actorFor = (user) => String(user.id);

router.post('/cases', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const observation = validateObservation(req.body?.observation || {});
    const { case_ref, summary, idempotency_key, correlation_id } = req.body || {};
    if (!case_ref || !summary || !idempotency_key || !correlation_id) throw new Error('case_ref, summary, idempotency_key, and correlation_id are required');
    const tenantId = tenantFor(req.user);
    const actorId = actorFor(req.user);
    if (!['veterinarian', 'clinic_admin', 'admin'].includes(req.user.role)) {
      const pet = await Pet.findOne({ where: { id: observation.pet_ref, userId: req.user.id }, transaction });
      if (!pet) throw Object.assign(new Error('pet not found for authenticated owner'), { status: 404 });
    }
    let [rows] = await sequelize.query(
      `INSERT INTO pet_care_cases
       (tenant_id, case_ref, pet_ref, summary, uncertainty, created_by, idempotency_key)
       VALUES (:tenantId,:caseRef,:petRef,:summary,:uncertainty,:actorId,:idempotencyKey)
       ON CONFLICT (tenant_id, idempotency_key) DO NOTHING RETURNING *`,
      { replacements: { tenantId, caseRef: case_ref, petRef: observation.pet_ref, summary, uncertainty: JSON.stringify({ confidence: observation.confidence, uncertain: observation.uncertain }), actorId, idempotencyKey: idempotency_key }, transaction }
    );
    const inserted = rows.length === 1;
    if (!inserted) [rows] = await sequelize.query('SELECT * FROM pet_care_cases WHERE tenant_id=:tenantId AND idempotency_key=:idempotencyKey', { replacements: { tenantId, idempotencyKey: idempotency_key }, transaction });
    const careCase = rows[0];
    if (inserted) {
      await sequelize.query(
        `INSERT INTO pet_observations
         (case_id, observation_ref, source_ref, source_version, recorded_at, confidence, consent_reference, value, checksum)
         VALUES (:caseId,:observationRef,:sourceRef,:sourceVersion,:recordedAt,:confidence,:consentReference,:value,:checksum)`,
        { replacements: { caseId: careCase.id, observationRef: observation.observation_ref, sourceRef: observation.source_ref, sourceVersion: observation.source_version, recordedAt: observation.recorded_at, confidence: observation.confidence, consentReference: observation.consent_reference, value: JSON.stringify(req.body.observation.value || {}), checksum: req.body.observation.checksum || observation.observation_ref }, transaction }
      );
    }
    await sequelize.query(
      `INSERT INTO pet_care_audit (tenant_id, case_id, actor_id, action, to_stage, evidence, correlation_id)
       VALUES (:tenantId,:caseId,:actorId,'observed','observed',:evidence,:correlationId)
       ON CONFLICT (tenant_id, correlation_id) DO NOTHING`,
      { replacements: { tenantId, caseId: careCase.id, actorId, evidence: JSON.stringify({ observation_ref: observation.observation_ref, uncertain: observation.uncertain }), correlationId: correlation_id }, transaction }
    );
    await transaction.commit();
    res.status(inserted ? 201 : 200).json(careCase);
  } catch (error) {
    await transaction.rollback();
    res.status(error.status || (error.parent?.code === '23505' ? 409 : 400)).json({ error: error.message });
  }
});

router.post('/cases/:caseRef/transition', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = tenantFor(req.user);
    const actorId = actorFor(req.user);
    const { to_stage, expected_version, correlation_id, evidence = {} } = req.body || {};
    if (!to_stage || !Number.isInteger(expected_version) || !correlation_id) throw new Error('to_stage, integer expected_version, and correlation_id are required');
    let [prior] = await sequelize.query('SELECT case_id FROM pet_care_audit WHERE tenant_id=:tenantId AND correlation_id=:correlationId', { replacements: { tenantId, correlationId: correlation_id }, transaction });
    if (prior.length) {
      const [existing] = await sequelize.query('SELECT * FROM pet_care_cases WHERE id=:id', { replacements: { id: prior[0].case_id }, transaction });
      await transaction.commit();
      return res.json(existing[0]);
    }
    const [current] = await sequelize.query('SELECT * FROM pet_care_cases WHERE tenant_id=:tenantId AND case_ref=:caseRef FOR UPDATE', { replacements: { tenantId, caseRef: req.params.caseRef }, transaction });
    if (!current.length) throw Object.assign(new Error('pet care case not found'), { status: 404 });
    const careCase = current[0];
    if (careCase.version !== expected_version) throw Object.assign(new Error('stale workflow version'), { status: 409 });
    validateTransition(careCase.stage, to_stage, { ...evidence, role: req.user.role, actorId, createdBy: careCase.created_by });
    const [updated] = await sequelize.query(
      `UPDATE pet_care_cases SET stage=:toStage, clinician_owner=COALESCE(:clinicianOwner,clinician_owner), follow_up_at=COALESCE(:followUpAt,follow_up_at), version=version+1, updated_at=NOW()
       WHERE id=:id RETURNING *`,
      { replacements: { toStage: to_stage, clinicianOwner: evidence.clinicianOwner || null, followUpAt: evidence.followUpAt || null, id: careCase.id }, transaction }
    );
    await sequelize.query(
      `INSERT INTO pet_care_audit (tenant_id, case_id, actor_id, action, from_stage, to_stage, evidence, correlation_id)
       VALUES (:tenantId,:caseId,:actorId,'transition',:fromStage,:toStage,:evidence,:correlationId)`,
      { replacements: { tenantId, caseId: careCase.id, actorId, fromStage: careCase.stage, toStage: to_stage, evidence: JSON.stringify(evidence), correlationId: correlation_id }, transaction }
    );
    await transaction.commit();
    res.json(updated[0]);
  } catch (error) {
    await transaction.rollback();
    res.status(error.status || 400).json({ error: error.message });
  }
});

module.exports = router;
