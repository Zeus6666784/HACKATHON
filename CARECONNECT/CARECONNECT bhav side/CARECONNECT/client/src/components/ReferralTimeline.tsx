import { Clock, Shield, User, ArrowRight } from "lucide-react";
import type { ReferralEvent, ReferralStatus } from "../types";
import { StatusBadge } from "./common/StatusBadge";

export type { ReferralEvent };

export function ReferralTimeline({ events }: { events: ReferralEvent[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Immutable Referral Event Audit Log</h2>
            <p className="text-xs text-slate-500">Chronological state transitions &amp; clinical handover records</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
          {events.length} Event{events.length === 1 ? "" : "s"} Logged
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {events.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            No referral events recorded yet. Transitions will appear here in real-time.
          </p>
        ) : (
          events.map((evt, idx) => {
            const isLatest = idx === events.length - 1;

            return (
              <div key={evt.event_id} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-transparent last:pb-0">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${
                  isLatest ? "bg-teal-600 ring-4 ring-teal-100" : "bg-slate-300"
                }`} />

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-800 uppercase">
                        {evt.event_type.replace(/_/g, " ")}
                      </span>
                      {evt.previous_status && evt.new_status && (
                        <div className="flex items-center gap-1 text-xs">
                          <StatusBadge value={evt.previous_status} size="sm" showIcon={false} />
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <StatusBadge value={evt.new_status} size="sm" />
                        </div>
                      )}
                      {!evt.previous_status && evt.new_status && (
                        <StatusBadge value={evt.new_status} size="sm" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(evt.timestamp).toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  {evt.notes && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed font-serif">
                      "{evt.notes}"
                    </p>
                  )}

                  {evt.performed_by && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Authorized Officer ID: <strong className="font-mono text-slate-700">{evt.performed_by}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
