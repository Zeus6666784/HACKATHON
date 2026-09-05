# CareConnect Maharashtra — Hackathon Control

**Window: 6:30 AM → 1:00 PM**

This is an execution layer only. All original PRD, architecture, API, database, AI, referral, security, design, testing, and other requirements remain unchanged.

## Golden Path — Highest Priority
Login → Patient creation → Symptoms → AI triage → Facility recommendation → Referral → Acceptance/Rejection → Reassignment if applicable → Arrival → Consultation → Diagnostics → Medication → Follow-up → Closure → Dashboard.

## Ownership
**D1 Backend:** API/server, DB, auth/RBAC, validation, referral state/events, facility ranking, follow-up/medication APIs, dashboard data, security, integration.

**D2 Frontend Core:** login, role navigation, patient creation, symptoms, triage result, facility recommendation, referral creation/tracking/timeline, acceptance/rejection/reassignment UI.

**D3 Frontend Completion:** facility dashboard, arrival, consultation, diagnostics, medication, follow-up, closure, dashboard metrics/charts, notifications, responsive/error/loading/empty states.

**D4 AI:** triage service, provider adapter, structured output, validation, safety, prompt-injection resistance, deterministic fallback, integration contract.

## Shared Rules
1. Repository + project docs are the source of truth.
2. Do not silently change API contracts, DB fields, referral states, or security behavior.
3. Backend is authoritative for business-critical decisions.
4. Reuse components; avoid duplicates.
5. Stitch is visual reference only, not architecture/business-logic source.
6. AI is decision support, not diagnosis/prescription.
7. Never expose secrets in frontend.
8. Do not fake backend success with frontend-only state.
9. Test the golden path continuously.
10. Report conflicts instead of silently inventing solutions.

## Timeline
**6:30–7:00:** inspect, synchronize, confirm contracts, environments.  
**7:00–8:30:** backend/frontend/AI foundations in parallel.  
**8:30–9:30:** Patient → AI → Facility → Referral.  
**9:30–10:30:** Acceptance → Arrival → Consultation → Diagnostics → Follow-up → Closure; test rejection/reassignment.  
**10:30–11:00:** integration freeze; remove critical mocks; golden-path test.  
**11:00–12:00:** deployment + debugging.  
**12:00–12:30:** clean full demo test.  
**12:30–1:00:** high-impact fixes, fallback/demo/deployment verification.

## Before Golden Path
Do not delay core functionality for decorative animation, advanced offline sync, unnecessary abstraction, elaborate notification infrastructure, advanced analytics, nonessential map polish, large refactors, or nonessential AI features.

## Checkpoints
1. Backend + DB + auth.
2. AI triage + fallback.
3. Patient → Triage → Ranking → Referral.
4. Acceptance/Rejection/Reassignment.
5. Arrival → Consultation → Diagnostics → Follow-up → Closure.
6. Dashboard.
7. Deployment.
8. Full golden-path demo.

## Merge Discipline
Inspect before changing shared files, coordinate ownership, avoid unrelated refactors, and keep shared contracts stable.

## Success
The judge must clearly see that CareConnect does not merely recommend a facility; it makes the patient's referral journey visible, actionable, trackable, and measurable until closure.
