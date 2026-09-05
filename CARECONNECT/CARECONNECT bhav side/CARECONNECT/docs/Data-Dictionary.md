# Data Dictionary - CareConnect Maharashtra

This document provides a granular definition of all key fields used across the system.

## 1. Core Entity Fields

| Field Name | Entity | Type | Required | Description | Allowed Values / Example | Sensitivity |
|---|---|---|---|---|---|---|
| `patientId` | Patient | String | Yes | Unique identifier | `PAT-10293` | Medium |
| `name` | Patient | String | Yes | Full legal name | `Savitri Patil` | Medium |
| `age` | Patient | Number | Yes | Patient's age in years | `46` | Low |
| `location` | Patient | String | Yes | Village/Town name | `Khodala` | Low |
| `referralId` | Referral | String | Yes | Unique referral ID | `CC-MH-2026-001` | Medium |
| `status` | Referral | Enum | Yes | Current state of journey | `SENT`, `ACCEPTED`, `CLOSED`, etc. | Low |
| `priority` | Referral | Enum | Yes | Urgency of care | `HIGH`, `MEDIUM`, `LOW` | Medium |
| `careLevel` | Referral | Enum | Yes | Facility tier required | `PHC`, `DISTRICT`, `TERTIARY` | Low |
| `verificationState`| Facility | Enum | Yes | Data trust level | `VERIFIED`, `UNVERIFIED`, `UNKNOWN` | Low |
| `emergencyCapability`| Facility | Boolean | Yes | Can handle critical emergencies | `true`, `false` | Low |
| `coordinates` | Facility | Point | Yes | Geo-location [lon, lat] | `[73.1, 19.2]` | Low |
| `symptoms` | Triage | String | Yes | Patient's complaints | "Fever and cough" | High |
| `reasoning` | Triage | String | Yes | Logic for priority | "Respiratory distress noted" | Medium |
| `dueDate` | FollowUp | Date | Yes | When patient should return | `2026-10-15` | Low |
| `medicineName` | MedPlan | String | Yes | Name of the drug | `Paracetamol` | High |
| `dosage` | MedPlan | String | Yes | Amount to be taken | `500mg` | High |

## 2. Verification States Defined
- **`VERIFIED`**: Data cross-checked against official government healthcare registries.
- **`UNVERIFIED`**: Data collected via self-reporting or public datasets, not yet audited.
- **`UNKNOWN`**: Field is empty or data is missing; no assumption can be made.

## 3. Sensitivity Levels
- **Low**: Publicly available or non-identifying (e.g., facility names, care levels).
- **Medium**: Personally identifying but not clinically sensitive (e.g., names, ages).
- **High**: Clinically sensitive (e.g., symptoms, medication plans, diagnosis).

## 4. Validation Rules
- **Dates**: Must not be in the past for `dueDate`.
- **Enum Values**: Strictly enforced via Mongoose and Zod.
- **Coordinates**: Must be within the geographic bounds of Maharashtra.
