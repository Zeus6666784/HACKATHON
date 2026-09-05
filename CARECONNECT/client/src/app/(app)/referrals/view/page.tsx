"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { StatusBadge, PriorityBadge, SyntheticMark } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";
import { AdvanceControls } from "@/components/AdvanceControls";
import { FacilityPicker } from "@/components/FacilityPicker";
import { levelLabel, serviceLabel } from "@/lib/labels";
import { isOverdue } from "@/lib/referrals";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { ROLES } from "@/lib/constants";

export default function ReferralDetailPage() {
  const searchParams = useSearchParams();
  const routeId = searchParams.get("id");
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!session || !routeId) return;
      try {
        const data = await get(`/referral/${routeId}`);
        setReferral(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session, routeId]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!referral) return <div className="p-8 text-center">Referral not found.</div>;
  if (!session) return null;

  const locale = session.locale || "en";
  const canEdit = session.role !== ROLES.PATIENT;

  return (
    <div className="md:ml-56 space-y-4">
      <div className="card-soft p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl font-bold">{t(locale, "referralId")}: {referral.publicId}</h1>
          {referral.isSynthetic ? <SyntheticMark localeLabel={t(locale, "synthetic")} /> : null}
          {isOverdue(referral.updatedAt, referral.status, referral.dueAt) ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">{t(locale, "overdue")}</span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status={referral.status} locale={locale} />
          <PriorityBadge priority={referral.priority} locale={locale} />
        </div>
        <div className="mt-4">
          <JourneyRail status={referral.status} locale={locale} />
        </div>
        <p className="mt-4 rounded-xl bg-cyan-50 p-3 text-sm text-cyan-950">{t(locale, "neverDiagnosis")}</p>
      </div>

      <section className="card-soft space-y-2 p-5">
        <h2 className="font-display text-lg font-semibold">{referral.patient?.fullName}</h2>
        <p className="text-sm text-cyan-800">
          {t(locale, "age")} {referral.patient?.age} · {referral.patient?.village}, {referral.patient?.taluka}
        </p>
        <p className="text-sm"><span className="font-medium">{t(locale, "chiefComplaint")}:</span> {referral.chiefComplaint}</p>
        <p className="text-sm"><span className="font-medium">{t(locale, "requiredService")}:</span> {serviceLabel(locale, referral.requiredService)}</p>
        {referral.recommendedLevel ? (
          <p className="text-sm"><span className="font-medium">{t(locale, "careLevel")}:</span> {levelLabel(locale, referral.recommendedLevel)}</p>
        ) : null}
        {referral.triageRationale ? (
          <p className="text-sm leading-relaxed text-cyan-900">{referral.triageRationale}</p>
        ) : null}
        <p className="text-sm">
          {t(locale, "from")}: {referral.fromFacility?.name ?? "—"} → {t(locale, "to")}: {referral.toFacility?.name ?? "—"}
        </p>
      </section>

      {canEdit && (referral.status === "CREATED" || referral.status === "TRIAGED") ? (
        <FacilityPicker
          referralId={referral.id}
          locale={locale}
          service={referral.requiredService}
          level={referral.recommendedLevel ?? "PHC"}
          originLat={referral.patient?.latitude ?? 19.91}
          originLng={referral.patient?.longitude ?? 73.22}
        />
      ) : null}

      {canEdit && referral.status !== "CLOSED" && referral.status !== "CREATED" && referral.status !== "TRIAGED" ? (
        <AdvanceControls referralId={referral.id} status={referral.status} locale={locale} />
      ) : null}

      <section className="card-soft p-5">
        <h2 className="font-display text-lg font-semibold">{t(locale, "timeline")}</h2>
        <ol className="mt-3 space-y-3">
          {referral.events?.map((e: any) => (
            <li key={e.id} className="border-l-2 border-primary/40 pl-3">
              <p className="text-sm font-semibold">{e.toStatus}</p>
              <p className="text-sm text-cyan-900">{e.note}</p>
              <p className="text-[11px] text-cyan-700">
                {e.actorName} · {new Date(e.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
