"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { DANGER_SIGNS } from "@/lib/triage";
import { SERVICES } from "@/lib/constants";
import { serviceLabel } from "@/lib/labels";
import { postWithQueue } from "@/lib/offline";
import { PriorityBadge } from "./StatusBadge";

type PatientOpt = { id: string; fullName: string; village: string; age: number };

export function TriageForm({
  patients,
  locale,
  defaultPatientId,
}: {
  patients: PatientOpt[];
  locale?: string;
  defaultPatientId?: string;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(defaultPatientId || patients[0]?.id || "");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [requiredService, setRequiredService] = useState("maternal");
  const [dangerSigns, setDangerSigns] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ priority: string; recommendedLevel: string; rationale: string; referralId?: string } | null>(null);

  function toggleSign(id: string) {
    setDangerSigns((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const queued = await postWithQueue(
      "/referrals",
      { patientId, chiefComplaint, requiredService, dangerSigns },
      "Create triaged referral",
    );
    setBusy(false);
    if ("queued" in queued && queued.queued) {
      setError(t(locale, "offline"));
      return;
    }
    if ("ok" in queued && queued.ok) {
      const data = queued.data as {
        referral: { id: string };
        triage: { priority: string; recommendedLevel: string; rationale: string };
      };
      setResult({
        ...data.triage,
        referralId: data.referral.id,
      });
      return;
    }
    setError("Triage could not be saved. Check required fields.");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{t(locale, "triage")}</h1>
        <p className="text-sm text-cyan-800">{t(locale, "neverDiagnosis")}</p>
      </div>
      <form onSubmit={onSubmit} className="card-soft space-y-4 p-5">
        <label className="block text-sm font-medium">
          {t(locale, "patients")}
          <select
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} · {p.village} · {p.age}y
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          {t(locale, "chiefComplaint")}
          <textarea
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            rows={3}
            required
            minLength={3}
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder={t(locale, "complaintPlaceholder")}
          />
        </label>
        <label className="block text-sm font-medium">
          {t(locale, "requiredService")}
          <select
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={requiredService}
            onChange={(e) => setRequiredService(e.target.value)}
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {serviceLabel(locale, s)}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-medium">{t(locale, "dangerSigns")}</legend>
          <div className="mt-2 grid gap-2">
            {DANGER_SIGNS.map((d) => {
              const loc = locale === "hi" || locale === "mr" ? locale : "en";
              return (
                <label key={d.id} className="flex min-h-11 items-center gap-2 rounded-xl bg-cyan-50/80 px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={dangerSigns.includes(d.id)}
                    onChange={() => toggleSign(d.id)}
                    className="h-4 w-4"
                  />
                  {d.label[loc]}
                </label>
              );
            })}
          </div>
        </fieldset>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary font-semibold text-white disabled:opacity-60"
        >
          {t(locale, "triage")}
        </button>
      </form>
      {result ? (
        <section className="card-soft space-y-3 p-5">
          <h2 className="font-display text-lg font-semibold">{t(locale, "noDiagnosis")}</h2>
          <PriorityBadge priority={result.priority} locale={locale} />
          <p className="text-sm">Recommended public care level: {result.recommendedLevel}</p>
          <p className="text-sm leading-relaxed text-cyan-900">{result.rationale}</p>
          {result.referralId ? (
            <button
              type="button"
              onClick={() => router.push(`/referrals/view?id=${result.referralId}`)}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-white"
            >
              {t(locale, "findFacility")}
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
