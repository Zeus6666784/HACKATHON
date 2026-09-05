"use client";

import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export function LanguageSwitch({ locale }: { locale?: string }) {
  const router = useRouter();

  async function setLocale(next: string) {
    await fetch("http://localhost:5000/api/v1/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-cyan-900">
      <span className="sr-only">{t(locale, "language")}</span>
      <select
        className="min-h-11 rounded-xl bg-white px-3 text-sm shadow-soft"
        value={locale === "hi" || locale === "mr" ? locale : "en"}
        onChange={(e) => setLocale(e.target.value)}
        aria-label={t(locale, "language")}
      >
        <option value="en">{t(locale, "english")}</option>
        <option value="hi">{t(locale, "hindi")}</option>
        <option value="mr">{t(locale, "marathi")}</option>
      </select>
    </label>
  );
}
