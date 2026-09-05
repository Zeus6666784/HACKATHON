"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { FacilitiesClient } from "@/components/FacilitiesClient";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";

export default function FacilitiesPage() {
  const { session, loading: authLoading } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!session) return;
      try {
        const data = await get("/facility/rank");
        setFacilities(data);
      } catch (e) {
        console.error("Failed to load facilities", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return null;

  const locale = session.locale || "en";

  return (
    <div className="md:ml-56">
      <h1 className="font-display text-2xl font-bold">{t(locale, "map")}</h1>
      <p className="mb-4 text-sm text-cyan-800">{t(locale, "publicFacility")} · OpenStreetMap</p>
      <FacilitiesClient
        locale={locale}
        facilities={facilities}
      />
    </div>
  );
}
