import { useEffect, useState } from "react";
import {
  Building2,
  Stethoscope,
  CheckCircle2,
  XCircle,
  UserCheck,
  FileCheck,
  Calendar,
  CheckCheck,
  ShieldCheck,
  Pill,
  Bell,
  LogOut,
  AlertTriangle,
  Printer,
  Search,
  ArrowRight,
  X,
  UserPlus
} from "lucide-react";
import { get, patch, post } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/common/StatusBadge";
import { ReferralTimeline } from "../components/ReferralTimeline";
import { OfficialReferralSlip } from "../components/referral/OfficialReferralSlip";
import type {
  Facility,
  Patient,
  Referral,
  ReferralStatus,
  TriageResult,
  Notification,
  FollowUpRecord,
  MedicationPlan,
  MedicationReminder,
  ReferralEvent,
  RankedFacility
} from "../types";

export function StaffDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"FACILITY_QUEUE" | "CLINICAL_JOURNEY" | "INTAKE">("FACILITY_QUEUE");

  // Core Data
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selected, setSelected] = useState<Referral | null>(null);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [medicationPlans, setMedicationPlans] = useState<MedicationPlan[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [rankedFacilities, setRankedFacilities] = useState<RankedFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Intake & Triage State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);

  // Registration Form
  const [regForm, setRegForm] = useState({
    patientId: "",
    name: "",
    age: "",
    gender: "F" as "M" | "F" | "O",
    location: "",
    contact: ""
  });

  // Form Controls
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [closureOutcome, setClosureOutcome] = useState("");
  const [consultNotes, setConsultNotes] = useState("");
  const [diagnosticName, setDiagnosticName] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState("");
  const [diagnosticList, setDiagnosticList] = useState<Array<{ name: string; result?: string; status: "PENDING" | "COMPLETED" }>>([]);

  // Clinician Medication Regimen
  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");
  const [newMedFreq, setNewMedFreq] = useState("");
  const [newMedDays, setNewMedDays] = useState("");
  const [newMedInstructions, setNewMedInstructions] = useState("");
  const [reminderAt, setReminderAt] = useState("");

  // Follow-up
  const [followupDate, setFollowupDate] = useState("");
  const [followupPurpose, setFollowupPurpose] = useState("");
  const [ashaWorker, setAshaWorker] = useState("");

  // Modals & UI states
  const [referralSlipOpen, setReferralSlipOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function refresh() {
    setRefreshing(true);
    try {
      const [r, n, facilityList] = await Promise.all([
        get<Referral[]>("/referrals"),
        get<Notification[]>("/notifications?unread=true"),
        get<Facility[]>("/facilities")
      ]);
      setReferrals(r);
      setAlerts(n);
      setFacilities(facilityList);
      setCurrentFacility(facilityList.find((facility) => facility._id === user?.facilityId) ?? facilityList[0] ?? null);
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

  useEffect(() => {
    void refresh();
  }, []);

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

  async function registerPatient() {
    if (!regForm.name || !regForm.patientId) { setError("Name and Patient ID are required."); return; }
    setLoading(true);
    try {
      const created = await post<Patient>("/patients", {
        patientId: regForm.patientId,
        name: regForm.name,
        age: Number(regForm.age),
        gender: regForm.gender,
        location: regForm.location,
        contact: regForm.contact
      });
      setPatient(created);
      setRegForm({ patientId: "", name: "", age: "", gender: "F", location: "", contact: "" });
      setNotice("Patient registered successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : "Patient registration failed."); } finally { setLoading(false); }
  }

  async function performTriage() {
    if (!patient || !symptoms) { setError("Patient and symptoms are required."); return; }
    setLoading(true);
    try {
      const result = await post<TriageResult>("/triage/assess", { symptoms });
      setTriage(result);
      const ranked = await get<RankedFacility[]>("/facilities/rank", { symptoms, isEmergency: result.priority === "HIGH" });
      setRankedFacilities(ranked);
    } catch (e) { setError(e instanceof Error ? e.message : "Triage failed."); } finally { setLoading(false); }
  }

  async function createReferral() {
    if (!patient || !triage) { setError("Patient and Triage result are required."); return; }
    if (!selectedFacility) { setError("Please select a recommended facility first."); return; }
    setLoading(true);
    try {
      const referral = await post<Referral>("/referrals", {
        referralId: `CC-MH-${Date.now().toString().slice(-6)}`,
        patientId: patient._id,
        fromFacilityId: currentFacility?._id ?? "unknown",
        toFacilityId: selectedFacility._id,
        priority: triage.priority,
        careLevel: triage.suggestedCareLevel
      });
      setSelected(referral);
      setActiveTab("CLINICAL_JOURNEY");
      setNotice("Referral created and routed.");
    } catch (e) { setError(e instanceof Error ? e.message : "Referral creation failed."); } finally { setLoading(false); }
  }

  async function saveMedicationPlan() {
    if (!selected || !newMedName.trim() || !newMedDose.trim() || !newMedFreq.trim() || !newMedDays || !newMedInstructions.trim()) {
      setError("Enter the complete clinician-authored medication plan."); return;
    }
    setLoading(true);
    try {
      const plan = await post<MedicationPlan>("/medications/plan", { referralId: selected._id, items: [{ drugName: newMedName.trim(), dosage: newMedDose.trim(), frequency: newMedFreq.trim(), durationDays: Number(newMedDays), instructions: newMedInstructions.trim() }] });
      setMedicationPlans((items) => [plan, ...items]);
      setNewMedName(""); setNewMedDose(""); setNewMedFreq(""); setNewMedDays(""); setNewMedInstructions("");
      setNotice("Medication plan persisted by the backend.");
    } catch (e) { setError(e instanceof Error ? e.message : "Medication plan could not be saved."); } finally { setLoading(false); }
  }

  async function signOffMedicationPlan(plan: MedicationPlan) {
    try {
      const updated = await patch<MedicationPlan>(`/medications/plan/${plan._id}/sign-off`);
      setMedicationPlans((items) => items.map((item) => item._id === updated._id ? updated : item));
      setNotice("Medication plan sign-off persisted.");
    } catch (e) { setError(e instanceof Error ? e.message : "Medication plan sign-off failed."); }
  }

  async function createReminder() {
    const plan = medicationPlans[0];
    if (!plan || !reminderAt) { setError("Save a medication plan and choose a reminder time first."); return; }
    setLoading(true);
    try { const reminder = await post<MedicationReminder>("/medications/reminders", { planId: plan._id, scheduledAt: reminderAt }); setReminders((items) => [reminder, ...items]); setReminderAt(""); setNotice("Medication reminder scheduled."); }
    catch (e) { setError(e instanceof Error ? e.message : "Reminder could not be scheduled."); } finally { setLoading(false); }
  }

  async function updateReminder(reminder: MedicationReminder, next: MedicationReminder["status"]) {
    const reason = next === "SKIPPED" ? window.prompt("Why was this reminder skipped?") ?? "" : undefined;
    if (next === "SKIPPED" && !(reason ?? "").trim()) return;
    try { const updated = await patch<MedicationReminder>(`/medications/reminders/${reminder._id}`, { status: next, reason }); setReminders((items) => items.map((item) => item._id === updated._id ? updated : item)); }
    catch (e) { setError(e instanceof Error ? e.message : "Reminder could not be updated."); }
  }

  async function createFollowUp() {
    if (!selected || !followupDate || !followupPurpose.trim()) { setError("Enter a follow-up date and purpose."); return; }
    setLoading(true);
    try { const followUp = await post<FollowUpRecord>("/followups", { referralId: selected._id, dueDate: followupDate, purpose: followupPurpose.trim(), assignedAshaWorker: ashaWorker.trim() || undefined }); setFollowUps((items) => [...items, followUp]); await refresh(); await handleSelectReferral(selected); setNotice("Follow-up persisted by the backend."); }
    catch (e) { setError(e instanceof Error ? e.message : "Follow-up could not be created."); } finally { setLoading(false); }
  }

  async function updateFollowUp(followUp: FollowUpRecord, next: FollowUpRecord["status"]) {
    try { const updated = await patch<FollowUpRecord>(`/followups/${followUp._id}`, { status: next }); setFollowUps((items) => items.map((item) => item._id === updated._id ? updated : item)); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Follow-up could not be updated."); }
  }

  async function persistDiagnostics() {
    if (!selected || diagnosticList.length === 0) { setError("Add at least one diagnostic test from the backend-supported record."); return; }
    setLoading(true);
    try {
      if (selected.status === "CONSULTATION_COMPLETED") await post(`/referrals/${selected._id}/diagnostics`, { tests: diagnosticList.map((test) => ({ name: test.name, result: test.result })) });
      const completed = diagnosticList.filter((test) => test.result?.trim()).map((test) => ({ name: test.name, result: test.result!.trim() }));
      if (completed.length !== diagnosticList.length) { await refresh(); await handleSelectReferral(selected); setNotice("Diagnostic orders persisted; complete each result before finalizing."); return; }
      await patch(`/referrals/${selected._id}/diagnostics`, { tests: completed });
      await refresh(); await handleSelectReferral(selected); setNotice("Diagnostic results persisted.");
    } catch (e) { setError(e instanceof Error ? e.message : "Diagnostics could not be saved."); } finally { setLoading(false); }
  }

  async function handleUpdateStatus(nextStatus: ReferralStatus, notesValue?: string) {
    if (!selected) return;
    setLoading(true);
    setError("");
    const note = notesValue ?? (
      nextStatus === "REFERRAL_REJECTED" ? rejectionReason.trim() :
      nextStatus === "CLOSED" ? closureOutcome.trim() :
      nextStatus === "CONSULTATION_COMPLETED" ? consultNotes.trim() :
      `Advanced to ${nextStatus}`
    );
    if (nextStatus === "REFERRAL_REJECTED" && !note) {
      setError("A documented rejection reason is mandatory.");
      setLoading(false);
      return;
    }
    if (nextStatus === "CLOSED" && !note) {
      setError("Documented closure outcome is mandatory before final closure.");
      setLoading(false);
      return;
    }
    try {
      await patch(`/referrals/${selected._id}/status`, { status: nextStatus, notes: note });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The server rejected this transition.");
      setLoading(false);
      return;
    }
    await refresh();
    await handleSelectReferral(selected);
    setLoading(false);
    setNotice(`Referral status advanced to ${nextStatus.replace(/_/g, " ")}.`);
  }

  async function handleConfirmRejection() {
    if (!selected || !rejectionReason.trim()) { setError("A documented rejection reason is mandatory."); return; }
    const alt = facilities.find((facility) => facility._id !== selected.toFacilityId);
    if (!alt) { setError("No alternative backend-ranked facility is available for reassignment."); return; }
    setLoading(true);
    try { await patch(`/referrals/${selected._id}/status`, { status: "REFERRAL_REJECTED", notes: rejectionReason.trim() }); await post(`/referrals/${selected._id}/reassign`, { toFacilityId: alt._id, reason: rejectionReason.trim() }); await refresh(); await handleSelectReferral(selected); setRejectionModalOpen(false); setNotice("Referral reassigned by the backend."); }
    catch (e) { setError(e instanceof Error ? e.message : "The server rejected reassignment."); }
    finally { setLoading(false); }
  }

  const filteredReferrals = referrals.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.referralId.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (r.chiefComplaint && r.chiefComplaint.toLowerCase().includes(q))
    );
  });

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
                    Staff Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  Logged as: <strong className="text-slate-800 font-medium">{user?.name ?? "Dr. S. M. Deshmukh"}</strong> ({user?.role ?? "DOCTOR"})</p>
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
            { id: "FACILITY_QUEUE" as const, label: "1. Facility Inbound Queue", icon: Building2, badge: `${referrals.filter(r => r.status === 'REFERRAL_SENT').length} Pending` },
            { id: "CLINICAL_JOURNEY" as const, label: "2. Clinical Care & Completion Engine (USP)", icon: Stethoscope, badge: selected?.status.replace(/_/g, " ") },
            { id: "INTAKE" as const, label: "3. Patient Intake & Triage", icon: UserPlus, badge: null }
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
                {tab.badge && (
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {tab.badge}
                  </span>
                )}
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
          {activeTab === "FACILITY_QUEUE" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900">{currentFacility?.name ?? "Facility not assigned"}</h2>
                        {currentFacility && <><StatusBadge value={currentFacility.type} size="sm" /><StatusBadge value={currentFacility.verificationState} size="sm" /></>}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Nodal Center: <strong className="text-slate-700">{currentFacility?.nodalOfficer ?? "Not provided"}</strong> · Emergency capability: {currentFacility?.emergencyCapability ? "reported" : "not reported"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="text-center px-3 border-r border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Available ICU Beds</p>
                      <p className="text-base font-extrabold text-teal-800 mt-0.5">{currentFacility?.icuBedsAvailable ?? "—"}</p>
                    </div>
                    <div className="text-center px-3 border-r border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">O₂ Supported Beds</p>
                      <p className="text-base font-extrabold text-sky-800 mt-0.5">{currentFacility?.oxygenBedsAvailable ?? "—"}</p>
                    </div>
                    <div className="text-center px-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Emergency Ambulance</p>
                      <p className="text-xs font-bold text-emerald-700 mt-1">{currentFacility?.ambulancePhone ?? "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search referrals by ID, patient, condition..."
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-slate-900">{filteredReferrals.length}</strong> active patient transfers
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Incoming &amp; In-Care Referral Queue
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Real-time Stream</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredReferrals.map((r) => {
                    const isSelected = selected?._id === r._id;
                    return (
                      <div
                        key={r._id}
                        onClick={() => {
                          setSelected(r);
                          setActiveTab("CLINICAL_JOURNEY");
                        }}
                        className={`p-4 cursor-pointer transition flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/80 ${
                          isSelected ? "bg-teal-50/30 border-l-4 border-teal-600" : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                              {r.referralId}
                            </span>
                            <StatusBadge value={r.priority} size="sm" />
                            <StatusBadge value={r.status} size="sm" />
                            <span className="text-xs font-mono text-slate-500">{r.patientId}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-serif leading-relaxed line-clamp-1">
                            {r.chiefComplaint ?? "Not provided"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {r.status === "REFERRAL_SENT" && (
                            <>
                              <button
                                onClick={() => void handleUpdateStatus("REFERRAL_ACCEPTED", "Receiving facility confirmed bed and specialist capacity.")}
                                disabled={loading}
                                className="flex items-center gap-1 rounded-xl bg-teal-700 hover:bg-teal-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept Referral
                              </button>
                              <button
                                onClick={() => {
                                  setSelected(r);
                                  setRejectionReason("");
                                  setRejectionModalOpen(true);
                                }}
                                disabled={loading}
                                className="flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-900 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject (Re-route)
                              </button>
                            </>
                          )}
                          {r.status === "REFERRAL_ACCEPTED" && (
                            <button
                              onClick={() => void handleUpdateStatus("PATIENT_ARRIVED", "Patient physically reached the emergency/OPD triage reception.")}
                              disabled={loading}
                              className="flex items-center gap-1 rounded-xl bg-violet-700 hover:bg-violet-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Mark Patient Arrived
                            </button>
                          )}
                          {["PATIENT_ARRIVED", "CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED"].includes(r.status) && (
                            <button
                              onClick={() => {
                                setSelected(r);
                                setActiveTab("CLINICAL_JOURNEY");
                              }}
                              className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                            >
                              Manage Clinical Care <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {r.status === "CLOSED" && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Closed Loop (USP)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "CLINICAL_JOURNEY" && selected && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Canonical Referral State Machine</h3>
                    <p className="text-xs text-slate-500">Care journey progress tracked across verified protocol gates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReferralSlipOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-700" /> Official Referral Slip
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-center min-w-[700px] justify-between relative">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                    {["REFERRAL_SENT", "REFERRAL_ACCEPTED", "PATIENT_ARRIVED", "CONSULTATION_COMPLETED", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"].map((status, idx) => {
                      const currIdx = ["REFERRAL_SENT", "REFERRAL_ACCEPTED", "PATIENT_ARRIVED", "CONSULTATION_COMPLETED", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"].indexOf(selected.status);
                      const isCompleted = currIdx > idx || selected.status === "CLOSED";
                      const isCurrent = currIdx === idx && selected.status !== "CLOSED";
                      return (
                        <div key={status} className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              isCompleted
                                ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                                : isCurrent
                                ? "bg-teal-700 text-white ring-4 ring-teal-100 animate-pulse"
                                : "bg-slate-100 text-slate-400 border border-slate-300"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`mt-2 text-[11px] font-semibold whitespace-nowrap ${
                              isCompleted ? "text-emerald-800" : isCurrent ? "text-teal-900 font-bold" : "text-slate-400"
                            }`}>
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded">
                        {selected.referralId}
                      </span>
                      <StatusBadge value={selected.priority} />
                      <StatusBadge value={selected.status} />
                      <StatusBadge value={selected.careLevel} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600">
                      Patient: <strong className="text-slate-900 font-mono">{selected.patientId}</strong> · Condition: <span className="font-serif text-slate-800">"{selected.chiefComplaint}"</span>
                    </p>
                  </div>
                  {selected.status === "CLOSED" && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-emerald-950 text-xs">
                      <span className="font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-700" /> Formal Referral Closure Verified</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">Outcome: {selected.closureOutcome ?? "Treatment completed successfully"}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                selected.status === "REFERRAL_ACCEPTED" ? "ring-2 ring-violet-500/20 border-violet-500" : "border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-violet-50 text-violet-700 rounded-xl border border-violet-200">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">1. Reception &amp; Physical Arrival Handover</h3>
                      <p className="text-xs text-slate-500">Record when ambulance reaches receiving facility</p>
                    </div>
                  </div>
                  <StatusBadge value={["REFERRAL_SENT", "REFERRAL_ACCEPTED"].includes(selected.status) ? "PENDING" : "COMPLETED"} size="sm" />
                </div>
                {selected.status === "REFERRAL_ACCEPTED" && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-600">Ambulance transfer confirmed. Click when patient reaches triage desk.</p>
                    <button
                      onClick={() => void handleUpdateStatus("PATIENT_ARRIVED", "Patient arrival confirmed by receiving facility staff.")}
                      disabled={loading}
                      className="rounded-xl bg-violet-700 hover:bg-violet-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Confirm Patient Arrived
                    </button>
                  </div>
                )}
              </div>

              <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                selected.status === "PATIENT_ARRIVED" ? "ring-2 ring-teal-500/20 border-teal-500" : "border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">2. Medical Officer Clinical Review</h3>
                      <p className="text-xs text-slate-500">Doctor physical evaluation and bedside findings</p>
                    </div>
                  </div>
                  <StatusBadge value={["REFERRAL_SENT", "REFERRAL_ACCEPTED", "PATIENT_ARRIVED"].includes(selected.status) ? "PENDING" : "COMPLETED"} size="sm" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Clinical Examination Notes:</label>
                  <textarea
                    rows={3}
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    disabled={!["PATIENT_ARRIVED", "CONSULTATION_COMPLETED"].includes(selected.status)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                  />
                  {selected.status === "PATIENT_ARRIVED" && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => void handleUpdateStatus("CONSULTATION_COMPLETED", consultNotes)}
                        disabled={loading}
                        className="rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-4 h-4" /> Save Consultation &amp; Proceed
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                ["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING"].includes(selected.status) ? "ring-2 ring-cyan-500/20 border-cyan-500" : "border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">3. Diagnostic Investigation Record</h3>
                      <p className="text-xs text-slate-500">Laboratory and radiology investigations ordered &amp; verified</p>
                    </div>
                  </div>
                  <StatusBadge value={["DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"].includes(selected.status) ? "COMPLETED" : "IN_PROGRESS"} size="sm" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 font-semibold">Investigation</th>
                          <th className="p-2.5 font-semibold">Clinical Finding</th>
                          <th className="p-2.5 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {diagnosticList.map((d, i) => (
                          <tr key={i} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-900">{d.name}</td>
                            <td className="p-2.5 text-slate-700 font-serif">{d.result ?? "Pending lab upload"}</td>
                            <td className="p-2.5 text-right">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING"].includes(selected.status) && <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input className="rounded-lg border p-2 text-xs" value={diagnosticName} onChange={(e) => setDiagnosticName(e.target.value)} placeholder="Investigation name" />
                    <input className="rounded-lg border p-2 text-xs" value={diagnosticResult} onChange={(e) => setDiagnosticResult(e.target.value)} placeholder="Result (leave blank to order)" />
                    <button onClick={() => { if (!diagnosticName.trim()) return; setDiagnosticList((items) => [...items, { name: diagnosticName.trim(), result: diagnosticResult.trim() || undefined, status: diagnosticResult.trim() ? "COMPLETED" : "PENDING" }]); setDiagnosticName(""); setDiagnosticResult(""); }} className="rounded-lg border px-3 py-2 text-xs font-semibold">Add test</button>
                  </div>}
                  {["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING"].includes(selected.status) && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => void persistDiagnostics()}
                        disabled={loading}
                        className="rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        <FileCheck className="w-4 h-4" /> Mark Diagnostics Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">4. Clinician Medication Regimen</h3>
                      <p className="text-xs text-slate-500">Doctor-prescribed medication plan only</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    Doctor Signed
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {medicationPlans.flatMap((plan) => plan.items).map((m, idx) => (
                    <div key={`${m.drugName}-${idx}`} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <strong className="text-slate-900">{m.drugName}</strong> · <span className="text-slate-600">{m.dosage}</span> · <span className="text-slate-500">{m.frequency} ({m.durationDays} days)</span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Active
                      </span>
                    </div>
                  ))}
                  {["CONSULTATION_COMPLETED", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED"].includes(selected.status) && <div className="grid gap-2 sm:grid-cols-2">
                    <input className="rounded-lg border p-2 text-xs" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder="Generic medicine name" />
                    <input className="rounded-lg border p-2 text-xs" value={newMedDose} onChange={(e) => setNewMedDose(e.target.value)} placeholder="Dosage / strength" />
                    <input className="rounded-lg border p-2 text-xs" value={newMedFreq} onChange={(e) => setNewMedFreq(e.target.value)} placeholder="Frequency" />
                    <input className="rounded-lg border p-2 text-xs" type="number" min="1" value={newMedDays} onChange={(e) => setNewMedDays(e.target.value)} placeholder="Duration (days)" />
                    <input className="rounded-lg border p-2 text-xs sm:col-span-2" value={newMedInstructions} onChange={(e) => setNewMedInstructions(e.target.value)} placeholder="Clinician instructions" />
                    <button onClick={() => void saveMedicationPlan()} disabled={loading} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Save medication plan</button>
                  </div>}
                  {medicationPlans[0] && <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input className="rounded-lg border p-2 text-xs" type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} /><button onClick={() => void createReminder()} disabled={loading} className="rounded-lg border px-3 py-2 text-xs font-semibold">Schedule reminder</button></div>}
                  {medicationPlans[0] && !medicationPlans[0].signedOff && <button onClick={() => void signOffMedicationPlan(medicationPlans[0])} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Doctor sign off medication plan</button>}
                  {reminders.length > 0 && <div className="space-y-1">{reminders.map((reminder) => <div key={reminder._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs"><span>{new Date(reminder.scheduledAt).toLocaleString()} · {reminder.status}</span>{reminder.status === "SCHEDULED" && <span className="flex gap-1"><button onClick={() => void updateReminder(reminder, "TAKEN")} className="rounded border px-2 py-1">Taken</button><button onClick={() => void updateReminder(reminder, "SKIPPED")} className="rounded border px-2 py-1">Skip</button></span>}</div>)}</div>}
                </div>
              </div>

              <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                ["DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED"].includes(selected.status) ? "ring-2 ring-purple-500/20 border-purple-500" : "border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">5. Follow-up Tracking &amp; ASHA Outreach</h3>
                      <p className="text-xs text-slate-500">Prevents rural patient dropout</p>
                    </div>
                  </div>
                  <StatusBadge value={selected.status === "CLOSED" || selected.status === "FOLLOW_UP_COMPLETED" ? "COMPLETED" : selected.status === "FOLLOW_UP_REQUIRED" ? "UPCOMING" : "PENDING"} size="sm" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Follow-up Due Date:</label>
                      <input
                        type="date"
                        value={followupDate}
                        onChange={(e) => setFollowupDate(e.target.value)}
                        disabled={["FOLLOW_UP_COMPLETED", "CLOSED"].includes(selected.status)}
                        className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Assigned ASHA Worker:</label>
                      <input
                        type="text"
                        value={ashaWorker}
                        onChange={(e) => setAshaWorker(e.target.value)}
                        disabled={["FOLLOW_UP_COMPLETED", "CLOSED"].includes(selected.status)}
                        className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {selected.status === "DIAGNOSTIC_COMPLETED" && (
                      <button
                        onClick={() => void createFollowUp()}
                        disabled={loading}
                        className="rounded-xl bg-purple-700 hover:bg-purple-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" /> Schedule Follow-up Review
                      </button>
                    )}
                    {selected.status === "FOLLOW_UP_REQUIRED" && (
                      <button
                        onClick={() => { const followUp = followUps.find((item) => item.status !== "COMPLETED"); if (followUp) void updateFollowUp(followUp, "COMPLETED"); else setError("No persisted follow-up is available to complete."); }}
                        disabled={loading || followUps.length === 0}
                        className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-4 h-4" /> Mark Follow-up Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border p-5 shadow-sm transition ${
                selected.status === "CLOSED"
                  ? "border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                  : selected.status === "FOLLOW_UP_COMPLETED"
                  ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white opacity-90"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">6. Formal Referral Closure Gate</h3>
                      <p className="text-xs text-slate-600">Formal signoff only after treatment and follow-up completion</p>
                    </div>
                  </div>
                  <StatusBadge value={selected.status === "CLOSED" ? "CLOSED" : "GATE_LOCKED"} size="sm" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Final Treatment &amp; Recovery Outcome:</label>
                    <input
                      type="text"
                      value={closureOutcome}
                      onChange={(e) => setClosureOutcome(e.target.value)}
                      disabled={selected.status !== "FOLLOW_UP_COMPLETED"}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-500">
                      {selected.status === "FOLLOW_UP_COMPLETED"
                        ? "✓ All clinical milestones fulfilled. Ready for official closure."
                        : "🔒 Closure locked: Requires Completed Follow-up."}
                    </p>
                    {selected.status === "FOLLOW_UP_COMPLETED" && (
                      <button
                        onClick={() => void handleUpdateStatus("CLOSED", closureOutcome)}
                        disabled={loading}
                        className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" /> Close Referral Loop (USP)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <ReferralTimeline events={events} />
            </div>
          )}

          {activeTab === "INTAKE" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Patient Registration
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <label className="block text-slate-600">Patient ID
                    <input className="mt-1 w-full rounded-lg border border-slate-200 p-2" value={regForm.patientId} onChange={(e) => setRegForm((c) => ({ ...c, patientId: e.target.value }))} placeholder="e.g. PAT-1001" />
                  </label>
                  <label className="block text-slate-600">Name
                    <input className="mt-1 w-full rounded-lg border border-slate-200 p-2" value={regForm.name} onChange={(e) => setRegForm((c) => ({ ...c, name: e.target.value }))} placeholder="Savitri Patil" />
                  </label>
                  <label className="block text-slate-600">Age
                    <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 p-2" value={regForm.age} onChange={(e) => setRegForm((c) => ({ ...c, age: e.target.value }))} placeholder="42" />
                  </label>
                  <label className="block text-slate-600">Gender
                    <select className="mt-1 w-full rounded-lg border border-slate-200 p-2" value={regForm.gender} onChange={(e) => setRegForm((c) => ({ ...c, gender: e.target.value as "M" | "F" | "O" }))}>
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="O">Other</option>
                    </select>
                  </label>
                  <label className="block text-slate-600 sm:col-span-2">Location
                    <input className="mt-1 w-full rounded-lg border border-slate-200 p-2" value={regForm.location} onChange={(e) => setRegForm((c) => ({ ...c, location: e.target.value }))} placeholder="Village, District" />
                  </label>
                  <label className="block text-slate-600 sm:col-span-2">Contact
                    <input className="mt-1 w-full rounded-lg border border-slate-200 p-2" value={regForm.contact} onChange={(e) => setRegForm((c) => ({ ...c, contact: e.target.value }))} placeholder="+91 ..." />
                  </label>
                </div>
                <button onClick={() => void registerPatient()} disabled={loading} className="mt-4 w-full rounded-lg bg-teal-700 py-2 text-xs font-bold text-white transition hover:bg-teal-800">
                  {loading ? "Registering..." : "Register Patient"}
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  AI Triage Assessment
                </h3>
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 italic">Register a patient first to begin triage.</p>
                  <textarea
                    rows={4}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    disabled={!patient}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:border-teal-500 focus:outline-none disabled:bg-slate-50"
                    placeholder="Describe the chief concern, symptoms, and danger signs..."
                  />
                  <button
                    disabled={!patient || !symptoms || loading}
                    onClick={() => void performTriage()}
                    className="w-full rounded-xl bg-teal-700 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                  >
                    {loading ? "Assessing..." : "Assess via AI Decision Support"}
                  </button>
                </div}
              </div>
              {triage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6 col-span-full">
                  <div className="space-y-3">
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

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Recommended Facilities (AI-Ranked)</h3>
                      <span className="text-xs text-slate-500">Based on symptoms &amp; urgency</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {rankedFacilities.map((rf, i) => (
                        <div
                          key={rf.facility._id}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            selectedFacility?._id === rf.facility._id
                              ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                              : "border-slate-200 bg-white hover:border-teal-300"
                          }`}
                          onClick={() => setSelectedFacility(rf.facility)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="text-xs font-bold text-slate-900">{rf.facility.name}</strong>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">Score: {rf.score}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 italic mb-2">{rf.breakdown.explanation}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{rf.facility.type}</span>
                            <span>{rf.distanceKm ? `${rf.distanceKm}km` : "N/A"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {rankedFacilities.length === 0 && <p className="text-xs text-slate-500 italic">No recommended facilities found for this case.</p>}
                  </div>

                  <button
                    disabled={!patient || !triage || !selectedFacility || loading}
                    onClick={() => void createReferral()}
                    className="w-full rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                  >
                    Create Formal Referral
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <OfficialReferralSlip
          referral={selected}
          patient={patient}
          facility={currentFacility}
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
              <h3 className="text-sm font-bold text-slate-900">Staff Alerts</h3>
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
                {a.referralId && (
                  <span className="inline-block font-mono text-[10px] font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded mt-1">
                    {a.referralId}
                  </span>
                )}
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
