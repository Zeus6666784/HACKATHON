import { PIPELINE, statusLabel } from "@/lib/labels";
import { STATUS_ORDER, type ReferralStatus } from "@/lib/constants";

export function JourneyRail({ status, locale }: { status: string; locale?: string }) {
  const current = STATUS_ORDER[status as ReferralStatus] ?? 0;
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1" aria-label="Referral continuity stages">
      {PIPELINE.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={step} className="min-w-[4.2rem] flex-1">
            <div
              className={`h-1.5 rounded-full ${done ? "bg-accent" : "bg-cyan-100"} ${active ? "ring-2 ring-primary/40" : ""}`}
            />
            <p className={`mt-1 text-[10px] leading-tight ${active ? "font-semibold text-primary" : "text-cyan-800/70"}`}>
              {statusLabel(locale, step)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
