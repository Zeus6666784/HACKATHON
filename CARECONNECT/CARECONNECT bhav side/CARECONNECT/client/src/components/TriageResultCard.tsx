import type { TriageResult } from "../types";
import { StatusBadge } from "./StatusBadge";

export function TriageResultCard({ result }: { result: TriageResult }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">AI Triage Result</h2>
        <StatusBadge value={result.priority} />
      </div>
      <p className="mt-2 text-sm text-slate-600">Suggested care: {result.suggestedCareLevel}</p>
      <p className="mt-4">{result.reasoning}</p>
      <p className="mt-3 text-sm font-medium">{result.recommendedNextAction}</p>
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{result.caution}</p>
      <p className="mt-2 text-xs text-slate-500">Source: {result.source}</p>
    </section>
  );
}
