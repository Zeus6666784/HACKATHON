# Project Memory - CareConnect Maharashtra

This is a living document tracking the current state of the project.

## 1. Project Status
- **Overall Status**: 🟢 Documentation Updated
- **Current Phase**: Phase 0 (Documentation and Planning) - Update Complete.
- **Core Goal**: Build a referral-continuity layer for rural healthcare.

## 2. Progress Tracking
- [x] Documentation Structure Created
- [x] Foundational Project Structure Created
- [x] All 20 Documentation Files Populated
- [x] Documentation Updated with New Project Decisions (2026-09-04)
- [ ] Project Initialization (Phase 1)
- [ ] Database Implementation (Phase 2)

## 3. Important Decisions
- **Tech Stack**: MERN (MongoDB, Express, React, Node) with TypeScript.
- **Core USP**: Focus on "Referral Closure" rather than just "Hospital Finding".
- **AI Safety**: Strictly "Decision Support" only; no diagnosis or prescribing.
- **Ranking**: Deterministic scoring based on capabilities, care level, and distance. Updated to distinguish Emergency vs Normal priority orders.
- **Mapping**: Leaflet + OpenStreetMap + Overpass API.
- **AI Strategy**: Provider abstraction with rule-based fallback.

## 4. Known Issues
- (None yet)

## 5. Pending Decisions
- **LLM Provider**: Need to select active provider from the abstraction (Gemini/Groq).
- **Language API**: Confirm Sarvam AI integration details.

## 6. Next Task
- Start **Phase 1: Project Foundation** (Initialize client and server).

## 7. Recent Changes
- Updated all `.md` files to integrate new project requirements:
  - Tagline and USP emphasis in `PRD.md`.
  - AI Provider Abstraction and Overpass API in `Architecture.md`.
  - Strict healthcare safety and security rules in `Rules.md`.
  - P0/P1/P2 priority alignment in `Phases.md`.
  - Exact state machine and `ReferralEvent` fields in `Referral-System.md`.
  - Emergency vs Normal ranking priorities in `Facility-Ranking.md`.
  - AI Triage input/output specs in `AI-Triage.md`.
  - Medication actions and restrictions in `Medication-Followup.md`.
  - `SYNTHETIC` verification state and `ReferralEvent` fields in `Database.md`.
  - Explicit `express-rate-limit` requirement in `Security-Privacy.md`.
