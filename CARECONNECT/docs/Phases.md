# Implementation Phases - CareConnect Maharashtra

Development is divided into controlled phases based on the hackathon priority levels.

## P0: Core Demo & Closure Loop (Mandatory)
These features must be implemented and verified before any P1 or P2 work begins.

### Phase 0: Documentation and Planning
- **Objective**: Establish the source of truth and architecture.
- **Tasks**:
  - Update all documentation files in `docs/`.
  - Define database schemas and API contracts.
  - Setup project structure.
- **Completion**: All `.md` files populated and aligned with latest project decisions.

### Phase 1: Project Foundation
- **Objective**: Basic scaffolding.
- **Tasks**:
  - Initialize Vite/React client and Node/Express server with TypeScript.
  - Setup MongoDB connection.
- **Completion**: "Hello World" from client to server to DB.

### Phase 2: Database Implementation
- **Objective**: Persistent data layer.
- **Tasks**:
  - Implement Mongoose models for User, Patient, Facility, Referral, ReferralEvent.
  - Seed initial facility dataset from `CareConnect_Maharashtra_Facility_Dataset-.xlsx`.
- **Completion**: Data can be read/written via API.

### Phase 3: Authentication and RBAC
- **Objective**: Secure access.
- **Tasks**:
  - Implement JWT login/signup.
  - Create RBAC middleware for roles (`ADMIN`, `DOCTOR`, `HEALTH_WORKER`, `FACILITY_STAFF`).
- **Completion**: Protected routes only accessible by correct roles.

### Phase 4: Patient Management
- **Objective**: Patient record creation.
- **Tasks**:
  - CRUD for Patients.
  - Simple patient search.
- **Completion**: Health worker can create and view a patient.

### Phase 5: Facility System
- **Objective**: Facility directory.
- **Tasks**:
  - Facility list and detail view.
  - Integration with Leaflet maps.
- **Completion**: View facilities on a map with their capabilities.

### Phase 6: Referral Creation
- **Objective**: Initiate the journey.
- **Tasks**:
  - "Create Referral" form.
  - Link patient to a ranked facility.
  - Initial states: `CREATED` $\rightarrow$ `TRIAGED` $\rightarrow$ `FACILITY_SELECTED` $\rightarrow$ `REFERRAL_SENT`.
- **Completion**: A referral record exists in the DB.

### Phase 7: Referral Acceptance & Rejection
- **Objective**: Closing the first loop.
- **Tasks**:
  - Facility view for pending referrals.
  - `ACCEPT` / `REJECT` actions with rejection reason.
- **Completion**: Referral status updates to `REFERRAL_ACCEPTED` or `REFERRAL_REJECTED`.

### Phase 8: Referral Reassignment
- **Objective**: Handle rejections.
- **Tasks**:
  - Re-ranking facilities after rejection.
  - Reassigning the same referral to a new facility.
- **Completion**: Rejected referrals can be sent to alternatives.

### Phase 9: Referral Journey and Events
- **Objective**: Complete tracking.
- **Tasks**:
  - Implement states: `PATIENT_ARRIVED` $\rightarrow$ `CONSULTATION_COMPLETED` $\rightarrow$ `DIAGNOSTIC_PENDING` $\rightarrow$ `DIAGNOSTIC_COMPLETED` $\rightarrow$ `FOLLOW_UP_REQUIRED` $\rightarrow$ `FOLLOW_UP_COMPLETED` $\rightarrow$ `CLOSED`.
  - Create `ReferralEvent` for every change.
- **Completion**: Full lifecycle from Sent to Closed.

### Phase 10: Follow-up
- **Objective**: Ensure care completion.
- **Tasks**:
  - Create follow-up records with due dates.
  - Track completion status.
- **Completion**: System tracks if a patient returned for a check-up.

### Phase 11: Dashboard
- **Objective**: System visibility.
- **Tasks**:
  - Summary tiles (Total, Completed, Pending, Overdue, Lost-to-follow-up).
  - Closure Rate and Priority Distribution charts.
- **Completion**: Admin/Doctor can see overall system performance.

### Phase 12: Basic Security Hardening
- **Objective**: Patient data protection.
- **Tasks**:
  - Rate limiting, strict CORS, and audit log review.
- **Completion**: App passes a basic security checklist.

### Phase 13: End-to-End Testing & Demo Data
- **Objective**: Presentation readiness.
- **Tasks**:
  - Populate DB with synthetic "Savitri Patil" case from `CareConnect_Healthcare_Demo_Cases-.xlsx`.
  - Run full demo scenario (Triage $\rightarrow$ Referral $\rightarrow$ Closure).
- **Completion**: Core demo scenario works flawlessly.

### Phase 14: Deployment
- **Objective**: Live access.
- **Tasks**:
  - Deploy to Railway.
  - Configure production environment variables.
- **Completion**: App accessible via public URL.

## P1: Enhanced Capabilities
These features are implemented after P0 is stable.

### Phase 15: AI-Assisted Triage & Facility Ranking
- **Objective**: Intelligence at the start.
- **Tasks**:
  - Integrate AI Provider Abstraction with LLM APIs.
  - Implement "Danger Sign" rule-based fallback.
  - Implement Emergency vs Normal ranking logic.
- **Completion**: AI suggests priority and ranked facilities.

### Phase 16: Medication Reminders
- **Objective**: Medication adherence.
- **Tasks**:
  - Clinician-led medication plan entry.
  - Reminder events with actions (Taken/Snooze/Skip).
- **Completion**: Medication schedule tied to a referral.

### Phase 17: Multilingual Support
- **Objective**: Local accessibility.
- **Tasks**:
  - i18n implementation (English, Hindi, Marathi).
- **Completion**: UI switches between the three languages.

### Phase 18: Notifications
- **Objective**: Real-time alerts.
- **Tasks**:
  - In-app notification system for status alerts.
- **Completion**: Users see notifications for new referrals or arrivals.

## P2: Advanced Features & Polish
These features are implemented only if time permits.

### Phase 19: Low-Connectivity Support
- **Objective**: Rural resilience.
- **Tasks**:
  - Local caching and sync queue for offline actions.
- **Completion**: Basic app functionality when network is flaky.

### Phase 20: Speech & Advanced Integrations
- **Objective**: Enhanced accessibility.
- **Tasks**:
  - Speech-to-text and TTS for triage.
- **Completion**: Voice-enabled triage support.

### Phase 21: UI/UX Polish
- **Objective**: Professional feel.
- **Tasks**:
  - Fine-tune Tailwind styles, loading states, and transitions.
- **Completion**: UI is clean, modern, and clinical.
