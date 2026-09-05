import { useState } from "react";
import { 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Activity, 
  ChevronDown,
  Building2,
  Stethoscope,
  HeartHandshake
} from "lucide-react";
import type { Role } from "../../types";

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
  facilityName?: string;
}

const ROLES: Array<{ id: Role; label: string; icon: typeof Stethoscope; description: string }> = [
  { id: "DOCTOR", label: "Medical Officer (Doctor)", icon: Stethoscope, description: "Consultation, Diagnostics, Follow-up & Closure" },
  { id: "HEALTH_WORKER", label: "ANM / ASHA (Health Worker)", icon: HeartHandshake, description: "Patient Intake, Symptom Triage, Referral Dispatch" },
  { id: "FACILITY_STAFF", label: "Receiving Facility Staff", icon: Building2, description: "Incoming Queue, Bed Acceptance, Arrival Reception" },
  { id: "ADMIN", label: "State Health Director (Admin)", icon: ShieldCheck, description: "Full Statewide Authority, Overdue Queues, KPIs" }
];

export function Header({
  currentRole,
  onRoleChange,
  unreadNotificationCount,
  onOpenNotifications,
  onLogout,
  facilityName
}: HeaderProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const activeRoleConfig = ROLES.find((r) => r.id === currentRole) ?? ROLES[0];
  const ActiveIcon = activeRoleConfig.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
      {/* Top Govt Bar */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-teal-400">सार्वजनिक आरोग्य विभाग</span>
            <span className="text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Government of Maharashtra · Health & Family Welfare</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              State Gateway Active
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-slate-400">HMIS Interop v2.4</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white font-black text-lg shadow-sm shadow-teal-700/30">
              CC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 sm:text-lg tracking-tight">
                  CareConnect <span className="text-teal-700 font-extrabold">Maharashtra</span>
                </h1>
                <span className="hidden md:inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                  Referral Continuity Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Station: <strong className="text-slate-800 font-medium">{facilityName ?? "Not assigned"}</strong></span>
              </p>
            </div>
          </div>

          {/* Right Actions: Role Switcher, Notification Bell, User */}
          <div className="flex items-center gap-2.5">
            {/* Live Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition"
                title="Switch active Persona / Permissions"
              >
                <ActiveIcon className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden sm:inline">{activeRoleConfig.label.split("(")[0]}</span>
                <span className="sm:hidden">{activeRoleConfig.id}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Persona Role (Test Permissions)
                  </p>
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isSelected = r.id === currentRole;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          onRoleChange(r.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 ${
                          isSelected ? "bg-teal-50 text-teal-900 font-semibold" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 ${isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{r.label}</div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{r.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Log out */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
