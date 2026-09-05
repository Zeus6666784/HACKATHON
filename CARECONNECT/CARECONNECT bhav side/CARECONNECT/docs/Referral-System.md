# Referral System - CareConnect Maharashtra

The referral system is the core engine of CareConnect, implemented as a strict backend state machine to ensure data integrity and clinical safety.

## 1. Referral Lifecycle (State Machine)

### 1.1 States and Transitions
A referral must move through states in a linear or controlled fashion.

| Current State | Action | Next State | Permission |
|---|---|---|---|
| (None) | Create Referral | `CREATED` | Doctor/Health Worker |
| `CREATED` | Triage Patient | `TRIAGED` | Doctor/Health Worker |
| `TRIAGED` | Select Facility | `FACILITY_SELECTED` | Doctor/Health Worker |
| `FACILITY_SELECTED` | Send Referral | `REFERRAL_SENT` | Doctor/Health Worker |
| `REFERRAL_SENT` | Facility Accepts | `REFERRAL_ACCEPTED` | Facility Staff |
| `REFERRAL_SENT` | Facility Rejects | `REFERRAL_REJECTED` | Facility Staff |
| `REFERRAL_REJECTED` | Reassign Facility | `REFERRAL_SENT` | Doctor/Health Worker |
| `REFERRAL_ACCEPTED` | Patient Arrives | `PATIENT_ARRIVED` | Facility Staff |
| `PATIENT_ARRIVED` | Begin Consultation | `CONSULTATION_COMPLETED` | Doctor |
| `CONSULTATION_COMPLETED` | Order/Complete Tests | `DIAGNOSTIC_PENDING` | Doctor |
| `DIAGNOSTIC_PENDING` | Tests Completed | `DIAGNOSTIC_COMPLETED` | Doctor |
| `DIAGNOSTIC_COMPLETED` | Schedule Follow-up | `FOLLOW_UP_REQUIRED` | Doctor |
| `FOLLOW_UP_REQUIRED` | Complete Follow-up | `FOLLOW_UP_COMPLETED` | Doctor |
| `FOLLOW_UP_COMPLETED` | Close Referral | `CLOSED` | Doctor |
| `ANY` | Cancel Referral | `CANCELLED` | Admin/Doctor |
| `ANY` | Mark as Lost | `LOST_TO_FOLLOWUP` | Doctor/Admin |
| `ANY` | Mark Overdue | `OVERDUE` | System/Admin |

### 1.2 Terminal States
- **`CLOSED`**: Successfully completed care journey. (Target USP)
- **`LOST_TO_FOLLOWUP`**: Patient failed to arrive or attend follow-up.
- **`CANCELLED`**: Referral no longer needed.

## 2. Referral ID and Tracking
- **Referral ID**: Unique alphanumeric ID (e.g., `CC-MH-2026-XXXX`) generated at creation.
- **Tracking**: Every state transition is logged in the `ReferralEvent` collection.

## 3. Acceptance and Rejection Logic
- **Acceptance**: Requires facility to confirm current capacity for the required service.
- **Rejection**: Must include a **Rejection Reason** (e.g., "No ICU beds", "Specialist on leave").
- **Reassignment**: Upon rejection, the system triggers a re-ranking of available facilities excluding the rejecting one.

## 4. Audit Logging (ReferralEvents)
Every transition creates an event record with the following fields:
- `event_id`: Unique identifier for the event.
- `referral_id`: Reference to the referral.
- `event_type`: Type of event (e.g., `STATUS_CHANGE`, `REASSIGNMENT`).
- `timestamp`: ISO date of the event.
- `performed_by`: User who performed the action.
- `facility_id`: Facility involved in the event.
- `previous_status`: Status before the transition.
- `new_status`: Status after the transition.
- `notes`: Any clinical notes associated with the transition.

## 5. Notification Triggers
- `REFERRAL_SENT` $\rightarrow$ Notify Receiving Facility.
- `REFERRAL_ACCEPTED` $\rightarrow$ Notify Referring Provider.
- `PATIENT_ARRIVED` $\rightarrow$ Notify Referring Provider.
- `CLOSED` $\rightarrow$ Notify Referring Provider (Completion Loop).
- `OVERDUE` $\rightarrow$ Notify Doctor.
