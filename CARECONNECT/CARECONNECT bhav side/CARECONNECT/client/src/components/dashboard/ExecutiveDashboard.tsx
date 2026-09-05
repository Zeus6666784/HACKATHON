import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  AlertOctagon, 
  ShieldCheck, 
  Clock, 
  Users, 
  Flame, 
  Building, 
  ArrowUpRight, 
  PhoneCall, 
  RefreshCw,
  ExternalLink
} from "lucide-react";
import type { DashboardStats, Referral, Role } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface ExecutiveDashboardProps {
  stats: DashboardStats;
  overdueReferrals: Referral[];
  onRefresh: () => Promise<void>;
  onSelectReferral: (referral: Referral) => void;
  currentUserRole: Role;
}

export function ExecutiveDashboard({
  stats,
  overdueReferrals,
  onRefresh,
  onSelectReferral,
  currentUserRole
}: ExecutiveDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  // Calculate percentage shares for priorities
  const totalPriority = stats.priorityBreakdown.high + stats.priorityBreakdown.medium + stats.priorityBreakdown.low || 1;
  const highPct = Math.round((stats.priorityBreakdown.high / totalPriority) * 100);
  const medPct = Math.round((stats.priorityBreakdown.medium / totalPriority) * 100);
  const lowPct = Math.round((stats.priorityBreakdown.low / totalPriority) * 100);

  return (
    <div className="space-y-6">
      {/* Directorate Header */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded border border-teal-800/60">
              National Health Mission · Maharashtra
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Health Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Referral Continuity & Leakage Monitor</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Statewide tracking of inter-facility clinical transfers, adherence to referral follow-up protocols, and prevention of rural patient drop-out across 36 districts.
          </p>
        </div>

        <button
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-teal-400 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Syncing Metrics..." : "Sync State Data"}
        </button>
      </div>

      {/* KPI Tiles (Top Row) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Referrals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Referrals</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.totalReferrals}</span>
            <span className="text-xs text-slate-500">cases</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> Active in transit: <strong className="text-slate-800">{stats.activeInTransit}</strong>
          </p>
        </div>

        {/* Closed Loops (USP) */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Closed Care Loops (USP)</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-950 font-mono">{stats.closedLoops}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {stats.closureRate}% Rate
            </span>
          </div>
          <p className="mt-2 text-xs text-emerald-800 font-medium">
            Full cycle: arrival, consultation & completed follow-up
          </p>
        </div>

        {/* Leakage / Drop-Out Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Referral Leakage Rate</span>
            <div className="rounded-xl bg-orange-50 p-2 text-orange-700 border border-orange-200">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.leakageRate}%</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              ↓ Target &lt; 5%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Lost-to-follow-up: <strong className="text-rose-700">{stats.lostToFollowUp ?? 0}</strong> cases
          </p>
        </div>

        {/* Avg Transfer Velocity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Transfer Time</span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-700 border border-teal-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.avgTransferTimeHours}</span>
            <span className="text-xs text-slate-500">hours</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            From PHC referral dispatch to hospital arrival
          </p>
        </div>
      </div>

      {/* Middle Section: Priority & Facility Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Triage Priority Distribution
            </h3>
            <span className="text-xs text-slate-500">{totalPriority} total triaged</span>
          </div>

          {/* Visual Bar */}
          <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
            <div style={{ width: `${highPct}%` }} className="bg-rose-500 transition-all duration-500" title={`High: ${highPct}%`} />
            <div style={{ width: `${medPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Medium: ${medPct}%`} />
            <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Low: ${lowPct}%`} />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-rose-50 p-3 border border-rose-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <Flame className="w-3.5 h-3.5" /> High Urgency
              </div>
              <p className="mt-1 text-xl font-extrabold text-rose-950 font-mono">{stats.priorityBreakdown.high}</p>
              <span className="text-[11px] text-rose-700">{highPct}% of total</span>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Clock className="w-3.5 h-3.5" /> Medium Urgency
              </div>
              <p className="mt-1 text-xl font-extrabold text-amber-950 font-mono">{stats.priorityBreakdown.medium}</p>
              <span className="text-[11px] text-amber-700">{medPct}% of total</span>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Routine
              </div>
              <p className="mt-1 text-xl font-extrabold text-emerald-950 font-mono">{stats.priorityBreakdown.low}</p>
              <span className="text-[11px] text-emerald-700">{lowPct}% of total</span>
            </div>
          </div>
        </div>

        {/* Care Level Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Care Level Utilization
            </h3>
            <span className="text-xs text-slate-500">Facility tiers</span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>District Hospitals (DH / Civil Hospitals)</span>
                <span className="font-mono">{stats.careLevelBreakdown.district} cases</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  style={{ width: `${Math.round((stats.careLevelBreakdown.district / (stats.totalReferrals || 1)) * 100)}%` }} 
                  className="h-full bg-teal-600 rounded-full" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Tertiary Care & Govt Medical Colleges (GMC)</span>
                <span className="font-mono">{stats.careLevelBreakdown.tertiary} cases</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  style={{ width: `${Math.round((stats.careLevelBreakdown.tertiary / (stats.totalReferrals || 1)) * 100)}%` }} 
                  className="h-full bg-indigo-600 rounded-full" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Primary Health Centres (Stabilization & Sub-District)</span>
                <span className="font-mono">{stats.careLevelBreakdown.phc} cases</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  style={{ width: `${Math.round((stats.careLevelBreakdown.phc / (stats.totalReferrals || 1)) * 100)}%` }} 
                  className="h-full bg-slate-600 rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Overdue & Lost-to-Followup Action Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              Overdue & At-Risk Referrals Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients requiring immediate outreach to prevent dropout or missed clinical consultations.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg self-start">
            {overdueReferrals.length} Cases Flagged
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          {overdueReferrals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              ✓ Zero overdue cases. All referral handovers and follow-ups are within standard clinical turnaround times.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold">Referral ID</th>
                  <th className="p-3 font-semibold">Patient ID</th>
                  <th className="p-3 font-semibold">Priority</th>
                  <th className="p-3 font-semibold">Current State</th>
                  <th className="p-3 font-semibold">Flag Reason</th>
                  <th className="p-3 font-semibold text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueReferrals.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-bold text-teal-800">{item.referralId}</td>
                    <td className="p-3 font-mono text-slate-700">{item.patientId}</td>
                    <td className="p-3">
                      <StatusBadge value={item.priority} size="sm" />
                    </td>
                    <td className="p-3">
                      <StatusBadge value={item.status} size="sm" />
                    </td>
                    <td className="p-3 text-rose-800 font-medium">
                      {item.status === "LOST_TO_FOLLOWUP" 
                        ? "Patient failed to attend scheduled PHC follow-up" 
                        : "Arrival pending > 4 hours since ambulance dispatch"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectReferral(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-800 transition"
                      >
                        <PhoneCall className="w-3 h-3" /> ASHA Outreach <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
