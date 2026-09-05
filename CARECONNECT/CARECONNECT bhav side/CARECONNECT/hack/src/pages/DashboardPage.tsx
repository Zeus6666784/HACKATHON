import { useState } from "react";
import { post } from "../services/api";
import { TriageResultCard } from "../components/TriageResultCard";
import { ReferralTimeline, type ReferralEvent } from "../components/ReferralTimeline";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import type { Facility, Patient, Referral, ReferralStatus, TriageResult } from "../types";

const demoFacilities: Facility[] = [
  {
    _id: "fac-1",
    name: "District Hospital, Nashik",
    type: "DISTRICT",
    services: ["cardiology", "emergency", "icu"],
    emergencyCapability: true,
    verificationState: "VERIFIED",
    source: "Synthetic",
    coordinates: [73.789, 19.997],
    distanceKm: 12
  },
  {
    _id: "fac-2",
    name: "Civil Hospital, Sangli",
    type: "DISTRICT",
    services: ["general medicine", "cardiology"],
    emergencyCapability: true,
    verificationState: "VERIFIED",
    source: "Synthetic",
    coordinates: [75.807, 16.86],
    distanceKm: 19
  },
  {
    _id: "fac-3",
    name: "PHC, Wai",
    type: "PHC",
    services: ["primary care", "urgent care"],
    emergencyCapability: false,
    verificationState: "SYNTHETIC",
    source: "Synthetic",
    coordinates: [73.879, 17.952],
    distanceKm: 7
  },
  {
    _id: "fac-4",
    name: "Tertiary Care Centre, Pune",
    type: "TERTIARY",
    services: ["icu", "cardiology", "neurology"],
    emergencyCapability: true,
    verificationState: "UNVERIFIED",
    source: "Synthetic",
    coordinates: [73.856, 18.520],
    distanceKm: 42
  }
];

function toLocalPatient(form: { patientId: string; name: string; age: string; gender: "M" | "F" | "O"; location: string; contact: string }) {
  return {
    _id: `patient-${Date.now()}`,
    patientId: form.patientId || `PAT-${Date.now()}`,
    name: form.name || "Demo Patient",
    age: Number(form.age) || 35,
    gender: form.gender || "O",
    location: form.location || "Maharashtra",
    contact: form.contact || "+91 90000 00000"
  } as Patient;
}

function buildFallbackTriage(symptoms: string): TriageResult {
  const text = symptoms.toLowerCase();
  const emergencyTerms = ["chest pain", "shortness of breath", "stroke", "unconscious", "severe bleeding", "difficulty breathing"];
  const isHigh = emergencyTerms.some((term) => text.includes(term));

  if (isHigh) {
    return {
      priority: "HIGH",
      suggestedCareLevel: "TERTIARY",
      relevantServices: ["Emergency", "Critical care"],
      reasoning: "Symptoms include high-risk danger signals requiring urgent clinical evaluation.",
      recommendedNextAction: "Arrange immediate transfer to an emergency-capable facility.",
      caution: "Clinical verification required. This is decision support, not a diagnosis.",
      source: "FALLBACK"
    };
  }

  if (text.length > 80 || text.includes("fever") || text.includes("pain")) {
    return {
      priority: "MEDIUM",
      suggestedCareLevel: "DISTRICT",
      relevantServices: ["General medicine", "Diagnostics"],
      reasoning: "Symptoms suggest a time-sensitive but stable condition that requires clinician review.",
      recommendedNextAction: "Refer to a district-level facility for clinical review and diagnostics.",
      caution: "Clinical verification required. This is decision support, not a diagnosis.",
      source: "FALLBACK"
    };
  }

  return {
    priority: "LOW",
    suggestedCareLevel: "PHC",
    relevantServices: ["Primary care"],
    reasoning: "Symptoms are not immediately high-risk; local primary care review may be appropriate.",
    recommendedNextAction: "Use primary-care triage and schedule follow-up if symptoms persist.",
    caution: "Clinical verification required. This is decision support, not a diagnosis.",
    source: "FALLBACK"
  };
}

function rankFacilities(symptoms: string, isEmergency: boolean): Facility[] {
  const lower = symptoms.toLowerCase();
  return [...demoFacilities]
    .map((facility) => {
      const serviceScore = facility.services.some((service) => lower.includes(service.toLowerCase())) ? 40 : 10;
      const emergencyScore = isEmergency && facility.emergencyCapability ? 30 : 0;
      const verificationScore = facility.verificationState === "VERIFIED" ? 20 : facility.verificationState === "UNVERIFIED" ? 10 : 5;
      const careScore = facility.type === "PHC" ? 10 : facility.type === "DISTRICT" ? 18 : 22;
      const distancePenalty = facility.distanceKm ?? 20;
      const score = serviceScore + emergencyScore + verificationScore + careScore - distancePenalty * 0.5;
      return { ...facility, score: Math.max(0, Math.round(score)) };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function DashboardPage() {
  const { logout } = useAuth();
  const [patientForm, setPatientForm] = useState({
    patientId: "PAT-1001",
    name: "Savitri Patil",
    age: "42",
    gender: "F" as "M" | "F" | "O",
    location: "Khodala, Maharashtra",
    contact: "+91 98765 43210"
  });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState("Severe chest pain and shortness of breath after exertion.");
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [recommendations, setRecommendations] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createPatient() {
    const localPatient = toLocalPatient(patientForm);
    setMessage("");

    try {
      const created = await post<Patient>("/patients", {
        patientId: localPatient.patientId,
        name: localPatient.name,
        age: localPatient.age,
        gender: localPatient.gender,
        location: localPatient.location,
        contact: localPatient.contact
      });
      setPatient(created);
    } catch {
      setPatient(localPatient);
    }
  }

  async function assessSymptoms() {
    if (!patient) {
      setMessage("Create a patient first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await post<TriageResult>("/triage/assess", {
        patientId: patient._id,
        symptoms
      });
      setTriage(result);
      const ranked = rankFacilities(symptoms, result.priority === "HIGH");
      setRecommendations(ranked);
      setSelectedFacility(ranked[0] ?? null);
    } catch {
      const result = buildFallbackTriage(symptoms);
      setTriage(result);
      const ranked = rankFacilities(symptoms, result.priority === "HIGH");
      setRecommendations(ranked);
      setSelectedFacility(ranked[0] ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function createReferral() {
    if (!patient || !triage || !selectedFacility) {
      setMessage("Complete patient creation and triage before creating a referral.");
      return;
    }

    const newReferral: Referral = {
      _id: `ref-${Date.now()}`,
      referralId: `CC-MH-${Date.now().toString().slice(-6)}`,
      patientId: patient._id,
      fromFacilityId: "facility-phc-01",
      toFacilityId: selectedFacility._id,
      status: "CREATED",
      priority: triage.priority,
      careLevel: triage.suggestedCareLevel
    };

    try {
      const created = await post<Referral>("/referrals", {
        referralId: newReferral.referralId,
        patientId: newReferral.patientId,
        fromFacilityId: newReferral.fromFacilityId,
        toFacilityId: newReferral.toFacilityId,
        priority: newReferral.priority,
        careLevel: newReferral.careLevel
      });
      setReferral(created ?? newReferral);
    } catch {
      setReferral(newReferral);
    }

    const initialEvent: ReferralEvent = {
      event_id: `evt-${Date.now()}`,
      event_type: "REFERRAL_CREATED",
      timestamp: new Date().toISOString(),
      new_status: "CREATED",
      notes: `Referral created for ${patient.name} to ${selectedFacility.name}`
    };
    setEvents([initialEvent]);
    setMessage("");
  }

  function updateReferralStatus(nextStatus: ReferralStatus, note: string) {
    if (!referral) {
      setMessage("Create a referral before updating its status.");
      return;
    }

    const updated = { ...referral, status: nextStatus };
    setReferral(updated);
    setEvents((current) => [
      ...current,
      {
        event_id: `evt-${Date.now()}`,
        event_type: nextStatus,
        timestamp: new Date().toISOString(),
        previous_status: referral.status,
        new_status: nextStatus,
        notes: note
      }
    ]);

    void post(`/referrals/${referral._id}/status`, {
      status: nextStatus,
      notes: note
    }).catch(() => undefined);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-900 px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">CareConnect Maharashtra</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Referral continuity dashboard</h1>
          </div>
          <button onClick={() => void logout()} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-100">
            Log out
          </button>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-800">1. Register patient</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Patient ID
                <input className="mt-1 w-full rounded-lg border border-slate-200 p-2.5" value={patientForm.patientId} onChange={(e) => setPatientForm((current) => ({ ...current, patientId: e.target.value }))} />
              </label>
              <label className="text-sm font-medium text-slate-700">Name
                <input className="mt-1 w-full rounded-lg border border-slate-200 p-2.5" value={patientForm.name} onChange={(e) => setPatientForm((current) => ({ ...current, name: e.target.value }))} />
              </label>
              <label className="text-sm font-medium text-slate-700">Age
                <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 p-2.5" value={patientForm.age} onChange={(e) => setPatientForm((current) => ({ ...current, age: e.target.value }))} />
              </label>
              <label className="text-sm font-medium text-slate-700">Gender
                <select className="mt-1 w-full rounded-lg border border-slate-200 p-2.5" value={patientForm.gender} onChange={(e) => setPatientForm((current) => ({ ...current, gender: e.target.value as "M" | "F" | "O" }))}>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="O">Other</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Location
                <input className="mt-1 w-full rounded-lg border border-slate-200 p-2.5" value={patientForm.location} onChange={(e) => setPatientForm((current) => ({ ...current, location: e.target.value }))} />
              </label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Contact
                <input className="mt-1 w-full rounded-lg border border-slate-200 p-2.5" value={patientForm.contact} onChange={(e) => setPatientForm((current) => ({ ...current, contact: e.target.value }))} />
              </label>
            </div>
            <button onClick={() => void createPatient()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white">
              Create patient
            </button>
            {patient && <p className="mt-4 text-sm text-slate-700">Current patient: <span className="font-semibold">{patient.name}</span> ({patient.patientId})</p>}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-800">2. Symptoms → triage</h2>
            <textarea
              className="mt-4 min-h-[170px] w-full rounded-xl border border-slate-200 p-3 outline-none ring-0"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe the chief concern, symptoms, and danger signs..."
            />
            <button
              disabled={!patient || !symptoms || loading}
              onClick={() => void assessSymptoms()}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white"
            >
              {loading ? "Assessing..." : "Assess symptoms"}
            </button>
          </div>
        </section>

        {message && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</p>}
        {triage && <div className="mt-6"><TriageResultCard result={triage} /></div>}

        {recommendations.length > 0 && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800">3. Ranked facilities</h2>
              {triage && <StatusBadge value={triage.priority} />}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {recommendations.map((facility) => (
                <button
                  key={facility._id}
                  type="button"
                  onClick={() => setSelectedFacility(facility)}
                  className={`rounded-2xl border p-4 text-left transition ${selectedFacility?._id === facility._id ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{facility.name}</h3>
                    <StatusBadge value={facility.verificationState} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{facility.type} · Distance {facility.distanceKm ?? 15} km</p>
                  <p className="mt-2 text-xs text-slate-500">Services: {facility.services.join(", ")}</p>
                  <p className="mt-3 text-right text-sm font-bold text-slate-800">Score: {facility.score}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedFacility && triage && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">4. Referral creation</h2>
                <p className="mt-1 text-sm text-slate-600">Selected facility: <span className="font-semibold text-slate-900">{selectedFacility.name}</span></p>
              </div>
              <button onClick={() => void createReferral()} className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white">
                Create referral
              </button>
            </div>
          </section>
        )}

        {referral && (
          <section className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-800">5. Referral workflow</h2>
                <StatusBadge value={referral.status} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button onClick={() => updateReferralStatus("REFERRAL_ACCEPTED", "Facility accepted the referral and confirmed capacity.")} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">Accept referral</button>
                <button onClick={() => updateReferralStatus("REFERRAL_REJECTED", "Facility rejected due to capacity and specialist availability.")} className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-medium text-orange-800">Reject referral</button>
                <button onClick={() => updateReferralStatus("PATIENT_ARRIVED", "Patient arrived at the receiving facility.")} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-medium text-violet-800">Mark patient arrived</button>
                <button onClick={() => updateReferralStatus("CONSULTATION_COMPLETED", "Clinical consultation has been completed.")} className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm font-medium text-teal-800">Consultation complete</button>
                <button onClick={() => updateReferralStatus("DIAGNOSTIC_COMPLETED", "Diagnostics and recommended work-up have been completed.")} className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-800">Diagnostics complete</button>
                <button onClick={() => updateReferralStatus("FOLLOW_UP_REQUIRED", "Follow-up care plan has been scheduled.")} className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-2.5 text-sm font-medium text-fuchsia-800">Follow-up required</button>
                <button onClick={() => updateReferralStatus("FOLLOW_UP_COMPLETED", "Follow-up completed successfully.")} className="rounded-xl border border-lime-200 bg-lime-50 px-3 py-2.5 text-sm font-medium text-lime-800">Follow-up complete</button>
                <button onClick={() => updateReferralStatus("CLOSED", "Referral closed with treatment outcome recorded.")} className="rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-2.5 text-sm font-medium text-emerald-900">Close referral</button>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <p><span className="font-semibold">Referral ID:</span> {referral.referralId}</p>
                <p><span className="font-semibold">Priority:</span> {referral.priority}</p>
                <p><span className="font-semibold">Care level:</span> {referral.careLevel}</p>
                <p><span className="font-semibold">Destination:</span> {selectedFacility?.name ?? "Facility"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold text-slate-800">6. Status summary</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• Referral created: {referral.status !== "CREATED" ? "Yes" : "In progress"}</li>
                <li>• Triage priority: {triage?.priority ?? "Pending"}</li>
                <li>• Facility selected: {selectedFacility?.name ?? "Pending"}</li>
                <li>• Closure loop: {referral.status === "CLOSED" ? "Completed" : "Open"}</li>
              </ul>
            </div>
          </section>
        )}

        {events.length > 0 && (
          <div className="mt-6">
            <ReferralTimeline events={events} />
          </div>
        )}
      </div>
    </main>
  );
}
