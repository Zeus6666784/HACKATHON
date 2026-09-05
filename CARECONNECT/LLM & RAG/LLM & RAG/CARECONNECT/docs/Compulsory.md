# Compulsory Requirements - CareConnect Maharashtra

This document serves as the final project gate and implementation contract. The project cannot be considered "complete" until every item in this list is verified and functional.

## A. Project Integrity
- [ ] **Tech Stack**: Strictly use MERN (MongoDB, Express, React, Node).
- [ ] **Architecture**: Maintain strict client/server separation.
- [ ] **Documentation**: All docs (`PRD`, `Architecture`, `Rules`, `Memory`, etc.) are synchronized with the code.
- [ ] **VCS**: Use Git for all changes.
- [ ] **Secrets**: Zero secrets in source control; all handled via environment variables.

## B. Core Functionality
- [ ] **Authentication**: Secure login/signup with JWT and `bcrypt`.
- [ ] **RBAC**: Functional Role-Based Access Control for all roles.
- [ ] **Patient Workflow**: Full lifecycle from registration to closure.
- [ ] **AI-Assisted Triage**: Functional triage with structured AI output.
- [ ] **Facility Recommendation**: Ranking based on capabilities and distance.
- [ ] **Emergency Ranking**: Priority-based ranking for critical cases.
- [ ] **Normal Ranking**: Standard ranking for non-critical cases.
- [ ] **Facility Acceptance**: Facility can accept a referral.
- [ ] **Facility Rejection**: Facility can reject with a mandatory reason.
- [ ] **Referral Reassignment**: Ability to send to another facility after rejection.
- [ ] **Referral Timeline**: Visual or list-based history of referral events.
- [ ] **Referral Events**: Every state change is recorded.
- [ ] **Patient Arrival**: Facility marks patient as arrived.
- [ ] **Consultation Status**: Tracking the clinical consultation.
- [ ] **Diagnostics Status**: Tracking required tests/results.
- [ ] **Follow-up**: Tracking post-consultation care.
- [ ] **Medication Reminders**: Based on clinician instructions.
- [ ] **Referral Closure**: Formal closure with recorded outcome.
- [ ] **Dashboard**: Real-time metrics for administrators and facilities.
- [ ] **Audit Logging**: Immutable log of all sensitive actions.
- [ ] **Error Handling**: Global error handler with safe production messages.

## C. Referral Integrity
A referral must:
- [ ] Have a unique, immutable ID.
- [ ] Follow valid state transitions (No skipping).
- [ ] Record source and destination facilities.
- [ ] Record priority and required service.
- [ ] Maintain a complete event history.
- [ ] Support acceptance, rejection, and reassignment.
- [ ] Handle overdue or "lost-to-follow-up" cases.
- [ ] Reach a final, verified closure state.

## D. AI Safety
- [ ] **Structured Output**: AI returns validated JSON.
- [ ] **Validation**: AI output is checked via `Zod` before use.
- [ ] **No Diagnosis**: AI never outputs a confirmed disease.
- [ ] **No Prescription**: AI never suggests medication or dosages.
- [ ] **No Direct Authority**: AI cannot authorize actions or change medication plans.
- [ ] **Fallback**: Deterministic rule-based triage if AI fails.
- [ ] **Reasoning**: AI explains its priority recommendation.
- [ ] **Uncertainty**: AI communicates uncertainty where applicable.

## E. Facility Data
- [ ] **Source Tracking**: Every facility record preserves its data source.
- [ ] **Verification**: Every facility has a state (`VERIFIED`, `UNVERIFIED`, etc.).
- [ ] **Coordinates**: Coordinate source is recorded.
- [ ] **Freshness**: Last verified date is recorded where applicable.
- [ ] **No Fabrication**: Zero fabricated data for real-world facilities.

## F. Security
- [ ] **Hashing**: `bcrypt` used for all passwords.
- [ ] **JWT**: Secure implementation with appropriate expiry.
- [ ] **RBAC**: Server-side authorization for all API endpoints.
- [ ] **Input Validation**: `Zod` used for all request bodies.
- [ ] **Rate Limiting**: Protection against brute-force/DoS.
- [ ] **Security Headers**: `Helmet` configured.
- [ ] **Safe CORS**: Restricted to authorized domains.
- [ ] **Secrets**: `.env` used; no secrets in frontend.
- [ ] **Audit Logs**: Functional audit trail for critical events.
- [ ] **Safe Errors**: No stack traces in production.
- [ ] **Demo Data**: Zero real patient data in the demo.

## G. UX
- [ ] **Responsive**: Fully functional on mobile and desktop.
- [ ] **Loading/Error States**: Clear feedback for all async operations.
- [ ] **Empty States**: Graceful handling of no-data views.
- [ ] **Success States**: Clear confirmation of actions.
- [ ] **Accessibility**: Accessible forms and high-contrast UI.
- [ ] **Status Visibility**: Clear display of referral status and priority.
- [ ] **AI Transparency**: Clear explanation of why a facility was recommended.

## H. Data and Demo
- [ ] **Data Distinction**: Verified vs. Synthetic vs. Unknown data is clearly marked.
- [ ] **Reproducibility**: The main demo scenario is fully reproducible.

## I. Testing
Compulsory tests must cover:
- [ ] Authentication & RBAC.
- [ ] Patient access control.
- [ ] Referral creation and state transitions.
- [ ] Facility ranking (Emergency vs. Normal).
- [ ] Acceptance, Rejection, and Reassignment.
- [ ] AI output validation and fallback.
- [ ] Follow-up and Medication reminders.
- [ ] Dashboard calculations.
- [ ] Security controls (IDOR, Role Escalation).
- [ ] Full End-to-End workflow.

## J. Deployment
- [ ] **Build**: Production build succeeds without errors.
- [ ] **Env Vars**: All production secrets configured.
- [ ] **Connectivity**: Client $\rightarrow$ Server $\rightarrow$ MongoDB connectivity verified.
- [ ] **CORS**: Correctly configured for production domain.
- [ ] **Clean Build**: No development backdoors or debug routes.

## K. Final End-to-End Acceptance Tests

### Scenario 1: The Happy Path
`Login` $\rightarrow$ `Create Patient` $\rightarrow$ `Enter Symptoms` $\rightarrow$ `AI Triage` $\rightarrow$ `Facility Recommendation` $\rightarrow$ `Referral Creation` $\rightarrow$ `Facility Acceptance` $\rightarrow$ `Patient Arrival` $\rightarrow$ `Consultation` $\rightarrow$ `Diagnostics` $\rightarrow$ `Follow-up` $\rightarrow$ `Medication Reminder` $\rightarrow$ `Follow-up Completion` $\rightarrow$ `Referral Closure` $\rightarrow$ `Dashboard Update`.

### Scenario 2: The Rejection Path
`Referral Creation` $\rightarrow$ `Facility Rejection` $\rightarrow$ `Re-ranking` $\rightarrow$ `Alternative Facility` $\rightarrow$ `Reassignment` $\rightarrow$ `Acceptance` $\rightarrow$ `Continued Journey`.

**Requirement**: Neither scenario may require manual database manipulation.

---

## CODING AGENT MODEL

The primary coding agent uses:
- **Model**: Gemma 4 31B (Ollama Cloud)
- **Workflow**: Read Docs $\rightarrow$ Inspect Code $\rightarrow$ Targeted Change $\rightarrow$ Test $\rightarrow$ Update Memory.
- **Source of Truth**: Git Repository $\rightarrow$ Project Docs $\rightarrow$ AI Knowledge.

## DESIGN WORKFLOW

**Stitch** is used for visual design and UI concepts.
- **NOT the source of truth** for: Architecture, DB, API, Security, Business Logic, AI Logic.
- **Source of Truth**: GitHub Repository + Project Documentation + Actual Code.
- **Translation**: Stitch designs $\rightarrow$ React + TS + Tailwind inside `client/`.
- **Adaptation**: Designs must be adapted to the existing architecture, not vice versa.

## COMPLETE DEVELOPMENT PIPELINE

`EXPLAINED.md`
$\downarrow$
`PRD + Architecture + Rules + Feature MDs`
$\downarrow$
`Stitch` $\rightarrow$ UI/UX design
$\downarrow$
`Gemma 4 31B` $\rightarrow$ implementation
$\downarrow$
`React/Vite client` + `Node/Express server` + `MongoDB`
$\downarrow$
`Testing`
$\downarrow$
`Security validation`
$\downarrow$
`Deployment`
$\downarrow$
`Final end-to-end validation`
$\downarrow$
`Railway deployment`

**Responsibilities**:
- **Design Tool (Stitch)**: Visuals and UX.
- **Coding Model (Gemma 4)**: Implementation and logic.
- **Source Code**: The definitive implementation.
- **Database**: Persistent state.
- **Tests**: Correctness and regression.
- **Deployment**: Availability and environment.
