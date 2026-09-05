# Demo Script - CareConnect Maharashtra

This document defines the exact scenario to be presented at the hackathon.

## 1. Primary Scenario: The Success Loop (USP)
**Objective**: Demonstrate the full closure of a referral.

- **Patient**: Savitri Patil, 46, Khodala.
- **Input**: "मला तीन दिवसांपासून ताप आहे आणि श्वास घेण्यास त्रास होतोय." (I have had a fever for three days and I'm having trouble breathing.)

### Step-by-Step Demo:
1. **Triage**: Input symptoms $\rightarrow$ AI identifies **HIGH PRIORITY** due to respiratory distress $\rightarrow$ Doctor confirms.
2. **Ranking**: System ranks facilities $\rightarrow$ Selects the closest verified District Hospital with an ICU/Pulmonologist.
3. **Referral**: Create referral $\rightarrow$ Status: `SENT`.
4. **Acceptance**: Switch to Facility view $\rightarrow$ Accept referral $\rightarrow$ Status: `ACCEPTED`.
5. **Arrival**: Mark patient as `ARRIVED`.
6. **Journey**: Quick-step through `CONSULTATION` and `DIAGNOSTICS`.
7. **Follow-up**: Schedule a check-up for 1 week later $\rightarrow$ Status: `FOLLOW_UP`.
8. **Closure**: Mark follow-up as completed $\rightarrow$ **Close Referral**.
9. **Result**: Show the Dashboard $\rightarrow$ Highlight that this referral contributed to the **Closure Rate**.

## 2. Secondary Scenario: The Reassignment Loop
**Objective**: Demonstrate robustness when a facility cannot take a patient.

1. **Referral**: Create referral to "Hospital A".
2. **Rejection**: "Hospital A" rejects due to "ICU Full".
3. **Re-ranking**: System automatically excludes "Hospital A" and suggests "Hospital B".
4. **Reassignment**: Doctor reassigns the patient to "Hospital B".
5. **Acceptance**: "Hospital B" accepts $\rightarrow$ Journey continues to closure.

## 3. Key Points to Emphasize
- **Not a Finder**: "We aren't just finding a hospital; we are ensuring Savitri actually gets treated."
- **Clinical Safety**: "The AI suggested high priority, but the doctor made the final call."
- **Closure**: "The referral is only closed when the follow-up is done, not when the patient leaves the building."
