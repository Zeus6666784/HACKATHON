"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { TriageForm } from "@/components/TriageForm";
import { useAuth } from "@/context/AuthContext";
import { t } from "@/lib/i18n";

export default function ClinicalIntakePage() {
  const { session, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await get("/patients");
        setPatients(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="md:ml-56 p-8">
      <TriageForm patients={patients} locale={session?.locale || "en"} />
    </div>
  );
}
