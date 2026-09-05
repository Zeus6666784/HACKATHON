"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { post, get } from "@/lib/api";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function BedReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const facilityId = searchParams.get("facilityId");
  const [facility, setFacility] = useState<any>(null);
  const [bedId, setBedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!facilityId) return;
      try {
        const data = await get(`/facilities/${facilityId}`);
        setFacility(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [facilityId]);

  async function handleReserve() {
    try {
      // we need a referralId to reserve a bed
      // for now we'll assume the user is in a flow where referralId is in URL or session
      const referralId = searchParams.get("referralId");
      if (!referralId) {
        alert("Please start a triage process first.");
        return;
      }
      await post(`/referrals/${referralId}/reserve-bed`, { bedId });
      router.push(`/referrals/view?id=${referralId}`);
    } catch (e) {
      alert("Reservation failed.");
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!facility) return <div className="p-8 text-center">Facility not found.</div>;

  return (
    <div className="md:ml-56 p-8 space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("en", "bedReservation")}</h1>
      <article className="card-soft p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{facility.name}</h2>
            <p className="text-sm text-cyan-800">{facility.type}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-cyan-800">ICU Available</p>
            <p className="text-2xl font-bold">{facility.icuAvailable}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-cyan-50 rounded-xl">
            <p className="text-xs text-cyan-800">Oxygen</p>
            <p className="font-bold">{facility.oxygenAvailable}</p>
          </div>
          <div className="p-3 bg-cyan-50 rounded-xl">
            <p className="text-xs text-cyan-800">Ventilators</p>
            <p className="font-bold">{facility.ventilatorsAvailable}</p>
          </div>
          <div className="p-3 bg-cyan-50 rounded-xl">
            <p className="text-xs text-cyan-800">Total</p>
            <p className="font-bold">{facility.totalBeds}</p>
          </div>
        </div>
        <div className="pt-4 space-y-3">
          <label className="block text-sm font-medium">Bed ID / Ward Number</label>
          <input
            className="input-inset w-full rounded-xl px-3 py-3"
            value={bedId}
            onChange={e => setBedId(e.target.value)}
            placeholder="e.g. ICU-102"
            required
          />
          <button
            onClick={handleReserve}
            className="w-full bg-accent text-white p-3 rounded-xl font-bold"
          >
            Confirm Reservation
          </button>
        </div>
      </article>
    </div>
  );
}
