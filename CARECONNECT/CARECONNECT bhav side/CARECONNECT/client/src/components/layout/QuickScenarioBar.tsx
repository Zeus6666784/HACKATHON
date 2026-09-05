import { Database } from "lucide-react";

interface QuickScenarioBarProps {
  onRunScenario: (scenario: "GOLDEN_PATH" | "REJECTION_PATH" | "HIGH_RISK_MATERNAL") => void;
  onReset: () => void;
}

export function QuickScenarioBar({ onRunScenario, onReset }: QuickScenarioBarProps) {
  return (
    <div className="border-b border-teal-100 bg-teal-50/70 px-4 py-2 text-xs">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-1.5 text-teal-900 font-bold">
          <Database className="w-3.5 h-3.5 text-teal-700" />
          <span>Live backend records only</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 text-[11px] font-semibold transition"
            title="Refresh persisted data"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
