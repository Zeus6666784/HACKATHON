"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { postWithQueue } from "@/lib/offline";

export default function NewPatientPage() {
  const router = useRouter();
  const locale = "en";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    age: "30",
    sex: "female",
    phone: "",
    village: "Sakhare",
    taluka: "Jawhar",
    district: "Palghar",
    caregiverName: "",
    latitude: "19.91",
    longitude: "73.22",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await postWithQueue(
      "/patients",
      {
        ...form,
        age: Number(form.age),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      },
      `Register patient ${form.fullName}`,
    );
    setBusy(false);
    if ("queued" in result && result.queued) {
      setError(t(locale, "offline"));
      return;
    }
    if ("ok" in result && result.ok) {
      router.push("/patients");
      router.refresh();
      return;
    }
    setError("Could not register patient. Check required fields.");
  }

  return (
    <div className="md:ml-56">
      <h1 className="font-display text-2xl font-bold">{t(locale, "newPatient")}</h1>
      <form onSubmit={onSubmit} className="card-soft mt-4 space-y-3 p-5">
        {[
          ["fullName", t(locale, "register")],
          ["age", t(locale, "age")],
          ["phone", t(locale, "phone")],
          ["village", t(locale, "village")],
          ["taluka", t(locale, "taluka")],
        ].map(([key, label]) => (
          <label key={key} className="block text-sm font-medium">
            {label}
            <input
              className="input-inset mt-1 w-full rounded-xl px-3 py-3"
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key as keyof typeof form, e.target.value)}
              required={key === "fullName" || key === "village" || key === "taluka"}
            />
          </label>
        ))}
        <label className="block text-sm font-medium">
          {t(locale, "sex")}
          <select
            className="input-inset mt-1 w-full rounded-xl px-3 py-3"
            value={form.sex}
            onChange={(e) => set("sex", e.target.value)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary font-semibold text-white disabled:opacity-60"
        >
          {t(locale, "save")}
        </button>
      </form>
    </div>
  );
}
