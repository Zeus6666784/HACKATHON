import { useState } from "react";
import { AlertOctagon, X, AlertTriangle } from "lucide-react";
import type { Referral } from "../../types";

interface RejectionModalProps {
  referral: Referral | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRejection: (referralId: string, reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  "ICU bed capacity exhausted (100% occupancy)",
  "Pulmonologist / Specialist unavailable (on emergency call)",
  "CT Scanner / Critical diagnostic equipment maintenance",
  "Oxygen pipeline maintenance in high-dependency ward",
  "Patient requires advanced tertiary intervention beyond center capability"
];

export function RejectionModal({
  referral,
  isOpen,
  onClose,
  onConfirmRejection
}: RejectionModalProps) {
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !referral) return null;

  async function handleConfirm() {
    const finalReason = customReason.trim() || reason;
    if (!finalReason) return;
    setSubmitting(true);
    try {
      await onConfirmRejection(referral!._id, finalReason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="reject-title" className="text-lg font-bold text-slate-900">
                Reject & Trigger Re-route
              </h3>
              <p className="text-xs text-slate-500">
                Referral: <span className="font-mono font-bold text-slate-700">{referral.referralId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Mandatory Protocol:</strong> A documented clinical justification is required by the Maharashtra Directorate of Health Services. Rejecting will automatically re-rank available facilities excluding your hospital.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Standard Operational Reason:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {COMMON_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Or Specify Detailed Reason:
            </label>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Bed capacity at 100%, nearest alternative is Sassoon General Hospital Pune..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleConfirm()}
            disabled={submitting}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
          >
            {submitting ? "Rejecting & Re-routing..." : "Confirm Rejection & Re-route"}
          </button>
        </div>
      </div>
    </div>
  );
}
