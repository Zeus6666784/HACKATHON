"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { get } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MedicalOfficerDashboard } from "@/components/dashboard/MedicalOfficerDashboard";
import { HospitalDashboard } from "@/components/dashboard/HospitalDashboard";
import { PatientPortal } from "@/components/dashboard/PatientPortal";

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!session) return;
      try {
        const [statsData, referralsData] = await Promise.all([
          get("/referral/stats"),
          get("/referral")
        ]);
        setStats(statsData);
        setRecent(referralsData || []);
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
  const role = session.role;

  return (
    <div className="md:ml-56 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{t(locale, "dashboard")}</h1>
        <p className="text-sm text-cyan-800">{t(locale, "demoStory")}</p>
      </div>

      {role === "HEALTH_WORKER" && (
        <MedicalOfficerDashboard stats={stats} recent={recent} locale={locale} />
      )}
      {role === "FACILITY_STAFF" && (
        <HospitalDashboard stats={stats} recent={recent} locale={locale} />
      )}
      {role === "PATIENT" && (
        <PatientPortal session={session} recent={recent} locale={locale} />
      )}
      {!["HEALTH_WORKER", "FACILITY_STAFF", "PATIENT"].includes(role) && (
        <div className="p-8 text-center text-cyan-800">No dashboard available for your role.</div>
      )}
    </div>
  );
}
