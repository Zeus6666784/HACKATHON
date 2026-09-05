"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { statusLabel } from "@/lib/labels";

const COLORS = ["#0891b2", "#0e7490", "#155e75", "#0f766e", "#059669", "#047857", "#065f46"];

export function DashboardCharts({
  byStatus,
  locale,
}: {
  byStatus: { status: string; count: number }[];
  locale?: string;
}) {
  const data = byStatus.map((s) => ({
    name: statusLabel(locale, s.status),
    count: s.count,
    status: s.status,
  }));
  if (!data.length) {
    return <p className="text-sm text-cyan-800">No referral data yet.</p>;
  }
  return (
    <div className="card-soft p-4">
      <h2 className="mb-3 font-display text-lg font-semibold">Continuity pipeline</h2>
      <div className="h-56" role="img" aria-label="Referral counts by continuity status">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={d.status} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
