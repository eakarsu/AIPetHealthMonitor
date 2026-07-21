# Pet Health Monitor operations

## Safe local lifecycle

1. Copy `.env.example` to `.env` and set a unique JWT secret of at least 32 characters plus the database URL.
2. Install backend and frontend dependencies explicitly during provisioning.
3. Apply reviewed migrations explicitly with `./scripts/migrate.sh`.
4. Start with `./start.sh`. The launcher refuses occupied ports and missing dependencies; it never installs packages, creates databases, seeds data, applies migrations, or terminates unrelated processes.

Startup performs connection/schema checks only and fails closed when required configuration or durable schema is missing.

## Narrow workflow

`POST /api/pet-care-workflows/cases` persists consented versioned observations and clinician-visible uncertainty; transitions record triage, clinician approval, follow-up, resolution, correction, and deletion.

Owners are tenant-scoped to their pets. Care-plan approval, resolution, and deletion require veterinarian/clinic authority; the workflow remains explicitly non-diagnostic. Every write is tenant-scoped, idempotency/correlation keyed, version checked, and appended to a database audit table protected against update/delete.

## External boundaries

Generated `/api/cf-*` and `/api/gap-*` routes are quarantined where present. Veterinary EHR/FHIR, lab, imaging, device, pharmacy, scheduling, and payer credentials; clinical validation; clinician governance; and jurisdictional review remain deployment gates. Provider failures must remain explicit and must not be replaced with fabricated success receipts.

## Validation

Run `node --test backend/test/petCarePolicy.test.cjs`, syntax-check changed JavaScript with `node --check`, and run `bash -n start.sh scripts/migrate.sh`. CI performs these dependency-free checks and verifies that migrations are transactional and contain no table-drop, truncate, or row-delete statements.

