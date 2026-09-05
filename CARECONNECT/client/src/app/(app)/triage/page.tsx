"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { TriageForm } from "@/components/TriageForm";
import { get } from "@/lib/api";

export default function TriagePage({
  searchParams,
}: {
  searchParams: any; // Simplified for client component
}) {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      if (!session) return;
      try {
        const data = await get("/patients");
        setPatients(data);
      } catch (e) {
        console.error("Failed to load patients", e);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, [session]);

  useEffect(() => {
    if (!authLoading && !loading && session && session.role === ROLES.PATIENT) {
      router.push("/referrals");
    }
  }, [authLoading, loading, session, router]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return null;

  const patientId = searchParams?.patientId;

  return (
    <div className="md:ml-56">
      <TriageForm patients={patients} locale={session.locale || "en"} defaultPatientId={patientId} />
    </div>
  );
}
