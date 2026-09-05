"use client";

import { useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";
import { PriorityBadge } from "@/components/StatusBadge";
import { get } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TriageResultPage() {
  const searchParams = useSearchParams();
  const triageId = searchParams.get("id");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!triageId) return;
      try {
        const data = await get(`/triage/${triageId}`);
        setResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [triageId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!result) return <div className="p-8 text-center">Triage result not found.</div>;

  return (
    <div className="md:ml-56 p-8 space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("en", "triageResult")}</h1>
      <article className="card-soft p-6 space-y-4">
        <div className="flex items-center gap-3">
          <PriorityBadge priority={result.urgency} locale="en" />
          <p className="text-xl font-bold">{result.urgency}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-cyan-800">Risk Factors</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {result.riskFactors.map((rf: string, i: number) => (
                <li key={i}>{rf}</li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-cyan-800">Vitals</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>HR: {result.vitals?.heartRate} bpm</p>
              <p>SpO2: {result.vitals?.spo2}%</p>
              <p>BP: {result.vitals?.systolicBP}/{result.vitals?.diastolicBP}</p>
              <p>Temp: {result.vitals?.temperature}°F</p>
            </div>
          </section>
        </div>
        <div className="pt-4 border-t border-cyan-100">
          <h3 className="text-sm font-semibold text-cyan-800 mb-2">Recommendation</h3>
          <p className="text-sm leading-relaxed">{result.recommendedReferral}</p>
        </div>
        <Link href="/facility-ranking" className="block w-full text-center bg-accent text-white p-3 rounded-xl font-bold">
          Find Suitable Facility
        </Link>
      </article>
    </div>
  );
}
