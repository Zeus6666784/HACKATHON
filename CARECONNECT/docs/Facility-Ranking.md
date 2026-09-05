# Facility Ranking - CareConnect Maharashtra

The ranking system ensures patients are sent to the most appropriate facility based on clinical need and logistical feasibility.

## 1. Ranking Objectives
- **Emergency**: Minimize time to critical care.
- **Normal**: Maximize quality of care and accessibility.

## 2. The Ranking Algorithm (Deterministic)

The system calculates a **Suitability Score** ($S$) for each facility.

### 2.1 Scoring Factors
- **Capability Match ($C$)**: 
  - Exact match for required service (e.g., Cardiology): 100 points.
  - Partial match/General care: 50 points.
  - No match: 0 points (Facility disqualified).
- **Care Level Match ($L$)**:
  - Correct level (e.g., PHC $\rightarrow$ District Hospital): 50 points.
  - Over-qualified (e.g., PHC $\rightarrow$ Super-specialty): 20 points.
  - Under-qualified: 0 points (Disqualified).
- **Distance Factor ($D$)**:
  - Inverse linear scale based on km from patient location.
  - $D = \max(0, 100 - (\text{distance} \times \text{penalty\_rate}))$.
- **Verification Status ($V$)**:
  - `VERIFIED`: Multiplier $\times 1.2$.
  - `UNVERIFIED`: Multiplier $\times 1.0$.
  - `UNKNOWN`: Multiplier $\times 0.8$.
  - `SYNTHETIC`: Multiplier $\times 1.0$.

### 2.2 Final Score Formula
$$\text{Score} = (C + L + D) \times V$$

## 3. Workflow Variations

### 3.1 Emergency Referral
**Priority Order**: 
1. Appropriate emergency capability
2. Required care level
3. Required service
4. Referral suitability
5. Distance
6. Verified facility data

**Logic**: Filter for facilities with "Emergency Capability = True". Distance is a primary tie-breaker among capable facilities.
**Outcome**: The fastest route to the closest *capable* emergency center.

### 3.2 Normal Referral
**Priority Order**:
1. Required specialty/service
2. Care level
3. Distance
4. Diagnostics availability
5. Referral suitability
6. Verified information

**Logic**: Balanced weight between service quality and travel time.
**Outcome**: The most convenient high-quality facility.

## 4. Recommendation Output
The API must return more than just a list; it must provide an **Explanation**:
- **Facility Name**: "District Hospital, Palghar"
- **Rank**: 1
- **Score**: 245
- **Distance**: 12km
- **Matching Factors**: "Has required Cardiology unit, Verified data, appropriate Care Level."
- **Recommendation**: "Closest verified facility with required specialty."

## 5. Constraints
- **No Invention**: Facilities cannot be ranked based on guessed capabilities.
- **Disqualification**: Any facility with a score of 0 in $C$ or $L$ is removed from the list.
