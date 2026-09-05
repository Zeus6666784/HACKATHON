# Testing Specifications - CareConnect Maharashtra

This document defines the verification process for all core functionality.

## 1. Test Levels

### 1.1 Unit Tests
- **Ranking Algorithm**: Verify that a high-capability facility ranks above a low-capability one, even if slightly further.
- **State Machine**: Verify that illegal transitions (e.g., `SENT` $\rightarrow$ `CLOSED`) are blocked.
- **Zod Schemas**: Verify that malformed inputs are caught.

### 1.2 API Tests
- **Auth Flow**: Login $\rightarrow$ JWT issue $\rightarrow$ Protected route access.
- **RBAC**: Verify that `FACILITY_STAFF` cannot access `ADMIN` endpoints.
- **Referral Lifecycle**: Sequence of PATCH requests to move a referral from `CREATED` to `CLOSED`.

### 1.3 AI Validation
- **Priority Accuracy**: Use the demo-case dataset to ensure `HIGH` priority cases are correctly flagged.
- **Safety Filter**: Verify that prompts asking for "diagnosis" or "prescription" are refused.
- **Fallback Trigger**: Mock an API 500 error and verify the Rule-based matrix takes over.

## 2. The Core "Golden Path" Test
The following end-to-end flow must be verified manually and via automated scripts:
1. **Login** as Health Worker.
2. **Create Patient** (Savitri Patil).
3. **Input Symptoms** $\rightarrow$ **AI Triage** $\rightarrow$ **Doctor Confirms HIGH Priority**.
4. **Ranking** $\rightarrow$ Select top verified facility.
5. **Create Referral** $\rightarrow$ Status: `SENT`.
6. **Login** as Facility Staff $\rightarrow$ **Accept Referral** $\rightarrow$ Status: `ACCEPTED`.
7. **Mark Arrival** $\rightarrow$ Status: `ARRIVED`.
8. **Consultation & Diagnostics** $\rightarrow$ Status: `DIAGNOSTICS`.
9. **Schedule Follow-up** $\rightarrow$ Status: `FOLLOW_UP`.
10. **Complete Follow-up** $\rightarrow$ **Close Referral** $\rightarrow$ Status: `CLOSED`.
11. **Verify Dashboard** $\rightarrow$ Closure rate updates.

## 3. Edge Case Testing
- **Referral Rejection**: Facility rejects $\rightarrow$ Re-ranking occurs $\rightarrow$ New facility accepts.
- **Lost-to-follow-up**: Mark a referral as lost and verify it is removed from "Active" lists.
- **Multilingual Switch**: Toggle between English and Marathi during a referral flow.
- **API Timeout**: Simulate a slow AI response and verify the UI loading state.
