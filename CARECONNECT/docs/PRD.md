# Product Requirements Document (PRD) - CareConnect Maharashtra

## 1. Project Vision
CareConnect Maharashtra is not a hospital finder or an AI doctor. It is a **referral-continuity layer** designed to ensure that rural patients referred to higher-level healthcare facilities actually complete their required care journey. 

**Tagline:** "From first contact to completed care."

## 2. Problem Statement
In rural Maharashtra, many patients are referred from Primary Health Centres (PHCs) to District Hospitals or Specialist Centres. However, there is a significant "leakage" in this process where patients fail to arrive at the destination, miss follow-ups, or the referring doctor never knows if the patient was treated. This lack of closure leads to poor health outcomes and fragmented care.

## 3. Target Users
- **Patient**: The individual receiving care (represented in the system).
- **Health Worker (ASHAs/ANMs)**: Assists in patient registration and triage.
- **Facility Admin/Staff**: Manages referral acceptance and patient arrival.
- **Doctor (Referring & Receiving)**: Handles triage, consultation, and closure.
- **System Admin**: Manages facility data and system health.

## 4. User Needs
- **Referring Provider**: Needs a way to find the *right* facility quickly and know if the patient arrived.
- **Receiving Facility**: Needs advance notice of incoming patients and their clinical context.
- **Patient**: Needs clear guidance on where to go and reminders for follow-ups.
- **Health System**: Needs data on referral closure rates to identify systemic bottlenecks.

## 5. Product Goals
- **Referral Tracking**: Implement a rigorous state machine for referrals (Created $\rightarrow$ Triaged $\rightarrow$ Facility Selected $\rightarrow$ Sent $\rightarrow$ Accepted $\rightarrow$ Arrived $\rightarrow$ Consultation $\rightarrow$ Diagnostics $\rightarrow$ Follow-up $\rightarrow$ Closed).
- **AI-Assisted Triage**: Provide a safety-first triage tool to determine urgency and care level without diagnosing.
- **Facility Intelligence**: Rank facilities based on verified capabilities, care level, and distance, explaining *why* a facility was recommended.
- **Closure Loop**: Ensure every referral reaches a terminal state (Closed, Lost-to-follow-up, or Cancelled).

## 6. Non-Goals
- **NOT** a diagnostic tool: The system will not name diseases.
- **NOT** a prescription engine: The system will not suggest medications, determine dosage, or modify a doctor's plan.
- **NOT** a replacement for ABDM or eSanjeevani: It complements them by focusing on the referral journey.

## 7. Core Feature Set
- **AI Triage**: Symptom-based priority (High/Med/Low) and care level recommendation with a deterministic rule-based fallback.
- **Facility Ranking**: Deterministic ranking for Emergency and Normal referrals based on specific priority criteria.
- **Referral Management**: Full lifecycle tracking including acceptance/rejection and reassignment.
- **Follow-up & Medication**: Clinician-led medication reminders (Taken/Snooze/Skip) and follow-up tracking.
- **Multilingual Support**: English, Hindi, and Marathi.
- **Dashboard**: Metrics on closure rates and priority distribution derived from real referral records.

## 8. Core USP: Referral Closure
The defining feature of CareConnect is the **Closure Loop**. Unlike simple referral apps, CareConnect treats a referral as "open" until the receiving facility confirms the final outcome and the referring provider is notified, or the patient is marked as lost-to-follow-up.

## 9. Healthcare Safety & Constraints
- **No AI Diagnosis**: AI must use "danger-sign" reasoning.
- **Clinician-in-the-loop**: All critical decisions (triage result, facility choice, medication) must be verified by a human professional.
- **Data Integrity**: Distinguish between VERIFIED, UNVERIFIED, UNKNOWN, and SYNTHETIC facility data.

## 10. Success Metrics
- **Closure Rate**: % of referrals that reach the "Closed" state.
- **Lead Time**: Average time from Referral Creation to Closure.
- **Leakage Point**: Identification of the state where most patients drop out.

## 11. Hackathon Constraints
- **Development Time**: ~6-7 hours.
- **Priority**: P0 (Core Referral Flow & Closure) $\rightarrow$ P1 (AI/Ranking/Multilingual) $\rightarrow$ P2 (Polish/Offline).
- **Demo**: Must showcase a synthetic patient journey from triage to closure.
