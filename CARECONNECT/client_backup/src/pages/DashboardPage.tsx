import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { post } from "../services/api";
import { TriageResultCard } from "../components/TriageResultCard";
import type { Patient, TriageResult } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert } from "../components/ui/Alert";

const FADE_IN_UP = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export function DashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createPatient() {
    setMessage("");
    try {
      const data = await post<Patient>("/patients", {
        patientId: `P-${Date.now()}`,
        name: "Demo Patient",
        age: 35,
        gender: "O",
        location: "Maharashtra"
      });
      setPatient(data);
    } catch {
      setMessage("Failed to create patient.");
    }
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
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Institutional Health Network</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Referral <span className="text-slate-500 font-medium">Command Center</span>
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl text-sm leading-relaxed">
              Secure clinical pipeline for rural healthcare continuity and triage management.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            System Operational
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patient Entry - Sidebar Style */}
          <motion.div
            {...FADE_IN_UP}
            transition={{ ...FADE_IN_UP.transition, delay: 0.1 }}
            className="md:col-span-1"
          >
            <Card className="h-full border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Patient Registry</CardTitle>
                <CardDescription>Initialize patient record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={createPatient}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Create Demo Patient
                </Button>
                {patient && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Active Record</p>
                    <div className="flex items-center justify-between">
                      <b className="text-slate-900 text-sm">{patient.name}</b>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-200 px-1.5 py-0.5 rounded">{patient.patientId}</span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Clinical Assessment - Main Area */}
          <motion.div
            {...FADE_IN_UP}
            transition={{ ...FADE_IN_UP.transition, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="h-full border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Clinical Assessment</CardTitle>
                <CardDescription>Input symptoms for AI-assisted triage analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="min-h-32 w-full rounded-lg border border-slate-300 p-4 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all resize-none bg-white"
                  placeholder="Enter detailed clinical symptoms (e.g. acute respiratory distress, persistent high fever...)"
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                />
                <Button
                  disabled={!patient || !symptoms || loading}
                  onClick={assess}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.918l1-1.622z"></path></svg>
                      Processing Analysis...
                    </span>
                  ) : "Generate Triage Analysis"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 text-red-700">
                {message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {triage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-10"
            >
              <TriageResultCard result={triage} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
