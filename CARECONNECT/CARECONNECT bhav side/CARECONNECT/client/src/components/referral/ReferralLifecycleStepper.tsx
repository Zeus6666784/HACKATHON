import { Check, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReferralStatus } from "../../types";

const CANONICAL_STEPS: Array<{ id: ReferralStatus; label: string }> = [
  { id: "REFERRAL_SENT", label: "Referral Sent" },
  { id: "REFERRAL_ACCEPTED", label: "Facility Accepted" },
  { id: "PATIENT_ARRIVED", label: "Patient Arrived" },
  { id: "CONSULTATION_COMPLETED", label: "Consultation" },
  { id: "DIAGNOSTIC_COMPLETED", label: "Diagnostics" },
  { id: "FOLLOW_UP_REQUIRED", label: "Follow-up Set" },
  { id: "FOLLOW_UP_COMPLETED", label: "Follow-up Done" },
  { id: "CLOSED", label: "Care Closed" }
];

interface ReferralLifecycleStepperProps {
  currentStatus: ReferralStatus;
}

export function ReferralLifecycleStepper({ currentStatus }: ReferralLifecycleStepperProps) {
  const isRejected = currentStatus === "REFERRAL_REJECTED";
  const isOverdue = currentStatus === "OVERDUE" || currentStatus === "LOST_TO_FOLLOWUP";

  const currentIndex = CANONICAL_STEPS.findIndex((s) => s.id === currentStatus);
  const activeStepIndex = currentIndex !== -1 ? currentIndex : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Canonical Referral State Machine
          </h3>
          <p className="text-xs text-slate-500">
            Care journey progress monitored across state protocol gates.
          </p>
        </div>
        {isRejected && (
          <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800 border border-orange-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Rejection &amp; Re-routing
          </span>
        )}
        {currentStatus === "CLOSED" && (
          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Care Loop Completed
          </span>
        )}
      </div>

      {/* Responsive Stepper */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[720px] justify-between relative">
          {/* Connector Track */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />

          {CANONICAL_STEPS.map((step, idx) => {
            const isCompleted = activeStepIndex > idx || currentStatus === "CLOSED";
            const isCurrent = activeStepIndex === idx && currentStatus !== "CLOSED";

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                      : isCurrent
                      ? "bg-teal-700 text-white ring-4 ring-teal-100 animate-pulse"
                      : "bg-slate-100 text-slate-400 border border-slate-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-semibold whitespace-nowrap ${
                    isCompleted
                      ? "text-emerald-800"
                      : isCurrent
                      ? "text-teal-900 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
