export type Role = "ADMIN" | "DOCTOR" | "HEALTH_WORKER" | "FACILITY_STAFF";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type CareLevel = "PHC" | "DISTRICT" | "TERTIARY";
export type VerificationState = "VERIFIED" | "UNVERIFIED" | "UNKNOWN" | "SYNTHETIC";

export type Vitals = {
  heartRate: number;            // bpm
  bloodPressureSystolic: number;// mmHg
  bloodPressureDiastolic: number;// mmHg
  oxygenSaturation: number;     // % SpO2
  temperature: number;          // °F
  respiratoryRate: number;      // breaths/min
  recordedAt?: string;
};

export type Patient = {
  _id: string;
  patientId: string;
  abhaId?: string;
  name: string;
  marathiName?: string;
  age: number;
  gender: "M" | "F" | "O";
  location: string;
  district?: string;
  contact?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  vitals?: Vitals;
  dangerSigns?: string[];
  createdAt?: string;
};

export type FacilityBreakdown = {
  capabilityScore: number;
  careLevelScore: number;
  distanceScore: number;
  verificationMultiplier: number;
  explanation: string;
};

export type Facility = {
  _id: string;
  name: string;
  type: CareLevel;
  services: string[];
  specialists?: string[];
  emergencyCapability: boolean;
  verificationState: VerificationState;
  source?: string;
  coordinates?: [number, number];
  score?: number;
  distanceKm?: number;
  district?: string;
  totalBeds?: number;
  icuBedsAvailable?: number;
  oxygenBedsAvailable?: number;
  ambulancePhone?: string;
  nodalOfficer?: string;
  nodalOfficerPhone?: string;
  breakdown?: FacilityBreakdown;
};

export type ManualOverride = {
  previousPriority: Priority;
  newPriority: Priority;
  overriddenBy: string;
  overriddenRole: Role;
  justification: string;
  timestamp: string;
};

export type TriageResult = {
  priority: Priority;
  suggestedCareLevel: CareLevel;
  relevantServices: string[];
  reasoning: string;
  recommendedNextAction: string;
  caution: string;
  source: "AI" | "FALLBACK";
  confidenceScore?: number;
  dangerSignsDetected?: string[];
  assessmentId?: string;
  manualOverride?: ManualOverride;
};

export type ReferralStatus =
  | "CREATED"
  | "TRIAGED"
  | "FACILITY_SELECTED"
  | "REFERRAL_SENT"
  | "REFERRAL_ACCEPTED"
  | "REFERRAL_REJECTED"
  | "PATIENT_ARRIVED"
  | "CONSULTATION_COMPLETED"
  | "DIAGNOSTIC_PENDING"
  | "DIAGNOSTIC_COMPLETED"
  | "FOLLOW_UP_REQUIRED"
  | "FOLLOW_UP_COMPLETED"
  | "OVERDUE"
  | "LOST_TO_FOLLOWUP"
  | "CANCELLED"
  | "CLOSED";

export type MedicationItem = {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  prescribedBy: string;
  status: "ACTIVE" | "COMPLETED" | "DISCONTINUED";
};

export type FollowUpRecord = {
  id: string;
  dueDate: string;
  purpose: string;
  requiredFacilityName: string;
  status: "UPCOMING" | "DUE" | "COMPLETED" | "MISSED" | "OVERDUE";
  notes?: string;
  completedDate?: string;
  assignedAshaWorker?: string;
};

export type Referral = {
  _id: string;
  referralId: string;
  patientId: string;
  fromFacilityId: string;
  fromFacilityName?: string;
  toFacilityId: string;
  toFacilityName?: string;
  status: ReferralStatus;
  priority: Priority;
  careLevel: CareLevel;
  chiefComplaint?: string;
  rejectionReason?: string;
  clinicalNotes?: string;
  medications?: MedicationItem[];
  followUps?: FollowUpRecord[];
  dischargedOutcome?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ReferralEvent = {
  event_id: string;
  referral_id?: string;
  event_type: string;
  timestamp: string;
  performed_by?: string;
  performed_by_role?: string;
  facility_id?: string;
  facility_name?: string;
  previous_status?: ReferralStatus | string;
  new_status?: ReferralStatus;
  notes?: string;
};

export type DashboardStats = {
  totalReferrals: number;
  activeInTransit: number;
  closedLoops: number;
  closureRate: number; // %
  overdueCount: number;
  leakageRate: number; // %
  avgTransferTimeHours: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  careLevelBreakdown: {
    phc: number;
    district: number;
    tertiary: number;
  };
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "URGENT" | "INFO" | "SUCCESS" | "WARNING";
  timestamp: string;
  referralId?: string;
  read: boolean;
};
