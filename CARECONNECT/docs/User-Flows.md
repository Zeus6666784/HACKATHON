# User Flows - CareConnect Maharashtra

This document maps the exact interactions for every user role.

## 1. Health Worker Flow (Registration & Triage)
- **Entry Point**: Dashboard $\rightarrow$ "Register New Patient".
- **Step 1: Registration**: Input patient demographics $\rightarrow$ Validate $\rightarrow$ Save to DB.
- **Step 2: Symptom Collection**: Input chief complaints in Marathi/Hindi/English $\rightarrow$ Validate.
- **Step 3: AI Triage**: Submit symptoms $\rightarrow$ API call to AI Triage $\rightarrow$ Receive Priority and Care Level.
- **Step 4: Clinician Review**: Doctor reviews AI triage $\rightarrow$ Confirms or overrides priority.
- **Step 5: Referral Initiation**: Select "Create Referral" $\rightarrow$ View ranked facilities $\rightarrow$ Select facility $\rightarrow$ Submit.
- **Result**: Referral status becomes `SENT`. Notification sent to receiving facility.

## 2. Receiving Facility Flow (Acceptance & Arrival)
- **Entry Point**: Incoming Referrals Dashboard.
- **Step 1: Review**: Open pending referral $\rightarrow$ Review patient context and triage.
- **Step 2: Decision**: Click `ACCEPT` or `REJECT`.
  - **If REJECT**: Input reason (e.g., "Bed full", "Specialist unavailable") $\rightarrow$ Referral status becomes `REJECTED`.
  - **If ACCEPT**: Confirm capacity $\rightarrow$ Referral status becomes `ACCEPTED`.
- **Step 3: Arrival**: Patient arrives at facility $\rightarrow$ Staff marks "Patient Arrived" $\rightarrow$ Status becomes `ARRIVED`.
- **Result**: Referring provider notified of acceptance/arrival.

## 3. Doctor Flow (Consultation & Closure)
- **Entry Point**: My Patients/Referrals List.
- **Step 1: Consultation**: Mark `CONSULTATION` started $\rightarrow$ Input clinical notes.
- **Step 2: Diagnostics**: Order tests $\rightarrow$ Mark `DIAGNOSTICS` in progress $\rightarrow$ Mark as completed.
- **Step 3: Care Plan**: Define follow-up date and medication plan.
- **Step 4: Referral Closure**: Once all steps are done $\rightarrow$ Click "Close Referral" $\rightarrow$ Input final outcome $\rightarrow$ Status becomes `CLOSED`.
- **Result**: Full journey tracked; referring provider sees the closure.

## 4. Admin Flow (System Management)
- **Entry Point**: Admin Panel.
- **Step 1: Facility Management**: Add/Edit facility capabilities $\rightarrow$ Mark as `VERIFIED` after audit.
- **Step 2: Analytics**: View Dashboard $\rightarrow$ Analyze closure rates $\rightarrow$ Identify "Leakage" points.
- **Step 3: User Management**: Create accounts for health workers and doctors.
- **Result**: System data remains accurate and up-to-date.

## 5. Patient Flow (Passive)
- **Entry Point**: Physical interaction with Health Worker/Facility.
- **Step 1**: Registration via Health Worker.
- **Step 2**: Guided to the ranked facility.
- **Step 3**: Receives reminders for follow-up and medication via the health worker.
- **Step 4**: Care journey completed.
