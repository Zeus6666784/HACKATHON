"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { ROLES } from "@/lib/constants";

export default function AuditPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      if (!session) return;
      try {
        const data = await get("/audit");
        setLogs(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [session]);

  useEffect(() => {
    if (!authLoading && !loading && session && session.role !== ROLES.ADMIN) {
      router.push("/dashboard");
    }
  }, [authLoading, loading, session, router]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!session) return null;

  const locale = session.locale || "en";

  return (
    <div className="md:ml-56 space-y-3">
      <h1 className="font-display text-2xl font-bold">{t(locale, "audit")}</h1>
      {logs.map((l) => (
        <article key={l.id} className="card-soft p-4 text-sm">
          <p className="font-semibold">
            {l.action} · {l.entity}
          </p>
          <p className="text-cyan-800">{l.detail}</p>
          <p className="text-xs text-cyan-700">
            {l.user?.fullName ?? "system"} · {new Date(l.createdAt).toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
}
