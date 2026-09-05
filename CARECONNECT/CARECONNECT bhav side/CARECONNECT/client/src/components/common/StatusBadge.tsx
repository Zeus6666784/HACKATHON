import type { Priority, ReferralStatus } from "../../types";

const colors: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700 border-rose-200", MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200", CLOSED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REFERRAL_REJECTED: "bg-orange-100 text-orange-700 border-orange-200", OVERDUE: "bg-rose-100 text-rose-700 border-rose-200"
};
export function StatusBadge({ value, size = "md", showIcon: _showIcon }: { value: Priority | ReferralStatus | string; size?: "sm" | "md" | "lg"; showIcon?: boolean }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 font-semibold ${size === "sm" ? "text-[11px]" : "text-xs"} ${colors[value] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>{value.replace(/_/g, " ")}</span>;
}
