import { useState } from "react";
import { UserPlus, Sparkles, User, MapPin, Phone, AlertTriangle } from "lucide-react";
import type { Patient } from "../../types";
import { CLINICAL_PRESETS, type ClinicalPreset } from "../../data/demoData";

interface PatientRegistrationProps {
  patient: Patient | null;
  onSavePatient: (patient: Patient) => Promise<void>;
  onSelectPreset: (preset: ClinicalPreset) => void;
}

export function PatientRegistration({
  patient,
  onSavePatient,
  onSelectPreset
}: PatientRegistrationProps) {
  const [form, setForm] = useState({
    patientId: patient?.patientId ?? "",
    name: patient?.name ?? "",
    age: patient?.age ? String(patient.age) : "",
    gender: (patient?.gender ?? "O") as "M" | "F" | "O",
    location: patient?.location ?? "",
    contact: patient?.contact ?? ""
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePatient({
        _id: patient?._id ?? "",
        patientId: form.patientId,
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        location: form.location || "Maharashtra",
        contact: form.contact
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Patient Registration & Intake</h2>
            <p className="text-xs text-slate-500">Demographics & clinical case registration</p>
          </div>
        </div>

        {/* Quick Demo Case Presets Loader */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          {CLINICAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setForm({
                  patientId: preset.patient.patientId,
                  name: preset.patient.name,
                  age: String(preset.patient.age),
                  gender: preset.patient.gender,
                  location: preset.patient.location,
                  contact: preset.patient.contact ?? ""
                });
                onSelectPreset(preset);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-900 px-2 py-1 text-[11px] font-semibold text-slate-700 transition"
              title={preset.badge}
            >
              {preset.patient.name.split(" ")[0]} ({preset.patient.gender}/{preset.patient.age})
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Patient State ID
          </label>
          <input
            type="text"
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 font-mono focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name (English / मराठी)
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as "M" | "F" | "O" })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="F">Female (स्त्री)</option>
              <option value="M">Male (पुरुष)</option>
              <option value="O">Other (इतर)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Contact Number
          </label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Village / Taluka / District Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            required
          />
        </div>

        <div className="sm:col-span-2 flex items-center justify-between pt-2">
          {patient ? (
            <p className="text-xs text-emerald-700 font-medium">
              ✓ Active Patient: <strong className="text-slate-900">{patient.name}</strong> ({patient.patientId})
            </p>
          ) : (
            <span className="text-xs text-slate-400">Save patient demographics to proceed to triage</span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            {saving ? "Saving..." : patient ? "Update Demographics" : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
