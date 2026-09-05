"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { t } from "@/lib/i18n";
import { levelLabel, serviceLabel } from "@/lib/labels";
import { rankFacilities, type RankableFacility } from "@/lib/rank";
import { SERVICES } from "@/lib/constants";
import { SyntheticMark } from "./StatusBadge";

const FacilityMap = dynamic(() => import("@/components/FacilityMap"), { ssr: false });

type Facility = RankableFacility & { isSynthetic?: boolean };

export function FacilitiesClient({
  facilities,
  locale,
}: {
  facilities: Facility[];
  locale?: string;
}) {
  const [service, setService] = useState("maternal");
  const [q, setQ] = useState("");
  const [osm, setOsm] = useState<Array<{ name: string; lat: number; lng: number; osmId: string }>>([]);
  const origin = useMemo(() => ({ lat: 19.91, lng: 73.22 }), []);

  const ranked = useMemo(
    () =>
      rankFacilities({
        facilities,
        origin,
        requiredService: service,
        recommendedLevel: "RH",
      }),
    [facilities, origin, service],
  );

  async function searchOsm() {
    if (q.trim().length < 3) return;
    const res = await fetch(`http://localhost:5000/api/v1/osm/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setOsm(data.results ?? []);
  }

  return (
    <div className="space-y-4">
      <div className="card-soft space-y-3 p-4">
        <label className="block text-sm font-medium">
          {t(locale, "requiredService")}
          <select
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {serviceLabel(locale, s)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <input
            className="input-inset min-h-11 flex-1 rounded-xl px-3"
            placeholder={t(locale, "searchOsm")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            onClick={searchOsm}
            className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white"
          >
            OSM
          </button>
        </div>
      </div>
      <FacilityMap
        origin={origin}
        pins={[
          ...ranked.map((f) => ({
            id: f.id,
            name: f.name,
            lat: f.latitude,
            lng: f.longitude,
            subtitle: `${levelLabel(locale, f.careLevel)} · ${f.distanceKm.toFixed(1)} km`,
          })),
          ...osm.map((o) => ({ id: o.osmId, name: o.name, lat: o.lat, lng: o.lng, subtitle: "OSM" })),
        ]}
      />
      <ul className="space-y-2">
        {ranked.map((f, i) => (
          <li key={f.id} className="card-soft p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">
                #{i + 1} {f.name}
              </p>
              {f.isSynthetic ? <SyntheticMark localeLabel={t(locale, "synthetic")} /> : null}
            </div>
            <p className="text-sm text-cyan-800">
              {levelLabel(locale, f.careLevel)} · {f.village}, {f.taluka} · {f.distanceKm.toFixed(1)} km · score {f.score}
            </p>
            <p className="text-xs text-cyan-700">{f.reasons.join(" · ")}</p>
          </li>
        ))}
      </ul>
      {osm.length ? (
        <section className="card-soft p-4">
          <h2 className="font-display text-lg font-semibold">{t(locale, "searchOsm")}</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {osm.map((o) => (
              <li key={o.osmId}>
                {o.name} ({o.lat.toFixed(3)}, {o.lng.toFixed(3)})
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
