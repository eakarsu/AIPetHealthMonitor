const test = require('node:test');
const assert = require('node:assert/strict');
const { validateObservation, clinicalGate, validateTransition } = require('../src/domain/petCarePolicy');

const observation = { pet_ref: 'pet-1', observation_ref: 'obs-1', source_ref: 'device-1', source_version: 'v3', recorded_at: '2026-07-18T12:00:00Z', consent_reference: 'consent-4', confidence: 0.92 };

test('normalizes validated pet observations with uncertainty', () => {
  const result = validateObservation(observation);
  assert.equal(result.uncertain, false);
  assert.equal(result.recorded_at, '2026-07-18T12:00:00.000Z');
});

test('marks lower-confidence observations uncertain', () => {
  assert.equal(validateObservation({ ...observation, confidence: 0.6 }).uncertain, true);
});

test('fails closed on missing consent or provenance', () => {
  assert.throws(() => validateObservation({ ...observation, consent_reference: '' }), /consent_reference is required/);
});

test('clinical gate blocks contraindications and low calibration', () => {
  assert.equal(clinicalGate({ contraindications: ['drug-x'], allergy_conflicts: [], missing_fields: [], calibration: 0.99 }).blocked, true);
  assert.equal(clinicalGate({ contraindications: [], allergy_conflicts: [], missing_fields: [], calibration: 0.89 }).blocked, true);
});

test('requires independent veterinarian approval of unblocked evidence', () => {
  assert.throws(() => validateTransition('clinician_review', 'plan_approved', { role: 'veterinarian', actorId: 'v1', createdBy: 'v1', explanation: 'reviewed', clinicalBlocked: false }), /independent/);
  assert.equal(validateTransition('clinician_review', 'plan_approved', { role: 'veterinarian', actorId: 'v2', createdBy: 'v1', explanation: 'reviewed', clinicalBlocked: false }), true);
});

test('deletion requires clinician authority and propagated receipts', () => {
  assert.throws(() => validateTransition('resolved', 'deleted', { role: 'pet_owner', deletionReceipts: ['x'] }), /clinician authority/);
  assert.throws(() => validateTransition('resolved', 'deleted', { role: 'veterinarian' }), /deletion receipts/);
});
