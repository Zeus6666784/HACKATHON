import Link from "next/link";
import { HeartPulse, Route, ShieldCheck, MapPinned } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-10">
      <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-soft">
        <HeartPulse className="h-4 w-4" />
        Palghar · Jawhar · Mokhada · Dahanu
      </p>
      <h1 className="mt-5 font-display text-4xl font-bold text-cyan-950">CareConnect Maharashtra</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-cyan-900">
        Rural referral tracking and continuity of care. Not a hospital-booking app — we follow the patient until the journey is closed.
      </p>
      <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
        Synthetic demo data
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="card-soft p-4">
          <Route className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Continuity rail</p>
          <p className="text-xs text-cyan-800">Created to Closed, with a public Referral ID.</p>
        </article>
        <article className="card-soft p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Priority only</p>
          <p className="text-xs text-cyan-800">AI triage never names a diagnosis.</p>
        </article>
        <article className="card-soft p-4">
          <MapPinned className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Public facilities</p>
          <p className="text-xs text-cyan-800">Ranked by distance, care level and service.</p>
        </article>
      </div>
      <Link
        href="/login"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-white shadow-soft"
      >
        Sign in to the demo
      </Link>
      <p className="mt-8 text-sm font-medium text-cyan-950">
        We don&apos;t just help a rural patient find a hospital. We track whether the patient actually completes the care journey.
      </p>
    </main>
  );
}
