"use client";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

export function HospitalDashboard({ stats, recent, locale }: { stats: any, recent: any[], locale: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t(locale, "incoming"), value: stats?.pending || 0 },
          { label: t(locale, "closed"), value: stats?.closed || 0 },
          { label: t(locale, "icuAvailable"), value: stats?.icuAvailable || 0 },
          { label: t(locale, "oxygenAvailable"), value: stats?.oxygenAvailable || 0 },
        ].map(c => (
          <article key={c.label} className="card-soft p-4">
            <p className="text-xs font-medium text-cyan-800">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{c.value}</p>
          </article>
        ))}
      </div>
      <div className="flex gap-3">
        <Link href="/bed-reservation" className="flex-1 bg-accent text-white text-center p-3 rounded-lg font-bold text-sm">
          {t(locale, "manageBeds")}
        </Link>
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">{t(locale, "incomingQueue")}</h2>
        {recent.map(r => (
          <Link key={r.id} href={`/referrals/view?id=${r.id}`} className="card-soft block p-4 border-l-4 border-accent">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{r.publicId}</span>
              <StatusBadge status={r.status} locale={locale} />
              <PriorityBadge priority={r.priority} locale={locale} />
            </div>
            <p className="mt-2 text-sm font-medium">{r.patient?.fullName} · {r.urgency}</p>
            <p className="text-xs text-cyan-800">{r.requiredSpecialty}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
