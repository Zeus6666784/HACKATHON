import { 
  Stethoscope, 
  Building2, 
  GitCommit, 
  BarChart3, 
  Inbox,
  CheckCircle2
} from "lucide-react";
import type { ReferralStatus, Role } from "../../types";

export type ActiveTab = "TRIAGE" | "FACILITIES" | "REFERRAL_JOURNEY" | "FACILITY_DASHBOARD" | "ANALYTICS";

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  referralStatus?: ReferralStatus | null;
  incomingReferralCount?: number;
  currentUserRole: Role;
}

export function NavigationTabs({
  activeTab,
  onSelectTab,
  referralStatus,
  incomingReferralCount = 0,
  currentUserRole
}: NavigationTabsProps) {
  const tabs = [
    {
      id: "TRIAGE" as ActiveTab,
      label: "1. Intake & Triage",
      icon: Stethoscope,
      badge: null
    },
    {
      id: "FACILITIES" as ActiveTab,
      label: "2. Facility Intelligence",
      icon: Building2,
      badge: null
    },
    {
      id: "REFERRAL_JOURNEY" as ActiveTab,
      label: "3. Referral & Care Journey",
      icon: GitCommit,
      badge: referralStatus ? referralStatus.replace(/_/g, " ") : null,
      highlightBadge: referralStatus === "CLOSED" ? "emerald" : "teal"
    },
    {
      id: "FACILITY_DASHBOARD" as ActiveTab,
      label: "4. Facility Queue (Dev 3)",
      icon: Inbox,
      badge: incomingReferralCount > 0 ? `${incomingReferralCount} in queue` : null,
      highlightBadge: "amber"
    },
    {
      id: "ANALYTICS" as ActiveTab,
      label: "5. State Dashboard (Dev 3)",
      icon: BarChart3,
      badge: "Directorate"
    }
  ];

  return (
    <nav className="border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="mx-auto max-w-7xl flex gap-2 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? "bg-teal-700 text-white shadow-xs shadow-teal-700/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.highlightBadge === "emerald"
                      ? "bg-emerald-100 text-emerald-800"
                      : tab.highlightBadge === "amber"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
