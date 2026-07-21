BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'pet_owner';

CREATE TABLE IF NOT EXISTS pet_care_cases (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  case_ref TEXT NOT NULL,
  pet_ref TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'observed' CHECK (stage IN ('observed','validated','triaged','clinician_review','plan_approved','follow_up','resolved','corrected','deleted')),
  summary TEXT NOT NULL,
  uncertainty JSONB NOT NULL,
  created_by TEXT NOT NULL,
  clinician_owner TEXT,
  follow_up_at TIMESTAMPTZ,
  idempotency_key TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, case_ref),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS pet_observations (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT NOT NULL REFERENCES pet_care_cases(id),
  observation_ref TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  source_version TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  confidence NUMERIC(7,6) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  consent_reference TEXT NOT NULL,
  value JSONB NOT NULL,
  checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, observation_ref, source_version)
);

CREATE TABLE IF NOT EXISTS pet_clinical_evidence (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT NOT NULL REFERENCES pet_care_cases(id),
  terminology_version TEXT NOT NULL,
  contraindications JSONB NOT NULL DEFAULT '[]'::jsonb,
  allergy_conflicts JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  calibration NUMERIC(7,6) NOT NULL CHECK (calibration >= 0 AND calibration <= 1),
  blocked BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_integration_deliveries (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  standard TEXT NOT NULL,
  operation TEXT NOT NULL,
  consent_reference TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_digest TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','failed','reconciled')),
  provider_receipt TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, provider, idempotency_key)
);

CREATE TABLE IF NOT EXISTS pet_clinical_evaluations (
  id BIGSERIAL PRIMARY KEY,
  corpus_version TEXT NOT NULL,
  model_version TEXT NOT NULL,
  species_cohort TEXT NOT NULL,
  accuracy NUMERIC(7,6),
  calibration NUMERIC(7,6),
  escalation_recall NUMERIC(7,6),
  bias_gap NUMERIC(7,6),
  missing_data_case BOOLEAN NOT NULL DEFAULT FALSE,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_care_audit (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  case_id BIGINT NOT NULL REFERENCES pet_care_cases(id),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, correlation_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_cases_tenant_stage ON pet_care_cases (tenant_id, pet_ref, stage, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_observations_case_time ON pet_observations (case_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_integrations_retry ON pet_integration_deliveries (status, next_attempt_at);

CREATE OR REPLACE FUNCTION reject_pet_care_audit_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'pet_care_audit is append-only';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'pet_care_audit_append_only') THEN
    CREATE TRIGGER pet_care_audit_append_only
      BEFORE UPDATE OR DELETE ON pet_care_audit
      FOR EACH ROW EXECUTE FUNCTION reject_pet_care_audit_mutation();
  END IF;
END;
$$;

COMMIT;
