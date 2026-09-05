import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { SyntheticMark } from "@/components/StatusBadge";
import { ROLES } from "@/lib/constants";

export default async function PatientsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === ROLES.PATIENT) redirect("/referrals");
  const locale = session.locale;
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { referrals: true } } },
  });

  return (
    <div className="md:ml-56 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t(locale, "patients")}</h1>
        <Link href="/patients/new" className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-soft">
          {t(locale, "newPatient")}
        </Link>
      </div>
      {patients.map((p) => (
        <article key={p.id} className="card-soft p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{p.fullName}</h2>
            {p.isSynthetic ? <SyntheticMark localeLabel={t(locale, "synthetic")} /> : null}
          </div>
          <p className="text-sm text-cyan-800">
            {p.healthId} · {t(locale, "age")} {p.age} · {p.village}, {p.taluka}
          </p>
          <p className="text-xs text-cyan-700">{p._count.referrals} referrals</p>
          <Link href={`/triage?patientId=${p.id}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
            {t(locale, "newReferral")}
          </Link>
        </article>
      ))}
    </div>
  );
}
