import type { Priority, ReferralStatus } from "../types";

const tone: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CREATED: "bg-slate-100 text-slate-700 border-slate-200",
  TRIAGED: "bg-blue-100 text-blue-700 border-blue-200",
  FACILITY_SELECTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  REFERRAL_SENT: "bg-cyan-100 text-cyan-700 border-cyan-200",
  REFERRAL_ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REFERRAL_REJECTED: "bg-orange-100 text-orange-700 border-orange-200",
  PATIENT_ARRIVED: "bg-violet-100 text-violet-700 border-violet-200",
  CONSULTATION_COMPLETED: "bg-teal-100 text-teal-700 border-teal-200",
  DIAGNOSTIC_PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DIAGNOSTIC_COMPLETED: "bg-sky-100 text-sky-700 border-sky-200",
  FOLLOW_UP_REQUIRED: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  FOLLOW_UP_COMPLETED: "bg-lime-100 text-lime-700 border-lime-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
  LOST_TO_FOLLOWUP: "bg-rose-100 text-red-800 border-red-200",
  CANCELLED: "bg-stone-200 text-stone-700 border-stone-300",
  CLOSED: "bg-emerald-200 text-emerald-900 border-emerald-300",
  VERIFIED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UNVERIFIED: "bg-amber-100 text-amber-700 border-amber-200",
  UNKNOWN: "bg-slate-100 text-slate-700 border-slate-200",
  SYNTHETIC: "bg-sky-100 text-sky-700 border-sky-200"
};

export function StatusBadge({ value }: { value: Priority | ReferralStatus | string }) {
  const label = String(value).replace(/_/g, " ");
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tone[String(value)] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {label}
    </span>
  );
}
