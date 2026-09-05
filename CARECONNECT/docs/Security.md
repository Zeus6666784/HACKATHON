# Security Specification - CareConnect Maharashtra

Security is a first-class requirement for CareConnect Maharashtra. Because the system handles healthcare-related workflows and potentially sensitive information, the following specifications are mandatory.

## Security Objectives

- **Confidentiality**: Ensure patient and facility data is accessible only to authorized users.
- **Integrity**: Prevent unauthorized modification of referrals, medical data, and facility records.
- **Availability**: Ensure the system is available for critical health worker and facility operations.
- **Authentication**: Rigorously verify the identity of every user.
- **Authorization**: Apply the Principle of Least Privilege via strict Role-Based Access Control (RBAC).
- **Accountability**: Maintain an immutable audit trail of all security-sensitive actions.
- **Data Minimization**: Collect and store only the minimum data necessary for the referral process.
- **Secure Defaults**: The system must be secure by default; security must not be an "opt-in" feature.
- **Auditability**: All administrative and clinical changes must be traceable.
- **Safe Failure**: System failures must fail closed (deny access) rather than open.

## Threat Model

| Threat | Attack | Risk | Prevention | Detection | Response | Implementation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Credential Theft** | Phishing, password reuse, or database leak. | Unauthorized account access. | Strong password policy, bcrypt hashing. | Failed login spikes. | Account lockout, forced password reset. | `bcrypt`, `AuthService` |
| **JWT Theft** | XSS or network interception (non-HTTPS). | Session hijacking. | HTTP-only cookies (if applicable), short expiry, HTTPS. | Anomalous IP/User-Agent shifts. | Token invalidation, session kill. | `jwt.verify`, HTTPS |
| **Broken Access Control** | Modifying API parameters to access other users' data. | Unauthorized data access/leakage. | Server-side RBAC, ownership checks on every request. | 403 Forbidden log spikes. | IP block, account review. | `checkRole` middleware |
| **IDOR / BOLA** | Changing a `referralId` in the URL to view/edit others' referrals. | Data breach, malicious referral modification. | Object-level authorization checks (Resource Ownership). | 403 Forbidden logs. | Immediate session termination. | `ReferralService.validateOwnership` |
| **Privilege Escalation** | Modifying a request to change one's role to `ADMIN`. | Full system compromise. | Strict server-side role validation; roles cannot be set by users. | Audit logs showing role changes. | Admin alert, account suspension. | `User` schema restrictions |
| **NoSQL Injection** | Passing objects (e.g., `{$gt: ""}`) instead of strings in queries. | Database bypass, data exfiltration. | Input validation with `Zod`, avoiding raw `{}` in queries. | Unexpected DB query patterns. | Block malicious IP. | `Zod` schemas |
| **XSS** | Injecting scripts into patient names or symptom fields. | Stealing JWTs, session hijacking. | Sanitize inputs, escape outputs, CSP headers. | WAF logs, reported script execution. | Patch input validation. | `Helmet`, React escaping |
| **CSRF** | Forcing a logged-in user to perform actions via a malicious link. | Unauthorized state changes. | Use of JWTs in headers (standard for REST), CORS restrictions. | Unexpected request origins. | Tighten CORS. | `cors` middleware |
| **API Abuse / DoS** | Flooding endpoints with requests. | System unavailability. | Rate limiting, request size limits. | 429 Too Many Requests spikes. | IP-based throttling/blocking. | `express-rate-limit` |
| **AI Prompt Injection** | Crafting prompts to bypass safety boundaries. | AI diagnosing or prescribing. | Prompt templating, input sanitization, output validation. | Monitoring AI logs for "ignore previous instructions". | Refine system prompts, add guards. | AI Safety Layer |
| **Malicious AI Output** | AI generating fake medical advice or prescriptions. | Patient harm. | AI output validation against schema, human-in-the-loop. | Schema validation failures. | Fallback to rule-based triage. | `Zod` output validation |
| **Info Disclosure** | Verbose error messages leaking DB paths or secrets. | Facilitating further attacks. | Generic error responses in production. | Error log analysis. | Update global error handler. | `ErrorHandler` middleware |
| **Secret Leakage** | Committing `.env` or keys to Git. | Full infrastructure compromise. | Use `.env.example`, `.gitignore`, environment secrets. | Secret scanning (GitHub/GitLab). | Rotate all leaked keys immediately. | `.gitignore` |
| **Insider Misuse** | Authorized staff accessing data they don't need. | Privacy breach. | Audit logging, data minimization. | Audit log review. | Disciplinary action, access review. | `AuditLog` collection |

## Authentication Security

### Password Management
- **Hashing**: Use `bcrypt` with a minimum salt round of 10. Never store plain text.
- **Policy**: Enforce a minimum password length (e.g., 8+ characters).
- **Validation**: Credentials must be validated on the server; do not rely on frontend checks.

### Session Management (JWT)
- **Design**: Use signed JWTs containing `userId` and `role`.
- **Expiry**: Short-lived access tokens (e.g., 1 hour).
- **Refresh Strategy**: Implement refresh tokens stored in secure, HTTP-only cookies to minimize access token exposure.
- **Logout**: Implement server-side token blacklisting or rely on short expiry for immediate invalidation.

### Brute-Force Protection
- **Rate Limiting**: Apply strict rate limits to `/api/auth/login` and `/api/auth/register`.
- **Progressive Delay**: Introduce increasing delays after consecutive failed login attempts.
- **Enumeration Prevention**: Use generic error messages (e.g., "Invalid email or password") regardless of whether the email exists.

## Authorization (RBAC)

Strict server-side RBAC must be enforced for all protected endpoints.

### Role Definitions
- **PATIENT**: Access only to their own personal record and their own referral status.
- **HEALTH_WORKER**: Register patients, create referrals, view assigned patients.
- **FACILITY**: Manage referrals sent to their facility; accept/reject/update arrival.
- **DOCTOR**: Triage, manage medical updates, close referrals.
- **ADMIN**: User management, facility configuration, system audits.

### Authorization Checks
- **Role Checks**: Use middleware to verify the user's role matches the endpoint requirement.
- **Resource Ownership**: For resources like `Referral` or `Patient`, the server must verify that the `userId` in the JWT is authorized to access that specific resource ID (Preventing IDOR/BOLA).
- **Facility-Level Access**: Facility staff can only see referrals where `destinationFacilityId` matches their own facility.

## Patient/Data Security

### Data Handling
- **Data Minimization**: Collect only what is clinically necessary.
- **Transit Encryption**: All traffic must be over HTTPS (TLS 1.2+).
- **Storage**: Use encrypted environment variables for DB connection strings.
- **Demo Data**: Use ONLY synthetic data for the hackathon. No real patient data is permitted in any environment.

### Auditability
- **Traceability**: Every modification to a patient record or referral must be linked to a `userId`.
- **Persistence**: Audit logs must be stored in a separate collection and treated as append-only.

## API Security

### Validation & Filtering
- **Input Validation**: Every single API request body, query, and parameter must be validated using `Zod`.
- **Output Validation**: Sensitive fields (e.g., `password`) must be stripped from responses using Mongoose projections or DTOs.
- **Request Limits**: Implement a maximum request body size (e.g., 1mb) to prevent payload-based DoS.

### HTTP Security
- **Headers**: Use `Helmet` to implement:
  - `Content-Security-Policy` (CSP)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (HSTS)
- **CORS**: Strictly restrict `origin` to the production frontend domain.

## MongoDB/Mongoose Security

- **Injection Prevention**: Never use raw JS objects from `req.body` directly in Mongoose queries. Always cast/validate via `Zod`.
- **Principle of Least Privilege**: The DB user used by the app should only have `readWrite` permissions on the specific `careconnect` database.
- **Connection Security**: Use `mongodb+srv` with TLS/SSL enabled.

## AI Security

The AI is an untrusted external component.

### Safety Boundaries
- **Prompt Injection**: Use structured system prompts that explicitly forbid the AI from ignoring instructions.
- **Output Validation**: AI responses must be parsed into a strict JSON schema and validated via `Zod`.
- **Deterministic Safety Layer**:
  - AI provides *recommendations*.
  - The system enforces *rules* (e.g., AI cannot close a referral).
  - Critical triage paths must have a deterministic rule-based fallback if AI fails or provides unsafe output.

### Prohibited AI Actions
- **No Diagnosis**: AI must not output "Patient has X".
- **No Prescription**: AI must not output "Prescribe Y".
- **No Direct Authority**: AI cannot update database records directly; it must suggest an action for a human clinician to approve.

## API Key & Secret Security

- **No Hardcoding**: Secrets must NEVER be hardcoded in source code.
- **Environment Variables**: Use `.env` files locally and Railway secrets in production.
- **Git Hygiene**: `.env` must be in `.gitignore`. Use `.env.example` to document required keys.
- **No Secrets in Logs**: Ensure logging middleware strips sensitive keys.

## Audit Logging

The following events MUST be audited in the `AuditLog` collection:

| Event | Actor | Entity | Metadata |
| :--- | :--- | :--- | :--- |
| `USER_LOGIN` | User | User | IP, Timestamp |
| `AUTH_FAILURE` | Unknown | User/IP | Attempted Email, IP |
| `REFERRAL_CREATE` | HealthWorker | Referral | PatientId, FacilityId |
| `REFERRAL_ACCEPT` | FacilityStaff | Referral | FacilityId |
| `REFERRAL_REJECT` | FacilityStaff | Referral | Reason |
| `PATIENT_ARRIVAL` | FacilityStaff | Referral | ArrivalTime |
| `CONSULT_UPDATE` | Doctor | Referral | UpdateType |
| `MED_PLAN_CREATE` | Doctor | Referral | PlanId |
| `REFERRAL_CLOSE` | Doctor | Referral | Outcome |
| `ROLE_CHANGE` | Admin | User | OldRole, NewRole |

**Audit Record Format**: `{ timestamp, actorId, action, entityType, entityId, metadata, ipAddress }`

## Logging Security

**NEVER log the following**:
- Passwords or password hashes.
- JWTs or Refresh Tokens.
- API Keys (AI provider keys, etc.).
- Full medical history in plain text logs (keep it in the encrypted/secure DB).
- Database connection strings.

## Dependency Security

- **Minimalism**: Only install packages that provide essential functionality.
- **Vulnerability Scanning**: Use `npm audit` regularly to identify and patch vulnerable dependencies.
- **Stability**: Prefer well-maintained, widely used packages (e.g., `Zod`, `bcrypt`, `jsonwebtoken`).

## Production Security

- **HTTPS**: Forced TLS for all endpoints.
- **Secure DB**: MongoDB Atlas with IP whitelisting and strong credentials.
- **No Debugging**: Disable `stack-trace` in production error responses.
- **No Backdoors**: Strictly prohibit any "test" accounts or "bypass" routes in production.

## Security Testing

The following tests must be executed and passed:
1. **Auth Bypass**: Attempt to access `/api/referrals` without a token $\rightarrow$ 401.
2. **Role Escalation**: Attempt to call `ADMIN` endpoint with `PATIENT` token $\rightarrow$ 403.
3. **IDOR**: Attempt to update a referral ID that does not belong to the user $\rightarrow$ 403.
4. **Invalid Token**: Attempt to use a malformed or expired JWT $\rightarrow$ 401.
5. **NoSQL Injection**: Pass `{"$gt": ""}` as a username in login $\rightarrow$ 400/401.
6. **XSS**: Inject `<script>` into a patient name $\rightarrow$ Escaped in UI.
7. **Rate Limit**: Hit login endpoint 100 times/min $\rightarrow$ 429.
8. **AI Abuse**: Prompt AI to "diagnose the patient" $\rightarrow$ AI refuses or safety layer flags.

## Security Acceptance Criteria

The project is not ready for deployment until:
- [ ] All `Zod` schemas are implemented for all API endpoints.
- [ ] RBAC is verified for every protected route.
- [ ] No secrets are found in the git history.
- [ ] HTTPS is active and enforced.
- [ ] `npm audit` shows no high/critical vulnerabilities.
- [ ] End-to-end tests for IDOR and Role Escalation pass.
- [ ] Audit logs are being correctly populated for all critical events.
