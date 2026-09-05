"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { t } from "@/lib/i18n";
import { levelLabel, serviceLabel } from "@/lib/labels";
import { postWithQueue } from "@/lib/offline";
import type { RankedFacility } from "@/lib/rank";

const FacilityMap = dynamic(() => import("@/components/FacilityMap"), { ssr: false });

export function FacilityPicker({
  referralId,
  locale,
  service,
  level,
  originLat,
  originLng,
}: {
  referralId: string;
  locale?: string;
  service: string;
  level: string;
  originLat: number;
  originLng: number;
}) {
  const router = useRouter();
  const [facilities, setFacilities] = useState<RankedFacility[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({
      lat: String(originLat),
      lng: String(originLng),
      service,
      level,
    });
    fetch(`http://localhost:5000/api/v1/facilities?${params}`)
      .then((r) => r.json())
      .then((d) => setFacilities(d.facilities ?? []))
      .catch(() => setError("Could not load facilities"));
  }, [originLat, originLng, service, level]);

  async function refer(toFacilityId: string) {
    setBusy(toFacilityId);
    const result = await postWithQueue(
      `http://localhost:5000/api/v1/referrals/${referralId}/refer`,
      { toFacilityId },
      `Refer ${referralId}`,
    );
    setBusy(null);
    if ("queued" in result && result.queued) {
      setError(t(locale, "offline"));
      return;
    }
    if ("ok" in result && result.ok) {
      router.refresh();
      return;
    }
    setError("Referral could not be created.");
  }

  return (
    <section className="card-soft space-y-3 p-5">
      <h2 className="font-display text-lg font-semibold">{t(locale, "findFacility")}</h2>
      <p className="text-sm text-cyan-800">
        Ranked by {t(locale, "distance")}, {t(locale, "careLevel")} and {serviceLabel(locale, service)}.
      </p>
      <FacilityMap
        origin={{ lat: originLat, lng: originLng }}
        pins={facilities.map((f) => ({
          id: f.id,
          name: f.name,
          lat: f.latitude,
          lng: f.longitude,
          subtitle: `${levelLabel(locale, f.careLevel)} · ${f.distanceKm.toFixed(1)} km`,
        }))}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-2">
        {facilities.map((f, i) => (
          <li key={f.id} className="rounded-2xl bg-cyan-50/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  #{i + 1} {f.name}
                </p>
                <p className="text-xs text-cyan-800">
                  {levelLabel(locale, f.careLevel)} · {f.taluka} · {f.distanceKm.toFixed(1)} km · {t(locale, "rankScore")} {f.score}
                </p>
                <p className="text-[11px] text-cyan-700">{f.reasons.join(" · ")}</p>
              </div>
              <button
                type="button"
                disabled={busy === f.id}
                onClick={() => refer(f.id)}
                className="min-h-11 shrink-0 rounded-xl bg-primary px-3 text-xs font-semibold text-white disabled:opacity-60"
              >
                {t(locale, "createReferral")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
