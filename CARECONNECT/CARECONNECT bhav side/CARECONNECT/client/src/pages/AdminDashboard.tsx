import { useEffect, useState } from "react";
import {
  Building2,
  TrendingUp,
  RefreshCw,
  Bell,
  LogOut,
  Clock,
  Flame,
  ShieldCheck,
  AlertOctagon,
  PhoneCall,
  X
} from "lucide-react";
import { get } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/common/StatusBadge";
import type {
  DashboardStats,
  Referral,
  Notification
} from "../types";

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReferrals: 0, activeInTransit: 0, closedLoops: 0, closureRate: 0, overdueCount: 0, leakageRate: 0, avgTransferTimeHours: 0, lostToFollowUp: 0,
    priorityBreakdown: { high: 0, medium: 0, low: 0 }, careLevelBreakdown: { phc: 0, district: 0, tertiary: 0 }
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const [r, s, n] = await Promise.all([
        get<Referral[]>("/referrals"),
        get<DashboardStats>("/dashboard/stats"),
        get<Notification[]>("/notifications?unread=true")
      ]);
      setReferrals(r);
      setStats(s);
      setAlerts(n);
    } catch (e) {
      console.error("Failed to refresh admin dashboard:", e);
    } finally {
      setRefreshing(false);
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
                    Directorate Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  Logged as: <strong className="text-slate-800 font-medium">{user?.name ?? "Admin"}</strong> ({user?.role ?? "ADMIN"})</p>
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

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded border border-teal-800/60">
                  Maharashtra State Directorate
                </span>
                <span className="text-xs text-slate-400 font-mono">Real-Time Referral Intelligence</span>
              </div>
              <h2 className="text-2xl font-bold mt-2">Referral Continuity &amp; Leakage Monitor</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Executive tracking of rural patient transfers, bed utilization, follow-up adherence, and patient drop-out prevention across Maharashtra.
              </p>
            </div>
            <button
              onClick={() => void refresh()}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition shrink-0"
            >
              <RefreshCw className={`w-4 h-4 text-teal-400 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Sync State Data"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Referrals</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.totalReferrals}</span>
                <span className="text-xs text-slate-500">cases</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Active in transit: <strong className="text-slate-800">{stats.activeInTransit}</strong>
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Closed Care Loops (USP)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-950 font-mono">{stats.closedLoops}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {stats.closureRate}% Rate
                </span>
              </div>
              <p className="mt-2 text-xs text-emerald-800 font-medium">
                100% completed clinical cycles
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Referral Leakage Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.leakageRate}%</span>
                <span className="text-xs text-emerald-600 font-medium">Target &lt; 5%</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Lost-to-followup: <strong className="text-rose-700">{stats.lostToFollowUp ?? 0}</strong> cases
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Transfer Time</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.avgTransferTimeHours}</span>
                <span className="text-xs text-slate-500">hours</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                From PHC dispatch to hospital bed
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Triage Priority Breakdown</h3>
                <span className="text-xs text-slate-500 font-mono">{referrals.length} Cases</span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div style={{ width: "27%" }} className="bg-rose-500" title="High: 27%" />
                <div style={{ width: "49%" }} className="bg-amber-500" title="Medium: 49%" />
                <div style={{ width: "24%" }} className="bg-emerald-500" title="Low: 24%" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-rose-50 p-3 border border-rose-100">
                  <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> High Urgency
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-rose-950 font-mono">{stats.priorityBreakdown.high}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Medium Urgency
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-amber-950 font-mono">{stats.priorityBreakdown.medium}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Routine (Low)
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-emerald-950 font-mono">{stats.priorityBreakdown.low}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Care Level Utilization</h3>
                <span className="text-xs text-slate-500 font-mono">Hospital Tiers</span>
              </div>
              <div className="space-y-3 pt-1 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>District Hospitals (DH / Civil Hospitals)</span>
                    <span className="font-mono">{stats.careLevelBreakdown.district} cases</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: "58%" }} className="h-full bg-teal-600 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Tertiary Care &amp; Govt Medical Colleges (GMC)</span>
                    <span className="font-mono">{stats.careLevelBreakdown.tertiary} cases</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: "25%" }} className="h-full bg-indigo-600 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Primary Health Centres (Stabilization)</span>
                    <span className="font-mono">{stats.careLevelBreakdown.phc} cases</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: "17%" }} className="h-full bg-slate-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" /> Overdue &amp; Lost-to-Followup Queue
                </h3>
                <p className="text-xs text-slate-500">Patients requiring immediate nurse / ASHA outreach</p>
              </div>
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
                {referrals.filter((r) => ["LOST_TO_FOLLOWUP", "OVERDUE"].includes(r.status)).length} Flagged
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold">Referral ID</th>
                    <th className="p-3 font-semibold">Patient ID</th>
                    <th className="p-3 font-semibold">Priority</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Alert Reason</th>
                    <th className="p-3 font-semibold text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referrals.filter((r) => ["LOST_TO_FOLLOWUP", "OVERDUE"].includes(r.status)).map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-bold text-teal-800">{item.referralId}</td>
                      <td className="p-3 font-mono text-slate-700">{item.patientId}</td>
                      <td className="p-3"><StatusBadge value={item.priority} size="sm" /></td>
                      <td className="p-3"><StatusBadge value={item.status} size="sm" /></td>
                      <td className="p-3 text-rose-800 font-medium">Backend flagged this referral for overdue follow-up or loss to follow-up.</td>
                      <td className="p-3 text-right">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-800 transition"
                        >
                          <PhoneCall className="w-3 h-3" /> Outreach &amp; Follow-up
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <div className={`fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity ${
        notificationDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">Directorate Alerts</h3>
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

type Notification = { id: string; _id?: string; title: string; message: string; type: "URGENT" | "INFO" | "SUCCESS" | "WARNING"; timestamp: string; referralId?: string; read: boolean };
