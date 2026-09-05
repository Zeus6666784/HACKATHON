"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { StatusBadge, PriorityBadge, SyntheticMark } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";
import Link from "next/link";
import { isOverdue } from "@/lib/referrals";
import { DashboardCharts } from "@/components/DashboardCharts";
import { get } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [byStatus, setByStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!session) return;
      try {
        const [statsData, referralsData] = await Promise.all([
          get("/referral/stats"),
          get("/referral")
        ]);
        setStats(statsData);
        setRecent(referralsData.slice(0, 8));

        const statusCounts = referralsData.reduce((acc: any, r: any) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {});
        setByStatus(Object.entries(statusCounts).map(([status, count]) => ({ status, count })));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!session) return null; // Auth guard handled by layout/middleware

  const locale = session.locale || "en";

  const cards = [
    { label: t(locale, "completed"), value: stats?.completed || 0, hint: t(locale, "completedHint") },
    { label: t(locale, "pending"), value: stats?.pending || 0, hint: t(locale, "pendingHint") },
    { label: t(locale, "overdue"), value: stats?.overdue || 0, hint: t(locale, "overdueHint") },
    { label: t(locale, "closed"), value: stats?.closed || 0, hint: t(locale, "closedHint") },
  ];

  return (
    <div className="md:ml-56 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{t(locale, "dashboard")}</h1>
        <p className="text-sm text-cyan-800">{t(locale, "demoStory")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <article key={c.label} className="card-soft p-4">
            <p className="text-xs font-medium text-cyan-800">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{c.value}</p>
            <p className="mt-1 text-[11px] leading-snug text-cyan-800/80">{c.hint}</p>
          </article>
        ))}
      </div>
      <article className="card-soft p-4">
        <p className="text-xs font-medium text-cyan-800">{t(locale, "closureRate")}</p>
        <p className="font-display text-4xl font-bold text-accent">{stats?.closureRate || 0}%</p>
        <p className="text-sm text-cyan-800">{stats?.closed || 0} / {stats?.total || 0} referrals closed</p>
      </article>
      <DashboardCharts
        byStatus={byStatus}
        locale={locale}
      />
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">{t(locale, "referrals")}</h2>
        {recent.map((r) => (
          <Link key={r.id} href={`/referrals/view?id=${r.id}`} className="card-soft block p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{r.publicId}</span>
              <StatusBadge status={r.status} locale={locale} />
              <PriorityBadge priority={r.priority} locale={locale} />
              {r.isSynthetic ? <SyntheticMark localeLabel={t(locale, "synthetic")} /> : null}
              {isOverdue(r.updatedAt, r.status, r.dueAt) ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {t(locale, "overdue")}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm font-medium">{r.patient?.fullName} · {r.patient?.village}, {r.patient?.taluka}</p>
            <p className="text-xs text-cyan-800">{r.toFacility?.name ?? t(locale, "findFacility")}</p>
            <div className="mt-3">
              <JourneyRail status={r.status} locale={locale} />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
