# Medication and Follow-up - CareConnect Maharashtra

This document defines the tracking of post-consultation care to ensure the referral loop is closed.

## 1. Medication Reminders
Medication reminders are a supporting continuity-of-care feature.

### 1.1 Authorization
- **Rule**: Medication instructions must **only** originate from an authorized healthcare professional.
- **AI Restriction**: The AI is strictly forbidden from diagnosing, prescribing medicines, determining dosage, determining frequency, or modifying a doctor's medication plan.

### 1.2 Medication Plan Structure
A `MedicationPlan` is created during the `CONSULTATION_COMPLETED` or `DIAGNOSTIC_COMPLETED` phase:
- **Medicine Name**: Generic name of the drug.
- **Dosage**: Amount/strength.
- **Frequency**: (e.g., Twice a day, Every 8 hours).
- **Instructions**: (e.g., "After meals").
- **Duration**: Start date and end date.

### 1.3 Reminder Logic
- The system generates `MedicationReminder` events based on the plan.
- **Statuses**: `SCHEDULED` $\rightarrow$ `TAKEN` | `SKIPPED` | `SNOOZED`.
- **Actions**:
  - **Taken**: Mark as completed.
  - **Snooze**: Reschedule for a short period.
  - **Skip**: Mark as skipped with a reason.
- **Notification**: Reminder sent to the patient's registered health worker.

## 2. Follow-up Tracking
Support for ensuring the patient returns for necessary review.

### 2.1 Follow-up Requirements
A `FollowUp` is required when the treating doctor determines that the patient needs a subsequent check-up to verify recovery or treatment efficacy.

### 2.2 Follow-up Properties
- **Due Date**: The date the patient must return.
- **Purpose**: (e.g., "Review blood report", "Suture removal").
- **Required Facility**: Where the follow-up should happen.
- **Status**: `PENDING`, `COMPLETED`, `MISSED`, `OVERDUE`, `LOST_TO_FOLLOW_UP`.

### 2.3 The Closure Link
A referral cannot be marked as `CLOSED` until:
1. All required `MedicationPlan` durations are complete OR the doctor signs off.
2. All mandatory `FollowUp` records are marked as `COMPLETED`.

This ensures that "Closure" represents actual healthcare completion, not just a discharged patient.