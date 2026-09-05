"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { NEXT_STATUS, type ReferralStatus } from "@/lib/constants";
import { statusLabel } from "@/lib/labels";
import { postWithQueue } from "@/lib/offline";

export function AdvanceControls({
  referralId,
  status,
  locale,
}: {
  referralId: string;
  status: string;
  locale?: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const next = NEXT_STATUS[status as ReferralStatus];

  async function advance() {
    if (!next) return;
    setBusy(true);
    const result = await postWithQueue(
      `/api/referrals/${referralId}/advance`,
      { note, appointmentAt: appointmentAt || undefined },
      `Advance ${referralId} to ${next}`,
    );
    setBusy(false);
    if ("queued" in result && result.queued) {
      setMessage(t(locale, "offline"));
      return;
    }
    if ("ok" in result && result.ok) {
      router.refresh();
      setNote("");
      return;
    }
    setMessage("Could not advance. Try again.");
  }

  if (!next) return null;

  return (
    <section className="card-soft space-y-3 p-5">
      <h2 className="font-display text-lg font-semibold">{t(locale, "nextStep")}</h2>
      <p className="text-sm text-cyan-800">
        {statusLabel(locale, status)} → {statusLabel(locale, next)}
      </p>
      {status === "REFERRED" ? (
        <label className="block text-sm font-medium">
          {t(locale, "appointment")}
          <input
            type="datetime-local"
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={appointmentAt}
            onChange={(e) => setAppointmentAt(e.target.value)}
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium">
        {t(locale, "notes")}
        <textarea
          className="input-inset mt-1 w-full rounded-xl px-3 py-3"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={800}
        />
      </label>
      {message ? <p className="text-sm text-amber-800">{message}</p> : null}
      <button
        type="button"
        onClick={advance}
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-white shadow-soft disabled:opacity-60"
      >
        {next === "CLOSED" ? t(locale, "closeReferral") : t(locale, "advance")}
      </button>
    </section>
  );
}
