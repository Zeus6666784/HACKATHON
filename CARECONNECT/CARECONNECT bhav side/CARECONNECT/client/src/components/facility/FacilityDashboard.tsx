import { useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ArrowRight, 
  Bed, 
  Phone,
  AlertTriangle
} from "lucide-react";
import type { Referral, Facility, ReferralStatus } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface FacilityDashboardProps {
  currentFacility: Facility;
  referrals: Referral[];
  onUpdateStatus: (referralId: string, status: ReferralStatus, notes?: string) => Promise<void>;
  onOpenRejectionModal: (referral: Referral) => void;
  onSelectReferral: (referral: Referral) => void;
  selectedReferralId?: string;
}

export function FacilityDashboard({
  currentFacility,
  referrals,
  onUpdateStatus,
  onOpenRejectionModal,
  onSelectReferral,
  selectedReferralId
}: FacilityDashboardProps) {
  const [filter, setFilter] = useState<"ALL" | "INCOMING" | "ADMITTED">("ALL");

  const facilityReferrals = referrals.filter((r) => 
    r.toFacilityId === currentFacility._id || r.fromFacilityId === currentFacility._id || !r.toFacilityId
  );

  const displayed = facilityReferrals.filter((r) => {
    if (filter === "INCOMING") return ["REFERRAL_SENT", "REFERRAL_ACCEPTED"].includes(r.status);
    if (filter === "ADMITTED") return ["PATIENT_ARRIVED", "CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING", "DIAGNOSTIC_COMPLETED"].includes(r.status);
    return true;
  });

  return (
    <section className="space-y-6">
      {/* Facility Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-700 border border-teal-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{currentFacility.name}</h2>
                <StatusBadge value={currentFacility.type} size="sm" />
                <StatusBadge value={currentFacility.verificationState} size="sm" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Location: <span className="font-semibold text-slate-700">{currentFacility.name.includes(",") ? currentFacility.name.split(",")[1]?.trim() : "Maharashtra"}</span> · Services: <span className="font-semibold text-slate-700">{currentFacility.services.slice(0, 3).join(", ")}</span>
              </p>
            </div>
          </div>

          {/* Real-time Bed Capacity Widget */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1 justify-center">
                <Bed className="w-3.5 h-3.5 text-teal-600" /> Emergency
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                <span className={currentFacility.emergencyCapability ? "text-teal-700" : "text-amber-700"}>
                  {currentFacility.emergencyCapability ? "24/7 Ready" : "OPD Only"}
                </span>
              </p>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1 justify-center">
                <Building2 className="w-3.5 h-3.5 text-sky-600" /> Tier Level
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                <span className="text-sky-700">{currentFacility.type}</span>
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1 justify-center">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Hotline
              </p>
              <p className="text-xs font-bold text-emerald-700 mt-1">{currentFacility.ambulancePhone ?? "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Filter Pill Tabs */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Filter Queue:</span>
            {(["ALL", "INCOMING", "ADMITTED"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === mode
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {mode === "ALL" ? "All Queue" : mode === "INCOMING" ? "Incoming Transfers" : "In-Care (Admitted)"}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{displayed.length}</strong> patient referrals
          </span>
        </div>
      </div>

      {/* Referrals Queue List */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            <Building2 className="mx-auto h-10 w-10 text-slate-400 stroke-1 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No referrals in this queue</p>
            <p className="text-xs text-slate-400 mt-1">New incoming referrals from peripheral PHCs will appear here automatically.</p>
          </div>
        ) : (
          displayed.map((ref) => {
            const isSelected = selectedReferralId === ref._id;

            return (
              <div
                key={ref._id}
                onClick={() => onSelectReferral(ref)}
                className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md ${
                  isSelected
                    ? "border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded">
                        {ref.referralId}
                      </span>
                      <StatusBadge value={ref.priority} size="sm" />
                      <StatusBadge value={ref.status} size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-1">
                      Patient ID: {ref.patientId}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      <strong className="text-slate-800">Chief Concern:</strong> {ref.chiefComplaint ?? "Not provided"}
                    </p>
                  </div>

                  {/* Actions depending on state */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {ref.status === "REFERRAL_SENT" && (
                      <>
                        <button
                          onClick={() => void onUpdateStatus(ref._id, "REFERRAL_ACCEPTED", "Receiving facility confirmed bed and clinical capacity.")}
                          className="flex items-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept Referral
                        </button>
                        <button
                          onClick={() => onOpenRejectionModal(ref)}
                          className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 text-xs font-bold text-orange-800 transition"
                        >
                          <XCircle className="w-4 h-4" /> Reject (Re-route)
                        </button>
                      </>
                    )}

                    {ref.status === "REFERRAL_ACCEPTED" && (
                      <button
                        onClick={() => void onUpdateStatus(ref._id, "PATIENT_ARRIVED", "Patient physically reached the emergency/OPD reception.")}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-700 hover:bg-violet-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                      >
                        <UserCheck className="w-4 h-4" /> Mark Patient Arrived
                      </button>
                    )}

                    {["PATIENT_ARRIVED", "CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED"].includes(ref.status) && (
                      <button
                        onClick={() => onSelectReferral(ref)}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                      >
                        Manage Clinical Care <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {ref.status === "CLOSED" && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Care Loop Closed
                      </div>
                    )}

                    {ref.status === "REFERRAL_REJECTED" && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                        <AlertTriangle className="w-4 h-4" /> Rejected · Reassignment Pending
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
