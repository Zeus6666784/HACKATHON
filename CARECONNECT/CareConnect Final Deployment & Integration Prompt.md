# CARECONNECT — FINAL DEPLOYMENT, INTEGRATION & PRODUCTION-READINESS PROMPT

You are the **Lead Full-Stack Engineer, Integration Engineer, QA Engineer, Security Reviewer, and Deployment Engineer** for the CareConnect Maharashtra hackathon project.

The project has already been restructured into a clean deployment-oriented repository.

Your task is **NOT to rebuild CareConnect from scratch**.

Your task is to **inspect the entire existing repository, understand the current implementation, identify every integration/build/runtime problem, fix them, and make the project actually runnable and deployable end-to-end.**

---

# 1. SOURCE OF TRUTH

Before changing anything, inspect the complete repository.

Read:

- `README.md`
- `RESTRUCTURE.md`
- `DEPLOYMENT.md`
- all files under `docs/`
- frontend source
- backend source
- models
- routes
- controllers
- services
- AI/RAG implementation
- authentication
- database configuration
- environment configuration
- Docker configuration
- package files
- existing tests
- existing demo/offline logic

Do NOT assume that a feature is complete merely because documentation says it exists.

Verify the actual implementation.

The existing project implementation is the primary source of truth.

Do not silently remove existing functionality.

Do not replace working functionality with a new architecture unless absolutely necessary.

If documentation and implementation conflict:

1. Identify the conflict.
2. Prefer the actual intended project architecture and compulsory requirements.
3. Preserve the canonical CareConnect terminology.
4. Do not silently change API contracts or database structures.
5. Document important conflicts and resolutions.

---

# 2. CORE PRODUCT GOAL

CareConnect is a **referral-continuity platform for rural healthcare in Maharashtra**.

The system must not stop at:

> "Recommend a hospital."

The complete product journey is:

```text
Login
↓
Patient Creation
↓
Symptom Input
↓
AI Triage
↓
Facility Recommendation / Ranking
↓
Referral Creation
↓
Referral Sent
↓
Facility Accept / Reject
↓
Reassignment if Required
↓
Patient Arrival
↓
Consultation
↓
Diagnostics
↓
Diagnostic Completion
↓
Medication / Medication Reminder
↓
Follow-up Required
↓
Follow-up Completion
↓
Referral Closure
↓
Dashboard / Closure Rate / Overdue Tracking
```

This is the **golden path**.

Make this path work with real backend persistence.

---

# 3. FIRST TASK — FULL PROJECT AUDIT

Before modifying code, produce an internal audit.

Check:

### Frontend

- Does it compile?
- Are imports valid?
- Are routes valid?
- Are API URLs configurable?
- Are environment variables correctly used?
- Are TypeScript errors present?
- Are components connected to real APIs?
- Are loading states present?
- Are error states present?
- Are empty states present?
- Are disabled states present?
- Are successful actions based on backend confirmation?
- Are any fake/demo records silently used?
- Are any API calls pointing to obsolete endpoints?
- Are there hard-coded referral statuses?
- Is the referral timeline generated from actual events?
- Are dashboard statistics real backend data?
- Are mobile layouts usable?

### Backend

Check:

- Server startup
- MongoDB connection
- Environment variables
- Authentication
- JWT handling
- Password hashing
- RBAC
- CORS
- Helmet
- Rate limiting
- Request validation
- Error handling
- API routes
- Controllers/services
- Database models
- Referral state transitions
- Referral events
- Facility ranking
- AI triage
- AI fallback
- Audit/security behavior
- Notification behavior
- Dashboard statistics

### Integration

Verify every:

```text
Frontend request
↓
API route
↓
Controller/service
↓
Database/service
↓
Response
↓
Frontend state update
```

Do not assume compatibility.

Test it.

---

# 4. BUILD VALIDATION

Run the real build commands.

Backend:

```bash
npm install
npm run build
```

Frontend:

```bash
npm install
npm run build
```

Root:

```bash
npm install
npm run install:all
npm run build
```

Fix every build-breaking issue.

Do not suppress TypeScript errors merely to make the build pass.

Do not use:

```text
any
@ts-ignore
@ts-nocheck
```

unless there is a documented and unavoidable reason.

---

# 5. LOCAL DEVELOPMENT

Make this work:

```bash
npm install
npm run install:all
npm run dev
```

Expected:

```text
Frontend → localhost:5173
Backend  → localhost:5000
MongoDB  → configured MongoDB instance
```

Health endpoint:

```text
GET /health
```

must return a successful response.

---

# 6. ENVIRONMENT CONFIGURATION

Review every environment variable.

There must be no hard-coded:

- MongoDB credentials
- JWT secrets
- LLM API keys
- production URLs
- database passwords
- private credentials

Frontend may only receive public configuration such as:

```text
VITE_API_URL
```

LLM/API secrets must remain server-side.

Ensure:

```text
server/.env
```

is ignored by Git.

Only:

```text
server/.env.example
```

should be committed.

---

# 7. AUTHENTICATION

Verify:

```text
Signup
Login
Logout
Session
JWT
Password hashing
Role handling
Authorization
```

Roles must remain consistent with the existing project.

Do not invent new roles.

Every protected backend endpoint must verify authentication.

Every role-sensitive endpoint must verify authorization.

Prevent:

- IDOR
- unauthorized referral modification
- unauthorized patient access
- unauthorized facility actions
- privilege escalation

---

# 8. PATIENT FLOW

Verify that an authorized healthcare worker/doctor can:

1. Create a patient.
2. View patient information.
3. Start a clinical/referral journey.
4. Submit symptoms.
5. Run triage.
6. Continue to facility selection.

Patient data must persist in MongoDB.

Do not use fake frontend-only persistence for the real golden path.

---

# 9. AI TRIAGE

The existing AI architecture must be preserved.

Expected pipeline:

```text
Frontend
↓
POST /api/v1/triage/assess
↓
Backend
↓
AI service
↓
Provider adapter
↓
LLM
↓
JSON parsing
↓
Schema validation
↓
Safety validation
↓
Safe result
↓
Frontend
```

Expected output:

```text
priority
suggested_care_level
relevant_services
reasoning
recommended_next_action
caution
```

Priority:

```text
HIGH
MEDIUM
LOW
```

Care level:

```text
PHC
DISTRICT
TERTIARY
```

AI must NOT:

- diagnose
- prescribe
- modify medication
- authorize referrals
- override clinicians
- claim certainty
- make autonomous clinical decisions

The system must clearly communicate that AI output is decision support.

---

# 10. AI FAILURE FALLBACK

This is compulsory.

If the AI provider:

- times out
- fails
- returns invalid JSON
- returns invalid schema
- produces unsafe output
- is unavailable
- has no configured API key

the backend must provide a deterministic safe fallback.

The frontend must still receive a valid response.

Never show:

```text
undefined
null
NaN
raw stack trace
provider exception
API key error
```

to the user.

---

# 11. FACILITY RANKING

Verify the existing deterministic facility-ranking implementation.

Ranking must be backend-authoritative.

Consider the factors already defined by the project, such as:

- care level
- services
- specialist availability
- emergency capability
- verification state
- distance/location
- other documented project ranking factors

Do not invent an unrelated ranking algorithm.

Facility verification states must remain distinguishable:

```text
VERIFIED
UNVERIFIED
UNKNOWN
SYNTHETIC
```

UNKNOWN must never visually appear as verified availability.

---

# 12. REFERRAL STATE MACHINE

The canonical referral states are:

```text
CREATED
TRIAGED
FACILITY_SELECTED
REFERRAL_SENT
REFERRAL_ACCEPTED
REFERRAL_REJECTED
PATIENT_ARRIVED
CONSULTATION_COMPLETED
DIAGNOSTIC_PENDING
DIAGNOSTIC_COMPLETED
FOLLOW_UP_REQUIRED
FOLLOW_UP_COMPLETED
OVERDUE
LOST_TO_FOLLOWUP
CANCELLED
CLOSED
```

Do NOT rename them.

Do NOT create frontend-only alternative versions.

Every state transition must be validated by the backend.

For every transition:

1. Validate current state.
2. Validate target state.
3. Validate user role.
4. Validate input.
5. Update referral.
6. Create ReferralEvent.
7. Create audit information where required.
8. Trigger notification where required.
9. Return confirmed backend state.

Illegal transitions must return a safe error.

---

# 13. REFERRAL TIMELINE

The timeline must be generated from actual:

```text
ReferralEvent
```

records.

Do not hard-code:

```text
Referral created
Accepted
Arrived
Completed
```

into the UI.

The UI should reflect the actual database history.

---

# 14. FACILITY ACTIONS

Verify that facility staff can:

```text
View incoming referral
↓
Accept
OR
Reject
↓
Provide required reason where applicable
```

If rejected:

```text
Referral Rejected
↓
Reassignment
↓
New Facility
↓
Referral Sent
```

must remain traceable.

Do not delete the old referral history.

---

# 15. PATIENT ARRIVAL

Implement/verify:

```text
REFERRAL_ACCEPTED
↓
PATIENT_ARRIVED
```

Only authorized facility-side users should perform the arrival action.

The event must be persisted.

---

# 16. CONSULTATION

Verify that consultation data is persisted.

Consultation completion must update the referral lifecycle correctly.

Do not allow the frontend to mark consultation complete without backend confirmation.

---

# 17. DIAGNOSTICS

Verify:

```text
Diagnostic pending
↓
Diagnostic completed
```

Diagnostics must be associated with the correct patient/referral.

The UI must clearly show:

```text
PENDING
COMPLETED
```

and appropriate empty/error states.

---

# 18. MEDICATION

Medication functionality must remain clinician-controlled.

The system must NOT allow AI to prescribe medication.

The application may:

- display clinician-provided medication
- display dosage/instructions entered by authorized staff
- display medication reminders
- track reminder status

Do not create an AI prescribing system.

---

# 19. FOLLOW-UP

Verify the full lifecycle:

```text
FOLLOW_UP_REQUIRED
↓
Upcoming
↓
Due
↓
Completed
```

and:

```text
Missed
↓
Overdue
↓
LOST_TO_FOLLOWUP
```

where supported by the existing implementation.

Follow-up status must be persisted.

---

# 20. CLOSURE

The most important product completion condition is:

```text
FOLLOW_UP_COMPLETED
↓
CLOSED
```

or the appropriate documented closure path.

The referral must have a final backend state.

The frontend must not display:

```text
Closed
```

until the backend confirms it.

---

# 21. DASHBOARD

Dashboard metrics must come from backend data.

Verify:

- total referrals
- active referrals
- accepted referrals
- rejected referrals
- overdue referrals
- follow-up completion
- closed referrals
- closure rate

Do not hard-code metrics.

Do not calculate authoritative metrics only in the frontend if the project architecture specifies backend-derived values.

Closure rate must be calculated consistently.

---

# 22. DEMO/OFFLINE MODE

The repository currently contains development/demo fallback behavior.

Audit every place where:

```text
API failure
```

can cause:

```text
demoStore
mock data
fake success
local fallback
```

For production/hackathon deployment:

**Never silently convert a backend failure into a successful operation.**

If demo mode is retained, it must be:

```text
explicitly enabled
```

and clearly distinguishable.

Preferred:

```text
VITE_DEMO_MODE=false
```

for deployment.

Production:

```text
API failure → real error
```

not:

```text
API failure → fake success
```

---

# 23. ERROR HANDLING

Every API error must return a safe structured response.

Example:

```json
{
  "success": false,
  "error": "Unable to complete the referral action."
}
```

Never expose:

- stack traces
- database connection details
- filesystem paths
- environment variables
- API keys
- provider internals

Frontend should display human-readable errors.

---

# 24. UI STATE REQUIREMENTS

Every important screen/action should support:

```text
LOADING
SUCCESS
EMPTY
ERROR
DISABLED
OFFLINE
SUBMITTING
FAILURE
```

Critical action buttons must not allow duplicate submissions.

Success UI must appear only after backend confirmation.

---

# 25. SECURITY REVIEW

Perform a security pass for:

- JWT
- password hashing
- cookies
- CORS
- Helmet
- rate limiting
- input validation
- authorization
- IDOR
- secret management
- error leakage
- prompt injection
- AI output validation
- audit logging

Do not weaken security to make the demo easier.

---

# 26. DOCKER

Verify:

```bash
docker compose up --build
```

starts:

```text
MongoDB
Backend
Frontend
```

Verify:

```text
Frontend → Backend → MongoDB
```

works inside Docker.

Fix Docker networking.

Do not use:

```text
localhost
```

inside containers when a service hostname is required.

Use:

```text
mongo
server
```

where appropriate.

---

# 27. DEPLOYMENT TARGET

Make the architecture deployable as:

```text
Frontend:
Vercel / Netlify / static hosting

Backend:
Render / Railway / Fly.io / VPS / Docker host

Database:
MongoDB Atlas
```

Do not hard-code one provider unless the repository already specifies one.

The frontend must accept:

```text
VITE_API_URL
```

as a deployment-time configuration.

Backend must accept:

```text
MONGODB_URI
JWT_SECRET
LLM_API_KEY
CLIENT_ORIGIN
PORT
```

as environment configuration.

---

# 28. FRONTEND/BACKEND CONTRACT CHECK

Create a complete endpoint inventory.

For every endpoint record:

```text
METHOD
PATH
AUTH REQUIRED
ROLE
REQUEST BODY
RESPONSE
ERRORS
DATABASE EFFECT
```

Compare this inventory against every frontend API call.

Fix:

- wrong HTTP methods
- wrong URLs
- wrong field names
- wrong response assumptions
- missing authentication
- incorrect IDs
- incorrect status values

Do not rename APIs unnecessarily.

---

# 29. END-TO-END TEST

After fixing the project, perform this exact test:

```text
1. Start MongoDB
2. Start backend
3. Start frontend
4. Create/login user
5. Create patient
6. Enter symptoms
7. Run AI triage
8. Verify triage result
9. Rank facilities
10. Select facility
11. Create referral
12. Send referral
13. Login as facility staff
14. Accept referral
15. Mark patient arrived
16. Complete consultation
17. Create diagnostics
18. Complete diagnostics
19. Add clinician medication
20. Create follow-up
21. Complete follow-up
22. Close referral
23. Open referral timeline
24. Open dashboard
25. Verify closure rate
26. Verify overdue/follow-up metrics
```

Every step must use real backend persistence.

---

# 30. TEST FAILURE SCENARIOS

Also test:

### Authentication

- invalid password
- expired/invalid JWT
- unauthorized role

### AI

- provider unavailable
- timeout
- invalid JSON
- unsafe output
- prompt injection
- fallback

### Referral

- illegal transition
- duplicate action
- rejected referral
- reassignment
- nonexistent referral

### Database

- MongoDB unavailable
- invalid ID
- missing required field

### Frontend

- slow API
- API failure
- empty result
- duplicate click
- mobile screen

---

# 31. CODE QUALITY

Prefer the existing architecture.

Do not perform unnecessary rewrites.

Remove:

- dead code
- unused imports
- duplicate components
- obsolete API calls
- obsolete routes
- temporary debugging statements
- exposed secrets
- accidental generated files

Keep:

- TypeScript
- reusable components
- service layers
- existing business logic
- documented architecture

---

# 32. HACKATHON PRIORITY

If time is limited, prioritize exactly in this order:

### P0

```text
Build
↓
Startup
↓
Authentication
↓
Patient
↓
Triage
↓
Facility Ranking
↓
Referral
↓
Accept/Reject/Reassign
↓
Arrival
↓
Consultation
↓
Diagnostics
↓
Medication
↓
Follow-up
↓
Closure
```

### P1

```text
Dashboard
Notifications
Audit
Advanced AI
Advanced analytics
```

### P2

```text
Decorative animations
Advanced maps
Non-essential polish
Extra abstractions
Experimental features
```

Do NOT sacrifice the golden path for visual polish.

---

# 33. FINAL ACCEPTANCE CRITERIA

Do not declare the project finished until:

- frontend builds
- backend builds
- MongoDB connects
- authentication works
- RBAC works
- patient creation works
- triage works
- deterministic AI fallback works
- facility ranking works
- referral creation works
- referral state transitions work
- referral events persist
- facility acceptance/rejection works
- reassignment works
- arrival works
- consultation works
- diagnostics work
- medication works
- follow-up works
- closure works
- dashboard metrics work
- closure rate works
- Docker deployment works
- environment variables work
- secrets are not exposed
- production/demo fallback is controlled
- frontend API contracts match backend
- golden path works from beginning to end

---

# 34. FINAL OUTPUT

After implementation, provide a concise engineering report containing:

## A. Build Status

```text
Frontend: PASS/FAIL
Backend: PASS/FAIL
Docker: PASS/FAIL
```

## B. Golden Path

List every tested stage and mark:

```text
PASS
FAIL
PARTIAL
```

## C. API Contract

List all important endpoints verified.

## D. Database

List the models actually used.

## E. AI

Explain:

- provider
- output schema
- validation
- safety
- fallback

## F. Security

List the security controls verified.

## G. Deployment

Give exact commands for:

```text
Local
Docker
Frontend deployment
Backend deployment
```

## H. Remaining Issues

Only list real remaining blockers.

Do NOT claim something is complete if it was not actually tested.

---

# MOST IMPORTANT RULE

Do not optimize for:

> "The project looks complete."

Optimize for:

> "A judge can run the application and successfully follow a real patient referral from symptom entry all the way to referral closure, with every important state persisted and visible."

Preserve the existing CareConnect context, architecture, terminology, and functionality.

Fix the project rather than replacing it.

Make it **buildable, testable, secure, integrated, and deployable end-to-end.**