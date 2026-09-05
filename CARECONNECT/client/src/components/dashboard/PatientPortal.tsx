"use client";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";
import { JourneyRail } from "@/components/JourneyRail";

export function PatientPortal({ session, recent, locale }: { session: any, recent: any[], locale: string }) {
  const myReferral = recent[0];
  return (
    <div className="space-y-5">
      <div className="bg-red-600 text-white p-6 rounded-2xl text-center shadow-lg">
        <p className="text-sm font-bold uppercase tracking-widest mb-2">Emergency</p>
        <a href="tel:108" className="text-5xl font-black block mb-2">108</a>
        <p className="text-xs opacity-90">One-tap Emergency Ambulance Access</p>
      </div>
      <section className="card-soft p-6 space-y-4">
        <h2 className="font-display text-xl font-bold">{t(locale, "myHealthCard")}</h2>
        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-cyan-200 text-center">
          <p className="text-xs text-cyan-800">ABHA ID</p>
          <p className="font-mono text-lg font-bold">{session?.abhaId || "Not Linked"}</p>
        </div>
      </section>
      {myReferral ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">{t(locale, "myReferralStatus")}</h2>
          <article className="card-soft p-4">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={myReferral.status} locale={locale} />
              <span className="text-sm font-medium">{myReferral.destinationFacility?.name}</span>
            </div>
            <JourneyRail status={myReferral.status} locale={locale} />
            <p className="mt-4 text-xs text-cyan-800">ETA: {myReferral.etaMinutes} mins</p>
          </article>
        </section>
      ) : (
        <p className="text-center text-sm text-cyan-800 p-8">{t(locale, "noActiveReferrals")}</p>
      )}
    </div>
  );
}
