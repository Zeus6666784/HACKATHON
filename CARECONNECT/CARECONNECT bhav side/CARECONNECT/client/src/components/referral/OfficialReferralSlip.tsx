import { Printer, X, Shield, Phone, AlertCircle, Building2 } from "lucide-react";
import type { Referral, Patient, Facility } from "../../types";

interface OfficialReferralSlipProps {
  referral: Referral;
  patient?: Patient | null;
  facility?: Facility | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficialReferralSlip({
  referral,
  patient,
  facility,
  isOpen,
  onClose
}: OfficialReferralSlipProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8">
        {/* Action Header (hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm">Official Government Referral Slip (Preview)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Referral Slip Document */}
        <div id="printable-referral-slip" className="p-8 space-y-6 text-slate-900 bg-white font-sans text-xs leading-relaxed">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
              Government of Maharashtra · Public Health Department
            </p>
            <p className="text-[10px] text-slate-500 font-serif">
              सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन · राष्ट्रीय आरोग्य अभियान (NHM)
            </p>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-950 pt-1">
              Inter-Facility Clinical Emergency Referral Slip
            </h1>
            <p className="text-[11px] font-mono text-slate-600">
              State Referral Token: <strong className="text-slate-900 font-bold">{referral.referralId}</strong> · Date: {new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Core Alert Banner */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-300">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Clinical Urgency:</span>
              <span className={`text-xs font-black uppercase ${
                referral.priority === "HIGH" ? "text-rose-700" : referral.priority === "MEDIUM" ? "text-amber-800" : "text-emerald-800"
              }`}>
                {referral.priority} Priority · Immediate Clinical Transfer
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Recommended Care Level:</span>
              <span className="text-xs font-bold text-slate-900">{referral.careLevel} Hospital Tier</span>
            </div>
          </div>

          {/* Two-Column Clinical Demographics */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-4 bg-slate-50/50">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                Patient Demographics
              </h2>
              <ul className="space-y-1.5 text-slate-800">
                <li><strong className="text-slate-600">Name:</strong> {patient?.name ?? "Not provided"}</li>
                <li><strong className="text-slate-600">Age / Gender:</strong> {patient?.age ?? "Not provided"} / {patient?.gender ?? "Not provided"}</li>
                <li><strong className="text-slate-600">Patient ID:</strong> <span className="font-mono">{referral.patientId}</span></li>
                <li><strong className="text-slate-600">ABHA Health ID:</strong> <span className="font-mono">{patient?.abhaId ?? "Not provided"}</span></li>
                <li><strong className="text-slate-600">Residence:</strong> {patient?.location ?? "Not provided"}</li>
                <li><strong className="text-slate-600">Contact:</strong> {patient?.contact ?? "Not provided"}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                Receiving Facility Handover
              </h2>
              <ul className="space-y-1.5 text-slate-800">
                <li><strong className="text-slate-600">Destination:</strong> {facility?.name ?? "Not provided"}</li>
                <li><strong className="text-slate-600">District:</strong> {facility?.district ?? "Not provided"}</li>
                <li><strong className="text-slate-600">Bed Status:</strong> {facility?.icuBedsAvailable === undefined ? "Not provided" : `${facility.icuBedsAvailable} ICU beds reported`}</li>
                <li><strong className="text-slate-600">Nodal MO:</strong> {facility?.nodalOfficer ?? "Not provided"}</li>
                <li><strong className="text-slate-600">Ambulance Hotline:</strong> {facility?.ambulancePhone ?? "Not provided"}</li>
              </ul>
            </div>
          </div>

          {/* Clinical Reason for Transfer */}
          <div className="border border-slate-300 rounded-lg p-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
              Clinical Summary & Chief Concern
            </h2>
            <p className="text-slate-800 leading-relaxed font-serif text-[11px]">
              {referral.chiefComplaint ?? "Not provided"}
            </p>
          </div>

          {/* Transport & Signature Block */}
          <div className="pt-4 grid grid-cols-2 gap-4 border-t-2 border-slate-800 text-[10px]">
            <div>
              <p className="font-bold text-slate-700">Referring Medical Officer:</p>
              <p className="mt-8 font-semibold text-slate-900">Dr. Nilesh Kadam (MBBS, MO In-charge)</p>
              <p className="text-slate-500">Primary Health Centre (PHC), Wai</p>
              <p className="text-slate-400 font-mono">Reg. No: MMC-2014/08/3412</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700">Official Receiving Facility Stamp:</p>
              <div className="mt-8 inline-block border border-dashed border-slate-400 px-6 py-3 rounded text-slate-400 uppercase font-mono text-[9px]">
                [ Stamp &amp; In-Time Seal ]
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[9px] text-slate-400 border-t border-slate-200">
            CareConnect Maharashtra Automated Inter-facility Transfer Protocol · Section 12 Public Health Directive
          </div>
        </div>
      </div>
    </div>
  );
}
