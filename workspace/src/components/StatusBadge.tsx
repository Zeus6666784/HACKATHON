import { priorityLabel, statusLabel } from "@/lib/labels";

export function StatusBadge({ status, locale }: { status: string; locale?: string }) {
  const tones: Record<string, string> = {
    CREATED: "bg-slate-100 text-slate-800",
    TRIAGED: "bg-cyan-100 text-cyan-900",
    REFERRED: "bg-sky-100 text-sky-900",
    APPOINTMENT: "bg-amber-100 text-amber-900",
    CONSULTATION: "bg-emerald-100 text-emerald-900",
    FOLLOW_UP: "bg-teal-100 text-teal-900",
    CLOSED: "bg-green-100 text-green-900",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] ?? "bg-slate-100"}`}
    >
      {statusLabel(locale, status)}
    </span>
  );
}

export function PriorityBadge({ priority, locale }: { priority: string | null; locale?: string }) {
  if (!priority) return null;
  const tones: Record<string, string> = {
    EMERGENCY: "bg-red-100 text-red-800 ring-1 ring-red-300",
    URGENT: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
    ROUTINE: "bg-cyan-50 text-cyan-900 ring-1 ring-cyan-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[priority]}`}>
      {priorityLabel(locale, priority)}
    </span>
  );
}

export function SyntheticMark({ localeLabel }: { localeLabel: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
      {localeLabel}
    </span>
  );
}
