import { t, type MessageKey } from "./i18n";
import type { ReferralStatus } from "./constants";

export function statusLabel(locale: string | undefined, status: string) {
  const map: Record<string, MessageKey> = {
    CREATED: "created",
    TRIAGED: "triaged",
    REFERRED: "referred",
    APPOINTMENT: "appointment",
    CONSULTATION: "consultation",
    FOLLOW_UP: "followUp",
    CLOSED: "closedStatus",
  };
  return t(locale, map[status] ?? "status");
}

export function priorityLabel(locale: string | undefined, priority: string | null) {
  if (priority === "EMERGENCY") return t(locale, "emergency");
  if (priority === "URGENT") return t(locale, "urgent");
  if (priority === "ROUTINE") return t(locale, "routine");
  return "—";
}

export function serviceLabel(locale: string | undefined, service: string) {
  const map: Record<string, MessageKey> = {
    general: "general",
    maternal: "maternal",
    pediatric: "pediatric",
    emergency: "emergencySvc",
    lab: "lab",
    imaging: "imaging",
    tb: "tb",
    ncd: "ncd",
    mental: "mental",
    surgery: "surgery",
  };
  return t(locale, map[service] ?? "service");
}

export function levelLabel(locale: string | undefined, level: string) {
  const map: Record<string, MessageKey> = {
    SC: "sc",
    PHC: "phc",
    RH: "rh",
    SDH: "sdh",
    DH: "dh",
  };
  return t(locale, map[level] ?? "careLevel");
}

export const PIPELINE: ReferralStatus[] = [
  "CREATED",
  "TRIAGED",
  "REFERRED",
  "APPOINTMENT",
  "CONSULTATION",
  "FOLLOW_UP",
  "CLOSED",
];
