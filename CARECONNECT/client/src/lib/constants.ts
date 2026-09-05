export const ROLES = {
  HEALTH_WORKER: "HEALTH_WORKER",
  PATIENT: "PATIENT",
  FACILITY_STAFF: "FACILITY_STAFF",
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STATUSES = [
  "CREATED",
  "TRIAGED",
  "REFERRED",
  "APPOINTMENT",
  "CONSULTATION",
  "FOLLOW_UP",
  "CLOSED",
] as const;

export type ReferralStatus = (typeof STATUSES)[number];

export const STATUS_ORDER: Record<ReferralStatus, number> = {
  CREATED: 0,
  TRIAGED: 1,
  REFERRED: 2,
  APPOINTMENT: 3,
  CONSULTATION: 4,
  FOLLOW_UP: 5,
  CLOSED: 6,
};

export const NEXT_STATUS: Partial<Record<ReferralStatus, ReferralStatus>> = {
  CREATED: "TRIAGED",
  TRIAGED: "REFERRED",
  REFERRED: "APPOINTMENT",
  APPOINTMENT: "CONSULTATION",
  CONSULTATION: "FOLLOW_UP",
  FOLLOW_UP: "CLOSED",
};

export const PRIORITIES = ["EMERGENCY", "URGENT", "ROUTINE"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CARE_LEVELS = ["SC", "PHC", "RH", "SDH", "DH"] as const;
export type CareLevel = (typeof CARE_LEVELS)[number];

export const CARE_LEVEL_RANK: Record<string, number> = {
  SC: 1,
  PHC: 2,
  RH: 3,
  SDH: 4,
  DH: 5,
};

export const SERVICES = [
  "general",
  "maternal",
  "pediatric",
  "emergency",
  "lab",
  "imaging",
  "tb",
  "ncd",
  "mental",
  "surgery",
] as const;

export const COOKIE_NAME = "cc_session";
export const SESSION_HOURS = 12;

export const LOCALES = ["en", "hi", "mr"] as const;
export type Locale = (typeof LOCALES)[number];
