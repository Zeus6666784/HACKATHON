# Data Sources & Validation - CareConnect Maharashtra

To maintain clinical safety, the system distinguishes between trusted and untrusted data.

## 1. Source Hierarchy
Data is weighted based on its origin. In case of conflict, the higher source prevails.

1. **Government Sources (Highest)**: Official Maharashtra Health Department registries, NHM datasets.
2. **Official Healthcare Sources**: Hospital-provided capability lists, verified specialist registries.
3. **Public Datasets**: OpenStreetMap, public health directories.
4. **Synthetic/Demo Data**: Data created for the hackathon (marked clearly).

## 2. Verification Lifecycle
All facility data undergoes the following states:
- **`UNKNOWN`**: Initial state for newly added or missing data.
- **`UNVERIFIED`**: Data entered but not yet cross-checked.
- **`VERIFIED`**: Data confirmed via a second independent official source.

## 3. Validation Process
For a facility to be marked as `VERIFIED`, the following must be confirmed:
- **Coordinates**: Physical location verified via satellite/official address.
- **Services**: Capability to provide the listed service (e.g., ICU, Dialysis) verified.
- **Specialists**: Presence of qualified specialists verified.
- **Emergency**: 24/7 emergency capability confirmed.

## 4. Data Quality Checks
The system performs automatic checks on all data:
- **Coordinate Bounds**: Ensure coordinates are within Maharashtra state boundaries.
- **Logical Consistency**: A facility marked as `PHC` cannot have "Super-specialty" services.
- **Refresh Cycle**: Verified data is flagged for re-verification every 6 months.

## 5. Handling Unknown Values
- **Never Guess**: The system must never convert `UNKNOWN` data into `VERIFIED` based on AI inference.
- **UI Indication**: Facilities with `UNVERIFIED` or `UNKNOWN` data must be visually flagged in the UI (e.g., a warning icon).
- **Ranking Penalty**: `UNKNOWN` data receives a penalty multiplier in the ranking algorithm.
