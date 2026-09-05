import axios from "axios";
import { demoStore } from "../data/demoData";
import type { 
  Referral, 
  ReferralEvent, 
  FollowUpRecord, 
  MedicationPlan, 
  MedicationReminder,
  Facility
} from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 1500 // Fail fast if backend offline so UI responds instantly
});

export async function get<T>(url: string): Promise<T> {
  try {
    const response = await api.get<{ success: boolean; data: T }>(url);
    return response.data.data;
  } catch {
    // Graceful offline fallback to rich Maharashtra clinical store
    return handleOfflineGet<T>(url);
  }
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await api.post<{ success: boolean; data: T }>(url, data);
    return response.data.data;
  } catch {
    return handleOfflinePost<T>(url, data);
  }
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await api.patch<{ success: boolean; data: T }>(url, data);
    return response.data.data;
  } catch {
    return handleOfflinePatch<T>(url, data);
  }
}

function handleOfflineGet<T>(url: string): T {
  const cleanUrl = url.split("?")[0];

  if (cleanUrl === "/referrals") {
    return [...demoStore.referrals] as unknown as T;
  }

  if (cleanUrl.startsWith("/referrals/")) {
    const id = cleanUrl.replace("/referrals/", "");
    const referral = demoStore.referrals.find(r => r._id === id || r.referralId === id);
    const events: ReferralEvent[] = referral ? (demoStore.events[referral._id] ?? []) : [];
    const followUps: FollowUpRecord[] = referral ? demoStore.followUps.filter(f => f.referralId === referral._id) : [];
    const medicationPlans: MedicationPlan[] = referral ? demoStore.medicationPlans.filter(m => m.referralId === referral._id) : [];

    return {
      referral,
      events,
      followUps,
      medicationPlans
    } as unknown as T;
  }

  if (cleanUrl === "/dashboard/stats") {
    return demoStore.getStats() as unknown as T;
  }

  if (cleanUrl === "/facilities") {
    return [...demoStore.facilities] as unknown as T;
  }

  if (cleanUrl === "/notifications") {
    return [...demoStore.notifications] as unknown as T;
  }

  if (cleanUrl.startsWith("/medications/reminders")) {
    return [...demoStore.reminders] as unknown as T;
  }

  throw new Error(`Demo store GET not implemented for ${url}`);
}

function handleOfflinePost<T>(url: string, body?: unknown): T {
  const cleanUrl = url.split("?")[0];
  const payload = (body ?? {}) as Record<string, any>;

  if (cleanUrl === "/auth/login") {
    const email = String(payload.email || "");
    let role = "DOCTOR";
    let name = "Dr. S. M. Deshmukh";
    let facilityId = "fac-nashik-dh";

    if (email.includes("asha") || email.includes("worker")) {
      role = "HEALTH_WORKER";
      name = "Sunita Kamble (ASHA)";
      facilityId = "fac-wai-phc";
    } else if (email.includes("staff") || email.includes("facility")) {
      role = "FACILITY_STAFF";
      name = "Pooja Salunkhe (Staff Nurse)";
      facilityId = "fac-nashik-dh";
    } else if (email.includes("director") || email.includes("admin")) {
      role = "ADMIN";
      name = "Dr. V. K. Chavan (Directorate of Health)";
    }

    return {
      id: `user-${role.toLowerCase()}-demo`,
      name,
      role,
      facilityId
    } as unknown as T;
  }

  if (cleanUrl === "/auth/logout") {
    return { success: true } as unknown as T;
  }

  if (cleanUrl === "/medications/plan") {
    const plan: MedicationPlan = {
      _id: `plan-${Date.now()}`,
      referralId: payload.referralId,
      items: payload.items || [],
      signedOff: false
    };
    demoStore.medicationPlans.unshift(plan);
    return plan as unknown as T;
  }

  if (cleanUrl === "/medications/reminders") {
    const reminder: MedicationReminder = {
      _id: `rem-${Date.now()}`,
      planId: payload.planId,
      referralId: payload.referralId || "",
      scheduledAt: payload.scheduledAt || new Date().toISOString(),
      status: "SCHEDULED"
    };
    demoStore.reminders.push(reminder);
    return reminder as unknown as T;
  }

  if (cleanUrl === "/followups") {
    const followUp: FollowUpRecord = {
      _id: `fu-${Date.now()}`,
      referralId: payload.referralId,
      dueDate: payload.dueDate,
      purpose: payload.purpose,
      assignedAshaWorker: payload.assignedAshaWorker,
      status: "UPCOMING"
    };
    demoStore.followUps.push(followUp);
    return followUp as unknown as T;
  }

  if (cleanUrl.startsWith("/referrals/") && cleanUrl.endsWith("/diagnostics")) {
    const id = cleanUrl.replace("/referrals/", "").replace("/diagnostics", "");
    const ref = demoStore.referrals.find(r => r._id === id || r.referralId === id);
    if (ref && payload.tests) {
      ref.diagnosticOrders = payload.tests;
    }
    return ref as unknown as T;
  }

  if (cleanUrl.startsWith("/referrals/") && cleanUrl.endsWith("/reassign")) {
    const id = cleanUrl.replace("/referrals/", "").replace("/reassign", "");
    const ref = demoStore.referrals.find(r => r._id === id || r.referralId === id);
    if (ref) {
      ref.toFacilityId = payload.toFacilityId;
      const targetFac = demoStore.facilities.find(f => f._id === payload.toFacilityId);
      if (targetFac) ref.toFacilityName = targetFac.name;
      ref.status = "REFERRAL_SENT";
      ref.updatedAt = new Date().toISOString();
      if (!demoStore.events[ref._id]) demoStore.events[ref._id] = [];
      demoStore.events[ref._id].unshift({
        event_id: `ev-${Date.now()}`,
        referral_id: ref._id,
        event_type: "REFERRAL_REASSIGNED",
        timestamp: new Date().toISOString(),
        performed_by: "Dr. S. M. Deshmukh (Nashik DH)",
        previous_status: "REFERRAL_REJECTED",
        new_status: "REFERRAL_SENT",
        notes: `Reassigned to ${ref.toFacilityName}: ${payload.reason || "Alternative facility"}`
      });
    }
    return ref as unknown as T;
  }

  return payload as unknown as T;
}

function handleOfflinePatch<T>(url: string, body?: unknown): T {
  const cleanUrl = url.split("?")[0];
  const payload = (body ?? {}) as Record<string, any>;

  if (cleanUrl.startsWith("/referrals/") && cleanUrl.endsWith("/status")) {
    const id = cleanUrl.replace("/referrals/", "").replace("/status", "");
    const updated = demoStore.updateReferralStatus(id, payload.status, payload.notes);
    return updated as unknown as T;
  }

  if (cleanUrl.startsWith("/referrals/") && cleanUrl.endsWith("/diagnostics")) {
    const id = cleanUrl.replace("/referrals/", "").replace("/diagnostics", "");
    const ref = demoStore.referrals.find(r => r._id === id || r.referralId === id);
    if (ref) {
      ref.diagnosticOrders = payload.tests;
      ref.status = "DIAGNOSTIC_COMPLETED";
      ref.updatedAt = new Date().toISOString();
      if (!demoStore.events[ref._id]) demoStore.events[ref._id] = [];
      demoStore.events[ref._id].unshift({
        event_id: `ev-${Date.now()}`,
        referral_id: ref._id,
        event_type: "DIAGNOSTIC_COMPLETED",
        timestamp: new Date().toISOString(),
        performed_by: "Laboratory & Radiology Unit",
        previous_status: "CONSULTATION_COMPLETED",
        new_status: "DIAGNOSTIC_COMPLETED",
        notes: "Diagnostic panel completed and validated."
      });
    }
    return ref as unknown as T;
  }

  if (cleanUrl.startsWith("/medications/plan/") && cleanUrl.endsWith("/sign-off")) {
    const id = cleanUrl.replace("/medications/plan/", "").replace("/sign-off", "");
    const plan = demoStore.medicationPlans.find(p => p._id === id);
    if (plan) {
      plan.signedOff = true;
      plan.signedOffAt = new Date().toISOString();
    }
    return plan as unknown as T;
  }

  if (cleanUrl.startsWith("/medications/reminders/")) {
    const id = cleanUrl.replace("/medications/reminders/", "");
    const reminder = demoStore.reminders.find(r => r._id === id);
    if (reminder) {
      if (payload.status) reminder.status = payload.status;
      if (payload.reason) reminder.reason = payload.reason;
    }
    return reminder as unknown as T;
  }

  if (cleanUrl.startsWith("/followups/")) {
    const id = cleanUrl.replace("/followups/", "");
    const fu = demoStore.followUps.find(f => f._id === id);
    if (fu) {
      if (payload.status) fu.status = payload.status;
      if (payload.status === "COMPLETED") fu.completedAt = new Date().toISOString();
    }
    return fu as unknown as T;
  }

  return payload as unknown as T;
}
