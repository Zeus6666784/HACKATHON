# AI Triage - CareConnect Maharashtra

The AI Triage system provides decision support for healthcare workers to determine the urgency and required level of care for a patient.

## 1. Purpose and Scope
- **Purpose**: To assist in prioritizing patients and suggesting the correct care level (PHC, District, or Tertiary).
- **Constraint**: AI is for **Decision Support Only**. It does not diagnose diseases or prescribe treatments.

## 2. Triage Logic

### 2.1 Inputs
- Patient demographics (Age, Gender).
- Chief complaints/Symptoms (Natural language in English, Hindi, or Marathi).
- Basic context and location.
- Warning signs / Danger signs.
- Basic vitals (if available).

### 2.2 Priority Levels
- **HIGH**: Immediate danger. Requires urgent referral to a higher-level facility.
- **MEDIUM**: Urgent but stable. Requires referral within 24-48 hours.
- **LOW**: Non-urgent. Can be managed at PHC or scheduled for later.

### 2.3 Danger-Sign Reasoning
The AI is prompted to look for "Danger Signs" rather than disease keywords.
- **Respiratory**: Shortness of breath, cyanosis $\rightarrow$ HIGH.
- **Neurological**: Loss of consciousness, seizures $\rightarrow$ HIGH.
- **Cardiovascular**: Severe chest pain, shock $\rightarrow$ HIGH.
- **General**: High fever with altered mental state $\rightarrow$ HIGH.

## 3. Prompt Structure and Schema
The backend sends a system prompt that enforces the following JSON output schema:
```json
{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "suggested_care_level": "PHC" | "DISTRICT" | "TERTIARY",
  "relevant_services": ["Service A", "Service B"],
  "reasoning": "Based on [Danger Sign X], the patient requires [Y].",
  "recommended_next_action": "Immediate transfer to District Hospital",
  "caution": "Clinical verification required."
}
```

## 4. Safety Restrictions
- **No Diagnosing**: The AI is forbidden from saying "Patient has [Disease]" or claiming a confirmed diagnosis. It must say "These symptoms may require urgent professional evaluation" or "Symptoms are consistent with [Urgency]".
- **No Prescribing**: The AI cannot suggest any medication or dosage.
- **No Certainty**: Avoid words like "Confirmed", "Definitely", or "Diagnosed".

## 5. Fallback Mechanism (Rule-Based)
If the LLM API:
1. Is unavailable (Timeout/500).
2. Returns an invalid JSON schema.
3. Returns a prohibited term (e.g., "diagnose").

The system falls back to a **Hardcoded Danger-Sign Matrix**:
- If input contains `["breath", "chest pain", "unconscious"]` $\rightarrow$ Default to **HIGH**.
- Else if input contains `["fever", "pain"]` $\rightarrow$ Default to **MEDIUM**.
- Else $\rightarrow$ Default to **LOW**.

## 6. Testing and Validation
- **Synthetic Case Testing**: Use the provided healthcare case dataset to verify priority matching.
- **Adversarial Testing**: Try to force the AI to diagnose or prescribe to ensure safety filters work.
