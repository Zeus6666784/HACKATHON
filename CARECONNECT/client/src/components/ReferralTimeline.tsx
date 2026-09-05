"use client";

import { Calendar, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { t } from "@/lib/i18n";

export function ReferralTimeline({ events, locale }: { events: any[], locale: string }) {
  return (
    <section className="card-soft p-5">
      <h2 className="font-display text-lg font-semibold mb-4">{t(locale, "timeline")}</h2>
      <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/30">
        {events && events.length > 0 ? (
          <>
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-8">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-primary shadow-sm ring-1 ring-primary/20" />

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-cyan-950">{event.toStatus}</span>
                    <StatusBadge status={event.toStatus} locale={locale} />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-cyan-700">
                    <Calendar className="h-3 w-3" />
                    <span>{event.actorName} · {new Date(event.createdAt).toLocaleString()}</span>
                  </div>

                  {event.note && (
                    <p className="mt-1 text-sm text-cyan-900 leading-relaxed">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Current State Marker */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm ring-1 ring-green-200" />
              <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Current State
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-cyan-700">{t(locale, "noEvents")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
