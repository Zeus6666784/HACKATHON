"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { SyntheticMark } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";

export default function PatientsPage() {
  const { session, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!session) return;
      try {
        const data = await get("/patients");
        setPatients(data);
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
          <p className="text-xs text-cyan-700">{p.referralCount || 0} referrals</p>
          <Link href={`/triage?patientId=${p.id}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
            {t(locale, "newReferral")}
          </Link>
        </article>
      ))}
    </div>
  );
}
