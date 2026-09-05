# API Documentation - CareConnect Maharashtra

All endpoints follow REST conventions. Base URL: `/api/v1`.

## 1. Authentication
- `POST /auth/signup`: Register a user.
- `POST /auth/login`: Authenticate and receive JWT.
- `POST /auth/logout`: Invalidate session.

## 2. Patient Management
- `POST /patients`: Create a new patient record. (Role: `HEALTH_WORKER`, `DOCTOR`)
- `GET /patients`: List patients with filters. (Role: `HEALTH_WORKER`, `DOCTOR`)
- `GET /patients/:id`: Get detailed patient profile. (Role: `HEALTH_WORKER`, `DOCTOR`)
- `PUT /patients/:id`: Update patient demographics. (Role: `HEALTH_WORKER`, `DOCTOR`)

## 3. Facility Intelligence
- `GET /facilities`: List all facilities with filter/search. (Role: All)
- `GET /facilities/:id`: Get facility details. (Role: All)
- `GET /facilities/rank`: Get ranked facilities for a patient. (Role: `DOCTOR`, `HEALTH_WORKER`)
  - **Params**: `patientId`, `symptoms`, `isEmergency`.
- `POST /facilities`: Add new facility. (Role: `ADMIN`)

## 4. AI Triage
- `POST /triage/assess`: Submit symptoms for AI assessment. (Role: `HEALTH_WORKER`, `DOCTOR`)
  - **Request**: `{ patientId, symptoms }`.
  - **Response**: `{ priority, suggestedCareLevel, reasoning, caution }`.

## 5. Referral Lifecycle
- `POST /referrals`: Create a new referral. (Role: `DOCTOR`, `HEALTH_WORKER`)
- `GET /referrals`: List referrals based on role (mine, my-facility, all). (Role: `DOCTOR`, `FACILITY_STAFF`, `ADMIN`)
- `GET /referrals/:id`: Get referral details and full event timeline. (Role: `DOCTOR`, `FACILITY_STAFF`, `ADMIN`)
- `PATCH /referrals/:id/status`: Update referral status. (Role: `DOCTOR`, `FACILITY_STAFF`)
  - **Request**: `{ status, notes }`.
  - **Validation**: Backend checks if transition is legal.
- `POST /referrals/:id/reassign`: Reassign rejected referral. (Role: `DOCTOR`, `HEALTH_WORKER`)
  - **Request**: `{ "toFacilityId": "...", "reason": "..." }`.

## 6. Post-Consultation
- `POST /referrals/:id/consultation`: Persist clinician consultation notes. (Role: `DOCTOR`)
- `POST /referrals/:id/diagnostics`, `PATCH /referrals/:id/diagnostics`: Order and complete diagnostic records. (Role: `DOCTOR`)
- `POST /followups`: Create a follow-up record. (Role: `DOCTOR`)
- `PATCH /followups/:id`: Mark follow-up as completed/missed. (Role: `DOCTOR`, `HEALTH_WORKER`)
- `POST /medications/plan`: Create a clinician-authored medication plan. (Role: `DOCTOR`)
- `POST /medications/reminders`, `PATCH /medications/reminders/:id`: Create/update reminder status. (Role: `HEALTH_WORKER`, `DOCTOR`)
- `PATCH /medications/plan/:id/sign-off`: Sign off a medication plan before closure. (Role: `DOCTOR`)
- `GET /notifications?unread=true`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`: User-scoped notification inbox.

## 7. Dashboard & Analytics
- `GET /dashboard/stats`: Get aggregate metrics (Closure rate, etc.). (Role: `ADMIN`, `DOCTOR`)
- `GET /dashboard/overdue`: List referrals that are overdue for the next step. (Role: `ADMIN`, `DOCTOR`)

## 8. Common Response Formats
- **Success**: `200 OK` or `201 Created` $\rightarrow$ `{ "success": true, "data": { ... } }`.
- **Error**: `400`, `401`, `403`, `404`, `500` $\rightarrow$ `{ "success": false, "error": "Readable error message" }`.
