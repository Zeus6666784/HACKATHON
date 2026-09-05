# Database Architecture - CareConnect Maharashtra

The system uses MongoDB with Mongoose for schema definition and validation.

## 1. Data Models

### 1.1 User
- **Purpose**: Authentication and Role Management.
- **Fields**:
  - `email` (String, Unique, Required)
  - `password` (String, Hashed, Required)
  - `role` (Enum: `ADMIN`, `DOCTOR`, `HEALTH_WORKER`, `FACILITY_STAFF`)
  - `facilityId` (Ref: `Facility`, Optional)
  - `name` (String, Required)

### 1.2 Patient
- **Purpose**: Demographic and clinical identity.
- **Fields**:
  - `patientId` (String, Unique, Required)
  - `name` (String, Required)
  - `age` (Number, Required)
  - `gender` (Enum: `M`, `F`, `O`)
  - `location` (String, Required)
  - `contact` (String)
  - `createdAt` (Date)

### 1.3 Facility
- **Purpose**: Healthcare resource directory.
- **Fields**:
  - `name` (String, Required)
  - `type` (Enum: `PHC`, `DISTRICT`, `TERTIARY`)
  - `coordinates` (Point: `[longitude, latitude]`)
  - `services` (Array of Strings)
  - `specialists` (Array of Strings)
  - `emergencyCapability` (Boolean)
  - `verificationState` (Enum: `VERIFIED`, `UNVERIFIED`, `UNKNOWN`, `SYNTHETIC`)
  - `source` (String)

### 1.4 Referral
- **Purpose**: The core state machine.
- **Fields**:
  - `referralId` (String, Unique, Required)
  - `patientId` (Ref: `Patient`, Required)
  - `fromFacilityId` (Ref: `Facility`, Required)
  - `toFacilityId` (Ref: `Facility`, Required)
  - `status` (Enum: `CREATED`, `TRIAGED`, `FACILITY_SELECTED`, `REFERRAL_SENT`, `REFERRAL_ACCEPTED`, `REFERRAL_REJECTED`, `PATIENT_ARRIVED`, `CONSULTATION_COMPLETED`, `DIAGNOSTIC_PENDING`, `DIAGNOSTIC_COMPLETED`, `FOLLOW_UP_REQUIRED`, `FOLLOW_UP_COMPLETED`, `CLOSED`, `LOST_TO_FOLLOWUP`, `CANCELLED`, `OVERDUE`)
  - `priority` (Enum: `HIGH`, `MEDIUM`, `LOW`)
  - `careLevel` (Enum: `PHC`, `DISTRICT`, `TERTIARY`)
  - `createdAt` (Date)
  - `updatedAt` (Date)

### 1.5 ReferralEvent
- **Purpose**: Audit log for every status change.
- **Fields**:
  - `event_id` (String, Unique, Required)
  - `referral_id` (Ref: `Referral`, Required)
  - `event_type` (String, Required)
  - `timestamp` (Date, Required)
  - `performed_by` (Ref: `User`, Required)
  - `facility_id` (Ref: `Facility`, Optional)
  - `previous_status` (String)
  - `new_status` (String)
  - `notes` (String)

### 1.6 TriageAssessment
- **Purpose**: Records of AI and human triage.
- **Fields**:
  - `patientId` (Ref: `Patient`, Required)
  - `symptoms` (String, Required)
  - `aiPriority` (String)
  - `confirmedPriority` (String)
  - `suggestedCareLevel` (String)
  - `reasoning` (String)
  - `doctorId` (Ref: `User`)

### 1.7 FollowUp
- **Purpose**: Post-consultation tracking.
- **Fields**:
  - `referralId` (Ref: `Referral`, Required)
  - `dueDate` (Date, Required)
  - `purpose` (String)
  - `status` (Enum: `PENDING`, `COMPLETED`, `MISSED`, `OVERDUE`, `LOST`)
  - `completedAt` (Date)

### 1.8 MedicationPlan
- **Purpose**: Medication instructions.
- **Fields**:
  - `referralId` (Ref: `Referral`, Required)
  - `prescribedBy` (Ref: `User`, Required)
  - `medicines` (Array: { `name`, `dosage`, `frequency`, `instructions`, `startDate`, `endDate` })

### 1.9 MedicationReminder
- **Purpose**: Individual reminder events.
- **Fields**:
  - `planId` (Ref: `MedicationPlan`, Required)
  - `scheduledTime` (Date, Required)
  - `status` (Enum: `SCHEDULED`, `TAKEN`, `SKIPPED`, `SNOOZED`)

### 1.10 Notification
- **Purpose**: System alerts.
- **Fields**:
  - `userId` (Ref: `User`, Required)
  - `message` (String, Required)
  - `type` (Enum: `INFO`, `WARNING`, `URGENT`)
  - `isRead` (Boolean, Default: false)

### 1.11 AuditLog
- **Purpose**: General system security audit.
- **Fields**:
  - `userId` (Ref: `User`)
  - `action` (String)
  - `resource` (String)
  - `timestamp` (Date)
  - `ipAddress` (String)

## 2. Indexes
- `Referral(status)`: For dashboard filtering.
- `Patient(patientId)`: Unique index.
- `Facility(coordinates)`: 2dsphere index for distance queries.
- `ReferralEvent(referralId)`: For timeline retrieval.
