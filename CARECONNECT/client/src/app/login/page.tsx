"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, HeartPulse, Languages } from "lucide-react";
import { t, type MessageKey } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/constants";
import { Suspense } from "react";
import { post } from "@/lib/api";

const ACCOUNTS = [
  { username: "aasha.jawhar", roleKey: "roleHealthWorker" as MessageKey, note: "ASHA, Sakhare / Jawhar" },
  { username: "patient.savitri", roleKey: "rolePatient" as MessageKey, note: "Savitri Bhoye — closed journey" },
  { username: "staff.rhjawhar", roleKey: "roleStaff" as MessageKey, note: "RH Jawhar queue" },
  { username: "admin.palghar", roleKey: "roleAdmin" as MessageKey, note: "District continuity dashboard" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [locale, setLocale] = useState<Locale>("en");
  const [username, setUsername] = useState("aasha.jawhar");
  const [password, setPassword] = useState("CareConnect@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await post("/auth/login", { username, password });
      const next = params.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message || t(locale, "invalidLogin"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-soft">
            <HeartPulse className="h-4 w-4" />
            Palghar · Jawhar · Mokhada · Dahanu
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold text-cyan-950">{t(locale, "appName")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-cyan-900">{t(locale, "tagline")}</p>
        </div>
        <label className="flex min-h-11 items-center gap-1 rounded-xl bg-white px-2 shadow-soft">
          <Languages className="h-4 w-4" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="bg-transparent text-sm"
            aria-label={t(locale, "language")}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t(locale, l === "en" ? "english" : l === "hi" ? "hindi" : "marathi")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={onSubmit} className="card-soft space-y-4 p-5">
        <label className="block text-sm font-medium">
          {t(locale, "username")}
          <input
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          {t(locale, "password")}
          <input
            type="password"
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-white shadow-soft disabled:opacity-60"
        >
          <Activity className="h-4 w-4" />
          {t(locale, "login")}
        </button>
        <p className="text-xs text-cyan-800">{t(locale, "passwordHint")}</p>
      </form>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">{t(locale, "demoAccounts")}</h2>
        <ul className="mt-2 space-y-2">
          {ACCOUNTS.map((a) => (
            <li key={a.username}>
              <button
                type="button"
                onClick={() => setUsername(a.username)}
                className="card-soft flex min-h-14 w-full items-center justify-between px-4 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold">{t(locale, a.roleKey)}</span>
                  <span className="text-xs text-cyan-800">{a.username} · {a.note}</span>
                </span>
                <span className="text-[10px] font-bold uppercase text-amber-800">synthetic</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-8 text-center text-sm font-medium text-cyan-950">{t(locale, "mission")}</p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
