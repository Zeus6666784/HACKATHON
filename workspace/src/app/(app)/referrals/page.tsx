import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { StatusBadge, PriorityBadge, SyntheticMark } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";
import { isOverdue } from "@/lib/referrals";
import { ROLES } from "@/lib/constants";

export default async function ReferralsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const locale = session.locale;
  const where =
    session.role === ROLES.PATIENT
      ? { patient: { accountUserId: session.id } }
      : session.role === ROLES.FACILITY_STAFF && session.facilityId
        ? { OR: [{ toFacilityId: session.facilityId }, { fromFacilityId: session.facilityId }] }
        : {};
  const referrals = await prisma.referral.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { patient: true, toFacility: true, fromFacility: true },
  });

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
        <Link key={r.id} href={`/referrals/${r.id}`} className="card-soft block p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold">{r.publicId}</span>
            <StatusBadge status={r.status} locale={locale} />
            <PriorityBadge priority={r.priority} locale={locale} />
            {r.isSynthetic ? <SyntheticMark localeLabel={t(locale, "synthetic")} /> : null}
            {isOverdue(r.updatedAt, r.status, r.dueAt) ? (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">{t(locale, "overdue")}</span>
            ) : null}
          </div>
          <p className="mt-2 font-medium">{r.patient.fullName}</p>
          <p className="text-xs text-cyan-800">
            {r.patient.village}, {r.patient.taluka} · {r.fromFacility?.name ?? "—"} → {r.toFacility?.name ?? t(locale, "findFacility")}
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
