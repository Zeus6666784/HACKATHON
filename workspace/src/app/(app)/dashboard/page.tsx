import { getSession } from "@/lib/auth";
import { dashboardStats } from "@/lib/referrals";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { StatusBadge, PriorityBadge, SyntheticMark } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";
import Link from "next/link";
import { isOverdue } from "@/lib/referrals";
import { DashboardCharts } from "@/components/DashboardCharts";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === ROLES.PATIENT) redirect("/referrals");
  const locale = session.locale;
  const stats = await dashboardStats();
  const byStatus = await prisma.referral.groupBy({ by: ["status"], _count: { _all: true } });
  const recent = await prisma.referral.findMany({
    take: 8,
    orderBy: { updatedAt: "desc" },
    include: { patient: true, toFacility: true },
  });

  const cards = [
    { label: t(locale, "completed"), value: stats.completed, hint: t(locale, "completedHint") },
    { label: t(locale, "pending"), value: stats.pending, hint: t(locale, "pendingHint") },
    { label: t(locale, "overdue"), value: stats.overdue, hint: t(locale, "overdueHint") },
    { label: t(locale, "closed"), value: stats.closed, hint: t(locale, "closedHint") },
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
        <p className="font-display text-4xl font-bold text-accent">{stats.closureRate}%</p>
        <p className="text-sm text-cyan-800">{stats.closed} / {stats.total} referrals closed</p>
      </article>
      <DashboardCharts
        byStatus={byStatus.map((s) => ({ status: s.status, count: s._count._all }))}
        locale={locale}
      />
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">{t(locale, "referrals")}</h2>
        {recent.map((r) => (
          <Link key={r.id} href={`/referrals/${r.id}`} className="card-soft block p-4">
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
            <p className="mt-2 text-sm font-medium">{r.patient.fullName} · {r.patient.village}, {r.patient.taluka}</p>
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
