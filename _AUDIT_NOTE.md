# Audit Note — AIPetHealthMonitor

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_06.md` section #20.

## Original Recommendations

### Gaps — AI Counterparts
- `/genetic-disease-risk` — breed-predisposition analysis
- `/health-trend-detect` — flag chronic issues developing

### Gaps — Non-AI Features
- No vet-clinic integration (medical record import, appointment booking)
- Missing pharmacy integration
- No breed database
- Limited community features

### Custom Feature Suggestions
1. Agentic wellness monitoring (continuous wearable-tracked vitals)
2. Photo-based health screening
3. Emergency decision support
4. Breed/age-specific care automation
5. Veterinary cost negotiation

## Implemented (Mechanical)
- `POST /api/ai/genetic-disease-risk` — added in `backend/src/routes/ai.js`. Pulls pet record and prompts the model for breed-predisposed conditions, recommended screenings, and overall risk level.
- `POST /api/ai/health-trend-detect` — added in `backend/src/routes/ai.js`. Joins HealthRecord/WeightLog/Symptom/LabResult history and asks for emerging trends, recurring symptoms, and follow-up suggestions.

Both follow existing `askAI` + `aiRateLimiter` + `auth` patterns.

## Backlog (deferred)

### NEEDS-CREDS / NEW-DEPS
- Vet clinic integration (need EHR/EMR API selection — DICOM, HL7, Vetcove).
- Pharmacy integration (Chewy, Allivet — credentials).
- Wearable integration (FitBark, Whistle — OAuth + new SDK).

### NEEDS-PRODUCT-DECISION
- Community/peer-support area (privacy and moderation policy).
- Vet cost negotiation — requires pricing dataset and policy stance.

### TOO-RISKY (substantial new code)
- Agentic wellness monitor (cron + alert routing).
- Photo regression series (need image storage strategy across visits).
- Emergency decision support that automatically routes to ER vs. wait — liability concerns.

## Apply pass 3 (frontend)

- Frontend stack: React (CRA). Both apply-pass-2 endpoints (`/genetic-disease-risk`, `/health-trend-detect`) already routed in `App.js` to a shared `AIPredictivePage` component (with `type="genetic"` / `type="trends"`).
- Action: **LEFT-AS-IS** — FE already wired. No files changed.
