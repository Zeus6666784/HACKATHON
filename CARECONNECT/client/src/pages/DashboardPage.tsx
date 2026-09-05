import { useState } from "react";
import { api, post } from "../services/api";
import { TriageResultCard } from "../components/TriageResultCard";
import type { Patient, TriageResult } from "../types";

export function DashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createPatient() {
    setMessage("");
    const data = await post<Patient>("/patients", {
      patientId: `P-${Date.now()}`,
      name: "Demo Patient",
      age: 35,
      gender: "O",
      location: "Maharashtra"
    });
    setPatient(data);
  }

  async function assess() {
    if (!patient) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await post<TriageResult>("/triage/assess", {
        patientId: patient._id,
        symptoms
      });
      setTriage(response);
    } catch {
      setMessage("Triage failed. Please check the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm font-semibold text-slate-500">CARECONNECT MAHARASHTRA</p>
          <h1 className="mt-1 text-3xl font-bold">Referral Continuity Dashboard</h1>
          <p className="mt-2 text-slate-600">Golden-path boilerplate: patient → triage → facility → referral → closure.</p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold">1. Patient</h2>
            <button onClick={createPatient} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white">
              Create demo patient
            </button>
            {patient && <p className="mt-3 text-sm">Created: <b>{patient.name}</b> ({patient.patientId})</p>}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold">2. Symptoms → Triage</h2>
            <textarea
              className="mt-4 min-h-28 w-full rounded-lg border p-3"
              placeholder="Enter patient symptoms..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
            <button disabled={!patient || !symptoms || loading} onClick={assess}
              className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-white">
              {loading ? "Assessing..." : "Assess symptoms"}
            </button>
          </div>
        </section>

        {message && <p className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">{message}</p>}
        {triage && <div className="mt-5"><TriageResultCard result={triage} /></div>}
      </div>
    </main>
  );
}
