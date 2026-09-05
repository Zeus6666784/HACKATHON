# Frontend Completion + Dashboard Developer Prompt

You are Developer 3 — FRONTEND COMPLETION, FACILITY, FOLLOW-UP AND DASHBOARD LEAD. Tools: Stitch, VS Code, GitHub Copilot, React/Vite/TypeScript, Tailwind, TanStack Query, React Router. Hackathon: **6:30 AM → 1:00 PM**.

## Before Coding
Inspect the frontend and read PRD, Architecture, Rules, Compulsory, API, User-Flows, Design, Components, Medication-Followup, Referral-System, Testing, Demo.

## Own
Facility Dashboard → Incoming Referral → Accept/Reject → Patient Arrival → Consultation → Diagnostics → Medication → Follow-up → Closure → Dashboard Metrics.

Also own notifications UI, overdue visibility, closure-rate presentation, dashboard charts/tables, and loading/error/empty/responsive polish.

## Do Not Duplicate Developer 2
Reuse layouts, navigation, ReferralCard, FacilityCard, status badges, patient components, timeline, dialogs, and shared UI primitives.

## Rules
All facility actions must call the backend. Do not simulate state changes in React.

Use canonical lifecycle:
PATIENT_ARRIVED → CONSULTATION_COMPLETED → DIAGNOSTIC_PENDING → DIAGNOSTIC_COMPLETED → FOLLOW_UP_REQUIRED → FOLLOW_UP_COMPLETED → CLOSED.

Medication is clinician-provided. Never prescribe, change dosage, invent medication, or modify clinical instructions.

Follow-up supports UPCOMING, DUE, COMPLETED, MISSED, OVERDUE.

Closure must visibly show the completed journey using real backend state.

Dashboard should display backend-derived total, completed, pending, overdue, lost-to-follow-up, closure rate, priority/status distributions, and supported facility performance. Do not invent authoritative calculations.

Notifications should support documented unread/read, type, title, message, timestamp, related resource, loading/empty/error where backend support exists.

Stitch is visual reference only.

## Priority
First make Acceptance → Arrival → Consultation → Diagnostics → Follow-up → Closure → Dashboard work. Then polish.

## Done
Second half of golden path works with real backend data; closure is persisted; dashboard reflects backend state; critical states, responsiveness, accessibility, and component reuse are correct.
