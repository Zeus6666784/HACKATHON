import { useState } from "react";
import { 
  Stethoscope, 
  FileCheck, 
  Calendar, 
  CheckCheck, 
  ShieldCheck, 
  Pill, 
  Plus, 
  Trash2,
  Clock,
  UserCheck,
  AlertCircle
} from "lucide-react";
import type { Referral, ReferralStatus, Role, MedicationItem, FollowUpRecord } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface ClinicalCareJourneyProps {
  referral: Referral;
  currentUserRole: Role;
  onUpdateStatus: (referralId: string, status: ReferralStatus, notes?: string) => Promise<void>;
  onSaveDiagnostics: (referralId: string, tests: Array<{ name: string; result?: string }>) => Promise<void>;
  onSaveMedicationPlan?: (referralId: string, items: MedicationItem[]) => Promise<void>;
  onCreateFollowUp?: (referralId: string, input: { dueDate: string; purpose: string; assignedAshaWorker?: string }) => Promise<void>;
  onCompleteFollowUp?: (followUpId: string) => Promise<void>;
  medicationItems?: MedicationItem[];
  followUp?: FollowUpRecord;
}

export function ClinicalCareJourney({
  referral,
  currentUserRole,
  onUpdateStatus,
  onSaveDiagnostics,
  onSaveMedicationPlan,
  onCreateFollowUp,
  onCompleteFollowUp,
  medicationItems = [],
  followUp
}: ClinicalCareJourneyProps) {
  // Clinical notes state
  const [consultNotes, setConsultNotes] = useState(referral.clinicalNotes ?? "");
  const [closureOutcome, setClosureOutcome] = useState(referral.closureOutcome ?? "");
  
  // Diagnostics state
  const [testName, setTestName] = useState("");
  const [testResult, setTestResult] = useState("");
  const [diagnosticTests, setDiagnosticTests] = useState<Array<{ name: string; result?: string; status: "PENDING" | "COMPLETED" }>>(
    referral.diagnosticOrders ?? []
  );

  // Medication form state (Clinician provided strictly)
  const meds = medicationItems;
  const [newDrug, setNewDrug] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFreq, setNewFreq] = useState("");
  const [newInstructions, setNewInstructions] = useState("");

  // Follow-up state
  const [followupDate, setFollowupDate] = useState("");
  const [followupPurpose, setFollowupPurpose] = useState("");
  const [ashaWorker, setAshaWorker] = useState("");

  // Local loading state
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  async function handleStatusTransition(nextStatus: ReferralStatus, notes: string) {
    setSubmitting(true);
    setActionError("");
    try {
      await onUpdateStatus(referral._id, nextStatus, notes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "State transition failed";
      setActionError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function addDiagnostic() {
    if (!testName.trim()) return;
    const updated = [...diagnosticTests, { name: testName.trim(), result: testResult.trim() || undefined, status: (testResult.trim() ? "COMPLETED" : "PENDING") as "PENDING" | "COMPLETED" }];
    setDiagnosticTests(updated);
    setTestName("");
    setTestResult("");
    void onSaveDiagnostics(referral._id, updated.map(t => ({ name: t.name, result: t.result })));
  }

  function addMedication() {
    if (!onSaveMedicationPlan || !newDrug.trim() || !newDosage.trim() || !newFreq.trim() || !newInstructions.trim()) return;
    if (!onSaveMedicationPlan) return;
    void onSaveMedicationPlan(referral._id, [{ drugName: newDrug.trim(), dosage: newDosage.trim(), frequency: newFreq.trim(), durationDays: 14, instructions: newInstructions.trim() }]);
    setNewDrug("");
    setNewDosage("");
    setNewInstructions("");
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Referral Header Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-md">
                {referral.referralId}
              </span>
              <StatusBadge value={referral.priority} />
              <StatusBadge value={referral.status} />
              <StatusBadge value={referral.careLevel} size="sm" />
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Patient ID: <strong className="text-slate-800 font-mono">{referral.patientId}</strong> · From: <strong className="text-slate-800">{referral.fromFacilityName ?? "Not provided"}</strong> · To: <strong className="text-slate-800">{referral.toFacilityName ?? "Not provided"}</strong>
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Current Actionable Stage</span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg inline-block mt-0.5">
              {referral.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Patient Arrival & Triage Verification */}
      <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        referral.status === "REFERRAL_ACCEPTED" ? "ring-2 ring-violet-500/20 border-violet-500" : "border-slate-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-50 text-violet-700 rounded-xl border border-violet-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">1. Reception & Arrival Confirmation</h3>
              <p className="text-xs text-slate-500">Facility reception records physical patient handover.</p>
            </div>
          </div>
          <StatusBadge value={["REFERRAL_ACCEPTED", "REFERRAL_SENT"].includes(referral.status) ? "PENDING" : "COMPLETED"} size="sm" />
        </div>

        {referral.status === "REFERRAL_ACCEPTED" && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-600">Click below when ambulance transfers patient to emergency triage bay.</p>
            <button
              onClick={() => void handleStatusTransition("PATIENT_ARRIVED", "Patient arrived safely at facility triage area via emergency transport.")}
              disabled={submitting}
              className="rounded-xl bg-violet-700 hover:bg-violet-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" /> Confirm Patient Arrived
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Clinical Consultation */}
      <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        referral.status === "PATIENT_ARRIVED" ? "ring-2 ring-teal-500/20 border-teal-500" : "border-slate-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">2. Medical Officer Consultation</h3>
              <p className="text-xs text-slate-500">Doctor records clinical evaluation, danger signs assessment, and diagnosis.</p>
            </div>
          </div>
          <StatusBadge value={["PATIENT_ARRIVED", "REFERRAL_ACCEPTED", "REFERRAL_SENT"].includes(referral.status) ? "PENDING" : "COMPLETED"} size="sm" />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Clinical Examination Notes & Findings:
          </label>
          <textarea
            rows={3}
            value={consultNotes}
            onChange={(e) => setConsultNotes(e.target.value)}
            disabled={!["PATIENT_ARRIVED", "CONSULTATION_COMPLETED"].includes(referral.status)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-600"
          />

          {referral.status === "PATIENT_ARRIVED" && (
            <div className="flex justify-end">
              <button
                onClick={() => void handleStatusTransition("CONSULTATION_COMPLETED", consultNotes)}
                disabled={submitting}
                className="rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" /> Complete Consultation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Diagnostic Workup */}
      <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        ["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING"].includes(referral.status) ? "ring-2 ring-cyan-500/20 border-cyan-500" : "border-slate-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">3. Diagnostic Investigation Record</h3>
              <p className="text-xs text-slate-500">Laboratory & radiological investigations ordered and interpreted.</p>
            </div>
          </div>
          <StatusBadge value={["DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"].includes(referral.status) ? "COMPLETED" : "IN_PROGRESS"} size="sm" />
        </div>

        {/* Existing Tests Table */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-semibold">Test Name</th>
                  <th className="p-2.5 font-semibold">Clinical Result / Finding</th>
                  <th className="p-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diagnosticTests.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-900">{t.name}</td>
                    <td className="p-2.5 text-slate-700">{t.result ?? "Not available"}</td>
                    <td className="p-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Diagnostic Test Inputs */}
          {["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING"].includes(referral.status) && (
            <div className="flex flex-col md:flex-row items-center gap-2 pt-2">
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test (e.g. Serum Creatinine, Arterial Blood Gas)..."
                className="w-full md:w-1/3 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <input
                type="text"
                value={testResult}
                onChange={(e) => setTestResult(e.target.value)}
                placeholder="Result / Findings (e.g. Normal 0.9 mg/dL)..."
                className="w-full md:flex-1 rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={addDiagnostic}
                className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition shrink-0"
              >
                + Add Test
              </button>
            </div>
          )}

          {["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING"].includes(referral.status) && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => void handleStatusTransition("DIAGNOSTIC_COMPLETED", "All critical diagnostic investigations completed and interpreted.")}
                disabled={submitting}
                className="rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" /> Mark Diagnostics Complete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Clinician Medication Regimen (Strictly No AI Prescribing) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">4. Clinician Medication Regimen</h3>
              <p className="text-xs text-slate-500">
                Authorized doctor prescription only. AI is strictly forbidden from prescribing drugs or doses.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Doctor Prescribed
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="space-y-2">
            {meds.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{m.drugName}</span> · <span className="text-slate-600">{m.dosage}</span> · <span className="text-slate-500">{m.frequency} ({m.durationDays} days)</span>
                </div>
              </div>
            ))}
          </div>

          {["CONSULTATION_COMPLETED", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED"].includes(referral.status) && (
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                value={newDrug}
                onChange={(e) => setNewDrug(e.target.value)}
                placeholder="Medicine (e.g. Tab. Ramipril)..."
                className="w-full sm:flex-1 rounded-xl border border-slate-200 p-2 text-xs"
              />
              <input
                type="text"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                placeholder="Dose (e.g. 5 mg)..."
                className="w-full sm:w-28 rounded-xl border border-slate-200 p-2 text-xs"
              />
              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value)}
                className="w-full sm:w-36 rounded-xl border border-slate-200 p-2 text-xs bg-white"
              >
                <option value="Once daily (OD)">Once daily (OD)</option>
                <option value="Twice daily (BD)">Twice daily (BD)</option>
                <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                <option value="At bedtime (HS)">At bedtime (HS)</option>
              </select>
              <input value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} placeholder="Clinician instructions" className="w-full sm:flex-1 rounded-xl border border-slate-200 p-2 text-xs" />
              <button
                type="button"
                onClick={addMedication}
                className="rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 5: Follow-up Scheduling & Completion Loop (USP) */}
      <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        referral.status === "DIAGNOSTIC_COMPLETED" || referral.status === "FOLLOW_UP_REQUIRED"
          ? "ring-2 ring-purple-500/20 border-purple-500"
          : "border-slate-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">5. Continuity Follow-up Tracking</h3>
              <p className="text-xs text-slate-500">
                Core USP: Referral cannot be closed until follow-up review is completed.
              </p>
            </div>
          </div>
          <StatusBadge value={referral.status === "CLOSED" || referral.status === "FOLLOW_UP_COMPLETED" ? "COMPLETED" : referral.status === "FOLLOW_UP_REQUIRED" ? "UPCOMING" : "PENDING"} size="sm" />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Date:
              </label>
              <input
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                disabled={["FOLLOW_UP_COMPLETED", "CLOSED"].includes(referral.status)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Community Health / ASHA Worker:
              </label>
              <input
                type="text"
                value={ashaWorker}
                onChange={(e) => setAshaWorker(e.target.value)}
                disabled={["FOLLOW_UP_COMPLETED", "CLOSED"].includes(referral.status)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Follow-up Purpose:
              </label>
              <input
                type="text"
                value={followupPurpose}
                onChange={(e) => setFollowupPurpose(e.target.value)}
                disabled={["FOLLOW_UP_COMPLETED", "CLOSED"].includes(referral.status)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Action triggers depending on lifecycle */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {referral.status === "DIAGNOSTIC_COMPLETED" && (
              <button
                onClick={() => { if (onCreateFollowUp && followupDate && followupPurpose.trim()) void onCreateFollowUp(referral._id, { dueDate: followupDate, purpose: followupPurpose.trim(), assignedAshaWorker: ashaWorker.trim() || undefined }); }}
                disabled={submitting || !onCreateFollowUp}
                className="rounded-xl bg-purple-700 hover:bg-purple-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" /> Schedule Mandatory Follow-up
              </button>
            )}

            {referral.status === "FOLLOW_UP_REQUIRED" && (
              <button
                onClick={() => { if (followUp && onCompleteFollowUp) void onCompleteFollowUp(followUp._id); }}
                disabled={submitting || !followUp || !onCompleteFollowUp}
                className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" /> Mark Follow-up Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 6: Final Referral Closure (The USP Gate) */}
      <div className={`rounded-2xl border p-5 shadow-sm transition ${
        referral.status === "CLOSED"
          ? "border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-500/20"
          : referral.status === "FOLLOW_UP_COMPLETED"
          ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20"
          : "border-slate-200 bg-white opacity-90"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">6. Formal Referral Closure</h3>
              <p className="text-xs text-slate-600">
                Verified end-to-end care completion: patient referred, admitted, treated, follow-up concluded.
              </p>
            </div>
          </div>
          <StatusBadge value={referral.status === "CLOSED" ? "CLOSED" : "GATE_LOCKED"} size="sm" />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          {referral.status === "CLOSED" ? (
            <div className="rounded-xl bg-emerald-100/60 p-4 border border-emerald-300 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <CheckCheck className="w-4 h-4 text-emerald-700" /> Referral Cycle Formally Closed
              </p>
              <p><span className="font-semibold">Closure Outcome:</span> {referral.closureOutcome ?? closureOutcome}</p>
              <p className="text-[11px] text-emerald-800">
                This referral is recorded as closed by the backend after its required milestones.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Document Final Treatment Outcome:
                </label>
                <input
                  type="text"
                  value={closureOutcome}
                  onChange={(e) => setClosureOutcome(e.target.value)}
                  disabled={referral.status !== "FOLLOW_UP_COMPLETED"}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                  placeholder="e.g. Complete clinical recovery, patient discharged home from follow-up..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500">
                  {referral.status === "FOLLOW_UP_COMPLETED"
                    ? "✓ All mandatory clinical stages complete. You may now close this referral."
                    : "🔒 Gate locked: Requires Follow-up Completion before closure."}
                </p>

                {referral.status === "FOLLOW_UP_COMPLETED" && (
                  <button
                    onClick={() => void handleStatusTransition("CLOSED", closureOutcome)}
                    disabled={submitting}
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" /> Close Referral
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
