import { useState } from "react";
import { 
  Building2, 
  Bed, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import type { Facility, Priority } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface FacilityRankingViewProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
  triagePriority?: Priority;
  onCreateReferral: () => Promise<void>;
  creatingReferral: boolean;
}

export function FacilityRankingView({
  facilities,
  selectedFacility,
  onSelectFacility,
  triagePriority,
  onCreateReferral,
  creatingReferral
}: FacilityRankingViewProps) {
  const [filterDistrict, setFilterDistrict] = useState<string>("ALL");

  const getDistrict = (f: Facility) => (f.name.includes(",") ? f.name.split(",")[1]?.trim() : "Maharashtra");
  const districts = Array.from(new Set(facilities.map(getDistrict).filter(Boolean)));

  const filtered = facilities.filter((f) => {
    if (filterDistrict !== "ALL" && getDistrict(f) !== filterDistrict) return false;
    return true;
  });

  return (
    <section className="space-y-6">
      {/* Header with Algorithm Explanation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Deterministic Facility Capacity Ranking</h2>
              <p className="text-xs text-slate-500">
                Formula: <span className="font-mono font-semibold text-slate-700">Score = (Capability + Care Level + Distance) × Verification Multiplier</span>
              </p>
            </div>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">District:</span>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">All Districts (सर्व जिल्हे)</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <span>
            Current Urgency: <strong className="text-slate-900">{triagePriority ?? "Not assessed"}</strong>. Facilities with 24/7 ICU &amp; Emergency capability are prioritized.
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {filtered.length} matching facilities found
          </span>
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((facility, idx) => {
          const isSelected = selectedFacility?._id === facility._id;
          const isRankOne = idx === 0;

          return (
            <div
              key={facility._id}
              onClick={() => onSelectFacility(facility)}
              className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all duration-150 relative ${
                isSelected
                  ? "border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/20 shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {isRankOne && (
                <span className="absolute -top-2.5 -right-2.5 rounded-full bg-teal-700 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  ★ Top Match
                </span>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{facility.name}</h3>
                    <StatusBadge value={facility.type} size="sm" />
                    <StatusBadge value={facility.verificationState} size="sm" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{getDistrict(facility)} · <strong>{facility.distanceKm ?? 15} km</strong> away</span>
                  </p>
                </div>

                {/* Score Pill */}
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Score</span>
                  <span className="text-lg font-black font-mono text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-lg inline-block">
                    {facility.score ?? 85}
                  </span>
                </div>
              </div>

              {/* Services & Bed Capacity */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Bed className="w-3 h-3 text-teal-600" /> Bed Status
                  </span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {facility.emergencyCapability ? "ICU & Emergency Ready" : "General Inpatient"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" /> Emergency Transit
                  </span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {facility.emergencyCapability ? "108 Ambulance Hotline" : "PHC Local Van"}
                  </span>
                </div>
              </div>

              {/* Specialists Roster */}
              {facility.specialists && facility.specialists.length > 0 && (
                <p className="mt-3 text-[11px] text-slate-600 line-clamp-1">
                  <strong className="text-slate-700">Specialists on duty:</strong> {facility.specialists.join(", ")}
                </p>
              )}

              {/* Selection Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {isSelected ? "✓ Facility Selected" : "Click to select"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility(facility);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
                    isSelected
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Hospital"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proceed to Referral Confirmation */}
      {selectedFacility && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
              Ready to Dispatch Transfer:
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">
              Generate Official Referral to: <span className="text-teal-900">{selectedFacility.name}</span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Receiving center will receive instant push alert for bed confirmation.
            </p>
          </div>

          <button
            onClick={() => void onCreateReferral()}
            disabled={creatingReferral}
            className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 px-5 py-3 text-xs font-bold text-white shadow-md transition flex items-center gap-2 shrink-0"
          >
            {creatingReferral ? "Generating Token..." : "3. Create Referral Slip"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
