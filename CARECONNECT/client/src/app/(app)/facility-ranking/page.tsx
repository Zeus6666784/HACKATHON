"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function FacilityRankingPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await get("/facilities/rank");
        setFacilities(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="md:ml-56 p-8 space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("en", "facilityRanking")}</h1>
      <div className="grid gap-4">
        {facilities.map((f, i) => (
          <article key={f.id} className="card-soft p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl font-black text-cyan-200">#{i + 1}</span>
              <div>
                <p className="font-bold">{f.name}</p>
                <p className="text-xs text-cyan-800">{f.type} · {f.district}</p>
                <p className="text-xs text-cyan-800">ETA: {f.etaMinutes} mins · {f.distanceKm} km</p>
              </div>
            </div>
            <Link href={`/bed-reservation?facilityId=${f.id}`} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold">
              Reserve Bed
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
