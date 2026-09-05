"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { StatusBadge, PriorityBadge, SyntheticMark } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";
import { isOverdue } from "@/lib/referrals";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { ROLES } from "@/lib/constants";

export default function ReferralsPage() {
  const { session, loading: authLoading } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!session) return;
      try {
        const data = await get("/referral");
        setReferrals(data);
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
  if (!session) return null;

  const locale = session.locale || "en";

  return (
    <div className="md:ml-56 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">
          {session.role === ROLES.PATIENT ? t(locale, "patientHome") : t(locale, "referrals")}
        </h1>
        {session.role !== ROLES.PATIENT ? (
          <Link href="/triage" className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-soft">
            {t(locale, "newReferral")}
          </Link>
        ) : null}
      </div>
      {referrals.length === 0 ? (
        <p className="card-soft p-6 text-sm">{t(locale, "emptyQueue")}</p>
      ) : null}
      {referrals.map((r) => (
        <Link key={r.id} href={`/referrals/view?id=${r.id}`} className="card-soft block p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold">{r.publicId}</span>
            <StatusBadge status={r.status} locale={locale} />
            <PriorityBadge priority={r.priority} locale={locale} />
            {r.isSynthetic ? <SyntheticMark localeLabel={t(locale, "synthetic")} /> : null}
            {isOverdue(r.updatedAt, r.status, r.dueAt) ? (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">{t(locale, "overdue")}</span>
            ) : null}
          </div>
          <p className="mt-2 font-medium">{r.patient?.fullName}</p>
          <p className="text-xs text-cyan-800">
            {r.patient?.village}, {r.patient?.taluka} · {r.fromFacility?.name ?? "—"} → {r.toFacility?.name ?? t(locale, "findFacility")}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-cyan-900">{r.chiefComplaint}</p>
          <div className="mt-3">
            <JourneyRail status={r.status} locale={locale} />
          </div>
        </Link>
      ))}
    </div>
  );
}
