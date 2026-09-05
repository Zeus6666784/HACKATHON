import { useEffect, useState } from "react";
import {
  UserCheck,
  Bell,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Calendar,
  CheckCheck,
  Pill
} from "lucide-react";
import { get, post } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/common/StatusBadge";
import { ReferralTimeline } from "../components/ReferralTimeline";
import { OfficialReferralSlip } from "../components/referral/OfficialReferralSlip";
import type {
  Referral,
  ReferralEvent,
  FollowUpRecord,
  MedicationPlan,
  MedicationReminder,
  TriageResult,
  Patient
} from "../types";

export function PatientDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"INTAKE" | "JOURNEY">("INTAKE");

  // Core Data
  const [selected, setSelected] = useState<Referral | null>(null);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [medicationPlans, setMedicationPlans] = useState<MedicationPlan[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);

  // Intake & Triage State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [referralSlipOpen, setReferralSlipOpen] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const [r, n] = await Promise.all([
        get<Referral[]>("/referrals"),
        get<Notification[]>("/notifications?unread=true")
      ]);
      setAlerts(n);
      if (!selected && r.length > 0) {
        void handleSelectReferral(r[0]);
      }
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load dashboard data.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSelectReferral(referral: Referral) {
    setSelected(referral);
    try {
      const detail = await get<{ referral: Referral; events: ReferralEvent[]; followUps?: FollowUpRecord[]; medicationPlans?: MedicationPlan[] }>(`/referrals/${referral._id}`);
      if (detail?.referral) setSelected(detail.referral);
      if (detail?.events) setEvents(detail.events);
      setFollowUps(detail.followUps ?? []);
      setMedicationPlans(detail.medicationPlans ?? []);
      const plans = detail.medicationPlans ?? [];
      if (plans[0]) setReminders(await get<MedicationReminder[]>(`/medications/reminders?planId=${plans[0]._id}`));
      else setReminders([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load referral details.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-teal-400">सार्वजनिक आरोग्य विभाग</span>
              <span className="text-slate-600">|</span>
              <span className="hidden sm:inline text-slate-400">Government of Maharashtra · Health &amp; Family Welfare</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                State Gateway Active
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white font-black text-lg shadow-sm shadow-teal-700/30">
                CC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 sm:text-lg tracking-tight">
                    CareConnect <span className="text-teal-700 font-extrabold">Maharashtra</span>
                  </h1>
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                    Patient Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  Logged as: <strong className="text-slate-800 font-medium">{user?.name ?? "Patient"}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                <Bell className="w-4 h-4" />
                {alerts.filter((a) => !a.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                    {alerts.filter((a) => !a.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => void logout()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex gap-2 overflow-x-auto py-2">
          {[
            { id: "INTAKE" as const, label: "1. Triage &amp; Intake", icon: UserCheck },
            { id: "JOURNEY" as const, label: "2. My Care Journey", icon: Stethoscope },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-teal-700 text-white shadow-xs shadow-teal-700/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {(notice || error) && (
        <div className={`px-4 py-2.5 text-xs font-semibold border-b ${
          error ? "bg-rose-50 text-rose-900 border-rose-200" : "bg-emerald-50 text-emerald-900 border-emerald-200"
        }`}>
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {error ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span>{error || notice}</span>
            </div>
            <button onClick={() => { setNotice(""); setError(""); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {activeTab === "INTAKE" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Patient Demographics
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-600 block">Name:</span>
                    <strong className="text-slate-900">{patient?.name ?? user?.name}</strong>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block">Patient ID:</span>
                    <strong className="font-mono text-slate-900">{patient?.patientId ?? "MH-THN-2026-8941"}</strong>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Reported Symptoms
                </h3>
                <textarea
                  rows={4}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-teal-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await post<TriageResult>("/triage/assess", { symptoms });
                        setTriage(res);
                      } catch {
                        // Fallback handled by service
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2 text-xs font-bold text-white transition"
                  >
                    {loading ? "Assessing..." : "Assess via AI Decision Support"}
                  </button>
                </div>
              </div>
              {triage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 col-span-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">AI Clinical Triage Result</h3>
                    <StatusBadge value={triage.priority} />
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {triage.reasoning}
                  </p>
                  <p className="text-xs font-semibold text-teal-800">
                    Next action: {triage.recommendedNextAction}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "JOURNEY" && selected && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Care Journey Progress</h3>
                  <button
                    onClick={() => setReferralSlipOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-700" /> Official Referral Slip
                  </button>
                </div>
                <ReferralTimeline events={events} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded">
                    {selected.referralId}
                  </span>
                  <StatusBadge value={selected.priority} />
                  <StatusBadge value={selected.status} />
                  <StatusBadge value={selected.careLevel} size="sm" />
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Condition: <span className="font-serif text-slate-800">"{selected.chiefComplaint}"</span>
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <Calendar className="w-4 h-4 text-purple-600" /> Follow-up Appointments
                  </div>
                  {followUps.length > 0 ? (
                    <div className="space-y-2">
                      {followUps.map((fu) => (
                        <div key={fu._id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800">{fu.dueDate}</p>
                            <p className="text-slate-600">{fu.purpose}</p>
                          </div>
                          <StatusBadge value={fu.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No follow-up appointments scheduled.</p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <Pill className="w-4 h-4 text-emerald-600" /> Medication Reminders
                  </div>
                  {reminders.length > 0 ? (
                    <div className="space-y-2">
                      {reminders.map((r) => (
                        <div key={r._id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800">{new Date(r.scheduledAt).toLocaleString()}</p>
                            <p className="text-slate-600">Reminder to take medication</p>
                          </div>
                          <StatusBadge value={r.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No active medication reminders.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selected && (
        <OfficialReferralSlip
          referral={selected}
          patient={patient}
          facility={null}
          isOpen={referralSlipOpen}
          onClose={() => setReferralSlipOpen(false)}
        />
      )}

      <div className={`fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity ${
        notificationDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">My Alerts</h3>
            </div>
            <button onClick={() => setNotificationDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5">
            {alerts.map((a) => (
              <div key={a.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">{a.title}</strong>
                  <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setNotificationDrawerOpen(false)}
            className="w-full rounded-xl bg-slate-900 text-white py-2 text-xs font-semibold"
          >
            Close Alerts
          </button>
        </div>
      </div>
    </div>
  );
}

type Notification = { id: string; _id?: string; title: string; message: string; type: "URGENT" | "INFO" | "SUCCESS" | "WARNING"; timestamp: string; referralId?: string; read: boolean };
