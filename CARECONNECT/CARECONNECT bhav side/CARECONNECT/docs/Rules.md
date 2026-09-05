# Development Rules - CareConnect Maharashtra

These rules are mandatory constraints for any AI or human developer working on this project.

## 1. Core Development Philosophy

### RULE: DO NOT CHANGE UNRELATED CODE
The coding agent MUST NOT:
- Rewrite unrelated files or refactor unrelated code.
- Rename working files without a real requirement.
- Replace working libraries without an explicit request.
- Rebuild an existing feature from scratch.
- Change working API contracts or database schemas unnecessarily.
- Change UI behavior unrelated to the current task.
- Remove working functionality.

### RULE: INSPECT BEFORE MODIFYING
Before changing code:
1. Read the relevant documentation (`PRD.md`, `Architecture.md`, `Rules.md`, etc.).
2. Inspect the existing implementation.
3. Search for related functionality to avoid duplication.
4. Identify dependencies.
5. Determine what is already working.
6. Make the smallest required change.

### RULE: MINIMAL DIFF
Prefer the smallest coherent change. Do not make large-scale changes when a localized change is sufficient.

### RULE: PRESERVE EXISTING CONTRACTS
Do not change API endpoints, database fields, component interfaces, environment variable names, authentication behavior, or referral statuses unless the current task explicitly requires it and the documentation is updated.

### RULE: NO UNREQUESTED FEATURES
Do not add a new feature simply because it would be interesting. A feature must be supported by the PRD, a relevant feature specification, or an explicit task instruction.

### RULE: NO RANDOM REFACTORING
Do not refactor working code during unrelated feature implementation. If a serious architectural problem is discovered:
1. Document it.
2. Explain its impact.
3. Propose a change.
4. Do not silently rewrite it.

### RULE: TEST BEFORE AND AFTER
Where practical:
1. Establish the current working state.
2. Make the change.
3. Test the change.
4. Verify previously working functionality remains working.

### RULE: MEMORY UPDATE
After every meaningful piece of work, update `Memory.md` with:
- What changed and which files were modified.
- Tests run.
- Current status and known issues.
- The next logical task.

### RULE: NEVER FAKE COMPLETION
Do not claim a feature is complete if:
- It is only a UI mock.
- Backend logic or database persistence is missing.
- Tests are failing or errors are ignored.
- It only works through manual database manipulation.

## 2. Technology Stack & Standards

### Stack Rules
- **Strict MERN**: React, Vite, TS, Tailwind, Node, Express, MongoDB.
- **TypeScript**: No `any`. Use interfaces and types for all data structures.
- **Dependencies**: Do not add new libraries without checking if a native or already-installed one suffices.

### Coding Standards
- **Naming**: 
  - Variables/Functions: `camelCase`.
  - Classes/Types: `PascalCase`.
  - Constants: `UPPER_SNAKE_CASE`.
  - Files: `kebab-case`.
- **Modularity**: Logic must be separated into Controllers $\rightarrow$ Services $\rightarrow$ Models.
- **No Boilerplate**: Avoid over-engineering. No interfaces for single implementations.

## 3. Security & Safety (CRITICAL)

### RULE: SECURITY OVERRIDES CONVENIENCE
Never disable security controls to make a feature easier to test or demo.
- No hardcoded admin credentials.
- No hidden bypass routes or authentication bypasses.
- No debug backdoors or public database access.
- Temporary development shortcuts must never enter the production build.

### RULE: MEDICAL SAFETY OVERRIDES AI CREATIVITY
- **NO DIAGNOSIS**: AI must never output a confirmed disease. Use descriptive terms (e.g., "Symptoms suggest high urgency").
- **NO PRESCRIPTION**: AI must never suggest a medication, determine dosage, or modify a doctor's medication plan.
- **Decision Support Only**: AI provides a *recommendation*; a human clinician must always confirm and sign off.
- **Deterministic Fallback**: Use the rule-based danger-sign matrix if AI fails.

### Authentication & Authorization
- **JWT**: All protected routes must require a valid JWT.
- **RBAC**: Check roles on the backend for every sensitive operation.
- **Password Safety**: Use `bcrypt` for hashing; never store plain text.
- **Input Validation**: Use `Zod` for all incoming API requests.
- **Headers**: Use `Helmet` to secure HTTP headers.
- **Rate Limiting**: Use `express-rate-limit` on all API endpoints.
- **Secrets**: Never expose secrets in frontend code or commit `.env` files.

## 4. Data Accuracy & Integrity

### RULE: DATA INTEGRITY
Never invent facility capabilities, coordinates, specialists, diagnostics, bed availability, or government statistics.
- **Verification States**: Facility data must be marked as `VERIFIED`, `UNVERIFIED`, `UNKNOWN`, or `SYNTHETIC`.
- **Synthetic Data**: For the demo, clearly label data as synthetic.

## 5. Domain Rules

### Referral Workflow
- **State Integrity**: Status transitions must follow the defined state machine. No skipping steps.
- **Audit Trail**: Every status change must create a `ReferralEvent` record.
- **Closure**: A referral is only "Closed" when the final healthcare outcome is recorded.

### Frontend & UX
- **Responsive**: Mobile-first design for rural health workers.
- **Accessibility**: High contrast, legible fonts for medical environments.
- **Language**: Support Marathi, Hindi, and English. Text-based functionality must remain available.
- **UI**: Focus on clinical utility and clarity. Professional, modern, and clean.

### Error Handling & API
- **Consistency**: Use standard HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- **User-Safe Errors**: Never leak database stack traces to the client.
- **Fallbacks**: Map and AI failures must not crash the application.

## 6. Coding Agent Model

The primary coding agent currently uses:
- **Model**: Gemma 4 31B (Ollama Cloud)
- **Optimization**: Repository-level development.

**Agent Workflow**:
1. Read relevant documentation (`EXPLAINED.md`, `PRD.md`, `Architecture.md`, `Rules.md`, `Phases.md`, `Memory.md`).
2. Inspect existing files and identify dependencies.
3. Make targeted changes (Minimal Diff).
4. Run validation/tests.
5. Update `Memory.md`.

**Constraints**:
- Do not regenerate the entire project for small changes.
- Do not assume a feature is missing until the relevant implementation has been read.
- Respect the established source of truth (Git Repo > Docs > AI).
