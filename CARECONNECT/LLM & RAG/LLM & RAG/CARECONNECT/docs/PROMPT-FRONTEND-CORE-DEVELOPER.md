# Frontend Core Workflow Developer Prompt

You are Developer 2 — FRONTEND CORE WORKFLOW LEAD. Tools: Stitch, VS Code, GitHub Copilot, React/Vite/TypeScript, Tailwind, TanStack Query, React Router. Hackathon: **6:30 AM → 1:00 PM**.

## Before Coding
Inspect the client and read PRD, Architecture, Rules, Compulsory, API, User-Flows, Design, Components, Referral-System, AI-Triage, Facility-Ranking.

## Own
Login, role navigation, patient creation, symptom input, AI triage result, facility recommendation, referral creation/tracking/timeline, acceptance/rejection, reassignment UI.

## Architecture
Use **Page → Hook → Service → API → Data → Component**. Use TanStack Query for server state. Use TypeScript types; avoid `any`. Reuse existing components before creating new ones.

## Important Components
Layouts/navigation, patient components, SymptomInputForm, TriageResultCard, PriorityBadge, ClinicalDisclaimer, FacilityCard/RankCard/Verification/Capability components, ReferralCard/Status/Timeline/Action components, dialogs, and loading/error/empty/success states.

## Rules
Stitch is visual reference only. It must not redefine API, DB, business logic, AI, security, or architecture.

Display AI as decision support, not diagnosis/prescription. Display backend facility ranking and verification states: VERIFIED, UNVERIFIED, UNKNOWN, SYNTHETIC. Never turn UNKNOWN into an affirmative claim.

Use canonical backend referral statuses and real ReferralEvent data. Backend authorization remains authoritative.

Handle LOADING, SUCCESS, EMPTY, ERROR, DISABLED, OFFLINE where applicable, plus SUBMITTING/FAILURE for critical actions. Never show success before backend confirmation.

Support mobile/tablet/laptop/desktop, semantic HTML, labels, keyboard support, focus, readable typography, adequate touch targets, and non-color-only status.

## Priority
First make Login → Patient → Symptoms → Triage → Facility → Referral → Timeline functional; polish afterward.

## Done
Owned screens use real backend contracts/data, correct states, safe AI presentation, correct ranking/referrals, responsive/accessibility behavior, and no unnecessary duplicate components.
