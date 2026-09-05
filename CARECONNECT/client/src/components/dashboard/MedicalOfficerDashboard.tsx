"use client";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";
import { isOverdue } from "@/lib/referrals";

export function MedicalOfficerDashboard({ stats, recent, locale }: { stats: any, recent: any[], locale: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t(locale, "completed"), value: stats?.completed || 0 },
          { label: t(locale, "pending"), value: stats?.pending || 0 },
          { label: t(locale, "overdue"), value: stats?.overdue || 0 },
          { label: t(locale, "closed"), value: stats?.closed || 0 },
        ].map(c => (
          <article key={c.label} className="card-soft p-4">
            <p className="text-xs font-medium text-cyan-800">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{c.value}</p>
          </article>
        ))}
      </div>
      <div className="flex gap-3">
        <Link href="/patients/new" className="flex-1 bg-accent text-white text-center p-3 rounded-lg font-bold text-sm">
          {t(locale, "registerPatient")}
        </Link>
        <Link href="/clinical-intake" className="flex-1 bg-cyan-700 text-white text-center p-3 rounded-lg font-bold text-sm">
          {t(locale, "clinicalIntake")}
        </Link>
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">{t(locale, "myReferrals")}</h2>
        {recent.map(r => (
          <Link key={r.id} href={`/referrals/view?id=${r.id}`} className="card-soft block p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{r.publicId}</span>
              <StatusBadge status={r.status} locale={locale} />
              <PriorityBadge priority={r.priority} locale={locale} />
              {isOverdue(r.updatedAt, r.status, r.dueAt) && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {t(locale, "overdue")}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium">{r.patient?.fullName} · {r.patient?.village}</p>
            <div className="mt-3">
              <JourneyRail status={r.status} locale={locale} />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
