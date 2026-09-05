# Architecture Document - CareConnect Maharashtra

## 1. High-Level Architecture
CareConnect follows a classic **MERN (MongoDB, Express, React, Node)** stack architecture with a clear separation between the client and server.

### 1.1 Component Overview
- **Frontend (Client)**: A React-based Single Page Application (SPA) built with Vite and TypeScript.
- **Backend (Server)**: A Node.js/Express REST API built with TypeScript.
- **Database**: MongoDB for flexible, document-oriented storage of patient, facility, and referral data.
- **AI Layer**: An AI Service with a Provider Abstraction layer that integrates external LLM APIs with a deterministic rule-based fallback.
- **Maps Layer**: Leaflet.js, OpenStreetMap, and Overpass API for facility visualization and distance calculation.

## 2. Frontend Architecture
- **Framework**: React 18+ with Vite for fast builds.
- **Language**: TypeScript for type safety across the UI.
- **Styling**: Tailwind CSS for a modern, responsive healthcare UI.
- **State Management**: 
  - **Server State**: TanStack Query (React Query) for caching and synchronizing API data.
  - **Global State**: React Context for authentication and multilingual settings.
- **Routing**: React Router for navigation.
- **Key Libraries**:
  - `lucide-react` for iconography.
  - `recharts` for dashboard analytics.
  - `leaflet` for map integration.

## 3. Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **API Style**: RESTful API.
- **Authentication**: JWT (JSON Web Tokens) stored in secure cookies/local storage.
- **Authorization**: Role-Based Access Control (RBAC) with roles: `ADMIN`, `DOCTOR`, `HEALTH_WORKER`, `FACILITY_STAFF`.
- **Validation**: Zod for strict request/response validation.
- **Security**: Helmet, CORS, and `express-rate-limit` for API protection.

## 4. Database Architecture
- **Primary Store**: MongoDB.
- **ODM**: Mongoose for schema definition and validation.
- **Key Entities**:
  - `User`: Auth and profile.
  - `Patient`: Demographic and clinical summary.
  - `Facility`: Capabilities, coordinates, and verification status.
  - `Referral`: The core state machine tracking the patient journey.
  - `ReferralEvent`: Audit log of every status change in a referral.
  - `TriageAssessment`: Records of AI-assisted triage.
  - `FollowUp` & `MedicationPlan`: Post-consultation tracking.

## 5. Specialized Systems

### 5.1 Referral State Machine
The referral system is implemented as a strict state machine on the backend. Transitions are validated to prevent illegal jumps (e.g., a referral cannot move from `CREATED` to `ARRIVED` without being `ACCEPTED`).

### 5.2 Facility Ranking Logic
A deterministic scoring algorithm that weights:
1. **Capability Match**: Does the facility have the required service?
2. **Care Level**: Is it the appropriate level (PHC $\rightarrow$ District $\rightarrow$ Tertiary)?
3. **Distance**: Physical proximity using Haversine formula.
4. **Verification**: Higher weight for `VERIFIED` data.

### 5.3 AI Triage and Provider Strategy
- **Abstraction Layer**: AI Service $\rightarrow$ Provider Adapter $\rightarrow$ Active Provider $\rightarrow$ Response Validation $\rightarrow$ Safe Result.
- **Providers**: Support for multiple providers (e.g., Google Gemini, Groq) to avoid vendor lock-in.
- **Fallback**: If any provider is unavailable or returns invalid data, the system uses a deterministic rule-based triage.
- **Flow**: Client $\rightarrow$ Server $\rightarrow$ AI Service $\rightarrow$ LLM API $\rightarrow$ Server (Validation) $\rightarrow$ Client.

## 6. External Integrations
- **Maps**: OpenStreetMap / Overpass API.
- **AI**: External LLM APIs (via AI Provider Abstraction).
- **Language**: Sarvam AI for Marathi/Hindi translation and speech-to-text.

## 7. Deployment Architecture
- **Backend & DB**: Railway (Node.js + MongoDB).
- **Frontend**: Vercel or Railway.
- **Environment**: `.env` for secrets (JWT keys, API keys).

## 8. Scalability & Reliability
- **Stateless Server**: Allows horizontal scaling.
- **Caching**: TanStack Query on the frontend reduces redundant API calls.
- **Failure Handling**: Graceful degradation if AI or Map APIs fail.
