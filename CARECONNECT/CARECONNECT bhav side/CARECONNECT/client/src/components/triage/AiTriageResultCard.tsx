import { useState } from "react";
import { 
  Bot, 
  ShieldAlert, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Stethoscope, 
  CheckCircle2, 
  X,
  FileText
} from "lucide-react";
import type { TriageResult, Priority, Role } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface AiTriageResultCardProps {
  result: TriageResult;
  currentUserRole: Role;
  onOverridePriority?: (newPriority: Priority, reason: string) => void;
}

export function AiTriageResultCard({
  result,
  currentUserRole,
  onOverridePriority
}: AiTriageResultCardProps) {
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(result.priority);
  const [justification, setJustification] = useState("");

  const canOverride = currentUserRole === "DOCTOR" || currentUserRole === "ADMIN";

  function handleSaveOverride() {
    if (!justification.trim()) return;
    onOverridePriority?.(selectedPriority, justification.trim());
    setOverrideModalOpen(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">AI Clinical Triage Assessment</h2>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Source: {result.source}
              </span>
            </div>
            <p className="text-xs text-slate-500">Decision support based on Maharashtra danger-sign protocols</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge value={result.priority} size="lg" />
          {canOverride && (
            <button
              onClick={() => setOverrideModalOpen(true)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
              title="Doctor Manual Override"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-700" /> Override
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Suggested Care Level Tier:
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge value={result.suggestedCareLevel} />
            <span className="text-xs text-slate-700 font-medium">
              {result.suggestedCareLevel === "TERTIARY" ? "Government Medical College / Super-Specialty" : result.suggestedCareLevel === "DISTRICT" ? "District Hospital / Civil Hospital" : "Primary Health Centre"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Required Clinical Services:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.relevantServices.map((svc, i) => (
              <span key={i} className="text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {svc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Reasoning */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Clinical Decision Support Reasoning:
        </span>
        <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-200">
          {result.reasoning}
        </p>
      </div>

      {/* Action Recommendation */}
      <div className="rounded-xl bg-teal-50/70 p-3.5 border border-teal-200 text-xs text-teal-950 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Recommended Immediate Action:</strong>
          <span className="text-teal-900 mt-0.5 block">{result.recommendedNextAction}</span>
        </div>
      </div>

      {/* CDSS Safety Disclaimer */}
      <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Safety Governance:</strong> {result.caution} The system provides algorithmic urgency grading, strictly excluding diagnostic claims and pharmacological prescriptions.
        </span>
      </div>

      {/* Doctor Manual Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Clinician Triage Override</h3>
              </div>
              <button onClick={() => setOverrideModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              As an authorized medical officer, you have full authority to override the AI urgency level. The override reason is logged in the referral audit trail.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Priority Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                    className={`p-2 rounded-xl text-xs font-bold border transition ${
                      selectedPriority === p
                        ? p === "HIGH" ? "bg-rose-600 text-white border-rose-600" : p === "MEDIUM" ? "bg-amber-600 text-white border-amber-600" : "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Clinical Override Justification (Mandatory):
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="e.g. Bedside exam reveals severe pallor and signs of impending decompensation not reflected in text..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                disabled={!justification.trim()}
                className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
