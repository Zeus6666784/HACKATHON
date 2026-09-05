export type Role = "ADMIN" | "DOCTOR" | "HEALTH_WORKER" | "FACILITY_STAFF";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type CareLevel = "PHC" | "DISTRICT" | "TERTIARY";

export type Patient = {
  _id: string;
  patientId: string;
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  location: string;
  contact?: string;
};

export type TriageResult = {
  priority: Priority;
  suggestedCareLevel: CareLevel;
  relevantServices: string[];
  reasoning: string;
  recommendedNextAction: string;
  caution: string;
  source: "AI" | "FALLBACK";
  assessmentId: string;
};

export type ReferralStatus =
  | "CREATED" | "TRIAGED" | "FACILITY_SELECTED" | "REFERRAL_SENT"
  | "REFERRAL_ACCEPTED" | "REFERRAL_REJECTED" | "PATIENT_ARRIVED"
  | "CONSULTATION_COMPLETED" | "DIAGNOSTIC_PENDING" | "DIAGNOSTIC_COMPLETED"
  | "FOLLOW_UP_REQUIRED" | "FOLLOW_UP_COMPLETED" | "OVERDUE"
  | "LOST_TO_FOLLOWUP" | "CANCELLED" | "CLOSED";
